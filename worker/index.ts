// Servidor de comentarios. Todo lo que no empieza por /api/ lo sirve Cloudflare como archivo estático.
//
// Capas contra spam y bots:
// 1. Captcha propio (worker/captcha.ts) verificado aquí en el servidor, en cada comentario.
// 2. Campo trampa invisible y tiempo mínimo de escritura.
// 3. Límites por visitante y límite global.
// 4. Filtro de código, groserías, enlaces, correos, cédulas y teléfonos.
// 5. Comentarios repetidos bloqueados.
// 6. Solo nicks predeterminados, y uno solo por persona.
// 7. Retiro automático al llegar al límite de reportes (REPORT_LIMIT).
//
// Quién es quién:
// - Sesión: cookie firmada por navegador, que JavaScript no puede leer. Decide de quién es cada
//   comentario, y por eso solo su autor puede editarlo o eliminarlo.
// - IP y dispositivo: se detectan, pero se guardan cifrados. Nunca se guarda la IP real.
import { MAX_EDITS, MIN_FILL_MS, REACTIONS, isNick, type CommentDto, type CommentsPage, type Identity } from '../shared/comments';
import { createChallenge, issuePass, readPass, readToken, sameText, sign } from './captcha';
import { fingerprint, reviewBody } from './moderation';

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  COMMENTS_OPEN?: string;
  REPORT_LIMIT?: string;
}

interface Visitor {
  session: string;
  cookie: string | null; // cookie por entregar si la sesión es nueva
  device: string;
  ipHash: string;
}

interface CommentRow {
  id: string;
  parent_id: string | null;
  nick: string;
  tag: string;
  body: string;
  created_at: number;
  status: string;
  owner: string | null;
  edited_at: number | null;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const PAGE_SIZE = 20;
const MAX_REQUEST_BYTES = 4096;
const DEFAULT_REPORT_LIMIT = 3;
const SESSION_DAYS = 365;
const COLUMNS = 'id, parent_id, nick, tag, body, created_at, status, owner, edited_at';

const LIMITS = {
  commentsShort: { max: 3, window: 10 * MINUTE },
  commentsDay: { max: 12, window: DAY },
  commentsGlobal: { max: 40, window: 10 * MINUTE },
  reactions: { max: 40, window: 10 * MINUTE },
  reportsDay: { max: 15, window: DAY },
  captchaFailures: { max: 8, window: 10 * MINUTE },
  identityMemory: { window: 30 * DAY },
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'same-origin',
      'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
    },
  });

const fail = (error: string, status = 400) => json({ error }, status);

let cachedKey: CryptoKey | null = null;

// Clave secreta de firmas. La genera y la guarda el propio servidor; nunca sale por la API.
async function signingKey(env: Env) {
  if (cachedKey) return cachedKey;
  const random = [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, '0')).join('');
  await env.DB.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES ('hmac', ?)`).bind(random).run();
  const row = await env.DB.prepare(`SELECT value FROM settings WHERE key = 'hmac'`).first<{ value: string }>();
  if (!row) throw new Error('sin clave de firmas');
  cachedKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(row.value), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return cachedKey;
}

async function readVisitor(request: Request, key: CryptoKey): Promise<Visitor> {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'local';
  const agent = request.headers.get('User-Agent') ?? '';
  const device = (await sign(key, `${ip}|${agent}`)).slice(0, 32);
  const ipHash = (await sign(key, `ip|${ip}`)).slice(0, 32);

  const saved = /(?:^|;\s*)sesion=([^;]+)/.exec(request.headers.get('Cookie') ?? '')?.[1];
  if (saved) {
    const [id, signature] = saved.split('.');
    if (id && signature && sameText(await sign(key, `sesion|${id}`), signature)) {
      return { session: id, cookie: null, device, ipHash };
    }
  }

  const session = crypto.randomUUID();
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  const value = `${session}.${await sign(key, `sesion|${session}`)}`;
  const cookie = `sesion=${value}; Path=/api; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; SameSite=Strict${secure}`;
  return { session, cookie, device, ipHash };
}

// El nombre queda fijo con el primer comentario. Si alguien borra la cookie o usa modo incógnito,
// el mismo navegador en la misma conexión conserva su nombre.
async function findIdentity(visitor: Visitor, env: Env): Promise<Identity | null> {
  const own = await env.DB.prepare(`SELECT nick, tag FROM identities WHERE id = ?`).bind(visitor.session).first<Identity>();
  if (own) return own;
  return env.DB
    .prepare(`SELECT nick, tag FROM identities WHERE device = ? AND created_at > ? ORDER BY created_at DESC LIMIT 1`)
    .bind(visitor.device, Date.now() - LIMITS.identityMemory.window)
    .first<Identity>();
}

const canPost = (env: Env) => env.COMMENTS_OPEN !== 'false';

const reportLimit = (env: Env) => {
  const limit = Number(env.REPORT_LIMIT);
  return Number.isInteger(limit) && limit > 0 ? limit : DEFAULT_REPORT_LIMIT;
};

const sameOrigin = (request: Request) => request.headers.get('Origin') === new URL(request.url).origin;

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) return null;
  const text = await request.text();
  if (text.length > MAX_REQUEST_BYTES) return null;
  try {
    const data: unknown = JSON.parse(text);
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function countSince(env: Env, sql: string, ...params: (string | number)[]) {
  const row = await env.DB.prepare(sql).bind(...params).first<{ n: number }>();
  return row?.n ?? 0;
}

const logAction = (env: Env, commentId: string, action: string, reports: number) =>
  env.DB.prepare(`INSERT INTO moderation_log (comment_id, action, reports, created_at) VALUES (?, ?, ?, ?)`)
    .bind(commentId, action, reports, Date.now())
    .run();

const retry = (error: string, status = 403) => json({ error, captcha: true }, status);

// Comprueba la respuesta en cuanto se escribe. Cada captcha sirve para un solo intento:
// si acierta entrega un pase para publicar; si falla, hay que resolver otro.
async function solveCaptcha(request: Request, visitor: Visitor, key: CryptoKey, env: Env) {
  const data = await readJson(request);
  const token = data?.captcha;
  const answer = data?.answer;
  if (typeof token !== 'string' || typeof answer !== 'string' || !answer.trim()) return retry('Completa el captcha.');

  const now = Date.now();
  const failures = await countSince(env, `SELECT COUNT(*) AS n FROM captcha_used WHERE visitor = ? AND ok = 0 AND expires_at > ?`, visitor.device, now);
  if (failures >= LIMITS.captchaFailures.max) return retry('Demasiados intentos. Espera unos minutos.', 429);

  const read = await readToken(key, token, answer);
  if (!read || !read.expiresAt) return retry('El captcha no es válido. Prueba con otro.');
  if (now > read.expiresAt) return retry('El captcha venció. Prueba con otro.');

  const used = await env.DB
    .prepare(`INSERT OR IGNORE INTO captcha_used (nonce, visitor, ok, expires_at) VALUES (?, ?, ?, ?)`)
    .bind(read.nonce, visitor.device, read.correct ? 1 : 0, read.expiresAt)
    .run();
  if (used.meta.changes === 0) return retry('Ese captcha ya se usó. Prueba con otro.');
  if (!read.correct) return retry('Incorrecto. Prueba con este otro.');

  await env.DB.prepare(`DELETE FROM captcha_used WHERE expires_at < ?`).bind(now).run();
  return json({ pass: await issuePass(key) });
}

// Gasta el pase: un captcha resuelto vale para un solo comentario.
async function usePass(pass: unknown, visitor: Visitor, key: CryptoKey, env: Env) {
  if (typeof pass !== 'string' || !pass) return retry('Resuelve el captcha para publicar.');
  const read = await readPass(key, pass);
  if (!read || !read.expiresAt) return retry('Resuelve el captcha para publicar.');
  if (Date.now() > read.expiresAt) return retry('El captcha venció. Resuelve otro.');
  const used = await env.DB
    .prepare(`INSERT OR IGNORE INTO captcha_used (nonce, visitor, ok, expires_at) VALUES (?, ?, 1, ?)`)
    .bind(read.nonce, visitor.device, read.expiresAt)
    .run();
  return used.meta.changes === 0 ? retry('Ese captcha ya se usó. Resuelve otro.') : null;
}

async function listComments(url: URL, visitor: Visitor, env: Env): Promise<CommentsPage> {
  const cursor = Number(url.searchParams.get('cursor')) || Number.MAX_SAFE_INTEGER;
  // Un comentario retirado sigue en la lista solo si tiene respuestas visibles.
  const { results: top } = await env.DB
    .prepare(`SELECT ${COLUMNS} FROM comments c
              WHERE c.parent_id IS NULL AND c.created_at < ?
                AND (c.status = 'visible' OR EXISTS (SELECT 1 FROM comments r WHERE r.parent_id = c.id AND r.status = 'visible'))
              ORDER BY c.created_at DESC LIMIT ?`)
    .bind(cursor, PAGE_SIZE + 1)
    .all<CommentRow>();

  const hasMore = top.length > PAGE_SIZE;
  const page = top.slice(0, PAGE_SIZE);
  const pageIds = page.map(c => c.id);
  const marks = pageIds.map(() => '?').join(',');

  const replies = pageIds.length === 0 ? [] : (await env.DB
    .prepare(`SELECT ${COLUMNS} FROM comments WHERE status = 'visible' AND parent_id IN (${marks}) ORDER BY created_at ASC`)
    .bind(...pageIds)
    .all<CommentRow>()).results;

  const allIds = [...pageIds, ...replies.map(r => r.id)];
  const allMarks = allIds.map(() => '?').join(',');
  const reactions = allIds.length === 0 ? [] : (await env.DB
    .prepare(`SELECT comment_id, emoji, COUNT(*) AS n, MAX(visitor = ?) AS own FROM reactions
              WHERE comment_id IN (${allMarks}) GROUP BY comment_id, emoji`)
    .bind(visitor.session, ...allIds)
    .all<{ comment_id: string; emoji: string; n: number; own: number }>()).results;

  const toDto = (row: CommentRow): CommentDto => {
    const removed = row.status === 'deleted' ? 'user' : row.status === 'hidden' ? 'reports' : null;
    const own = reactions.filter(r => r.comment_id === row.id);
    return {
      id: row.id,
      parentId: row.parent_id,
      nick: row.nick,
      tag: row.tag,
      body: removed ? '' : row.body,
      createdAt: row.created_at,
      edited: Boolean(row.edited_at),
      removed,
      own: !removed && row.owner === visitor.session,
      reactions: removed ? {} : Object.fromEntries(own.map(r => [r.emoji, r.n])),
      mine: own.find(r => r.own)?.emoji ?? null,
      replies: [],
    };
  };

  return {
    comments: page.map(row => ({
      ...toDto(row),
      replies: replies.filter(r => r.parent_id === row.id).map(toDto),
    })),
    nextCursor: hasMore ? page[page.length - 1].created_at : null,
    canPost: canPost(env),
    me: await findIdentity(visitor, env),
  };
}

async function createComment(request: Request, visitor: Visitor, key: CryptoKey, env: Env) {
  const data = await readJson(request);
  if (!data) return fail('No se pudo leer el comentario.');

  // Los bots llenan el campo invisible. Se les responde como si hubiera funcionado.
  if (data.website) return json({ ok: true, ignored: true });

  if (typeof data.startedAt !== 'number' || Date.now() - data.startedAt < MIN_FILL_MS) {
    return fail('Espera unos segundos antes de enviar.', 429);
  }

  // Quien ya comentó conserva su nombre, aunque el navegador pida otro.
  const identity = await findIdentity(visitor, env);
  const nick = identity?.nick ?? data.nick;
  if (!isNick(nick)) return fail('Elige uno de los nombres de la lista.');
  if (typeof data.body !== 'string') return fail('Escribe tu comentario.');

  const body = data.body.normalize('NFC').trim();
  const rejection = reviewBody(body);
  if (rejection) return fail(rejection, 422);

  const now = Date.now();
  const mine = `SELECT COUNT(*) AS n FROM comments WHERE visitor = ? AND created_at > ?`;
  if (await countSince(env, mine, visitor.device, now - LIMITS.commentsShort.window) >= LIMITS.commentsShort.max) {
    return fail('Vas muy rápido. Espera unos minutos para comentar otra vez.', 429);
  }
  if (await countSince(env, mine, visitor.device, now - LIMITS.commentsDay.window) >= LIMITS.commentsDay.max) {
    return fail('Llegaste al límite de comentarios de hoy.', 429);
  }
  if (await countSince(env, `SELECT COUNT(*) AS n FROM comments WHERE created_at > ?`, now - LIMITS.commentsGlobal.window) >= LIMITS.commentsGlobal.max) {
    return fail('Hay muchos comentarios en este momento. Intenta en unos minutos.', 429);
  }

  const print = fingerprint(body);
  if (await countSince(env, `SELECT COUNT(*) AS n FROM comments WHERE fingerprint = ? AND status = 'visible' AND created_at > ?`, print, now - DAY) > 0) {
    return fail('Ese comentario ya fue publicado.', 409);
  }

  let parentId: string | null = null;
  if (data.parentId !== undefined && data.parentId !== null) {
    if (typeof data.parentId !== 'string') return fail('No se encontró el comentario.', 404);
    const parent = await env.DB
      .prepare(`SELECT parent_id FROM comments WHERE id = ? AND status = 'visible'`)
      .bind(data.parentId)
      .first<{ parent_id: string | null }>();
    if (!parent) return fail('Ese comentario ya no está disponible.', 404);
    // Las respuestas tienen un solo nivel.
    parentId = parent.parent_id ?? data.parentId;
  }

  // El pase va de último: es de un solo uso y no debe gastarse en un texto rechazado.
  const passError = await usePass(data.pass, visitor, key, env);
  if (passError) return passError;

  const id = crypto.randomUUID();
  const tag = identity?.tag ?? visitor.device.slice(0, 3).toUpperCase();
  await env.DB.batch([
    env.DB.prepare(`INSERT OR IGNORE INTO identities (id, device, ip_hash, nick, tag, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(visitor.session, visitor.device, visitor.ipHash, nick, tag, now),
    env.DB.prepare(`INSERT INTO comments (id, parent_id, nick, tag, body, fingerprint, visitor, owner, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, parentId, nick, tag, body, print, visitor.device, visitor.session, visitor.ipHash, now),
  ]);

  const comment: CommentDto = { id, parentId, nick, tag, body, createdAt: now, edited: false, removed: null, own: true, reactions: {}, mine: null, replies: [] };
  return json({ comment, me: { nick, tag } }, 201);
}

async function editComment(id: string, request: Request, visitor: Visitor, env: Env) {
  const data = await readJson(request);
  if (typeof data?.body !== 'string') return fail('Escribe tu comentario.');

  const row = await env.DB
    .prepare(`SELECT owner, status, edits FROM comments WHERE id = ?`)
    .bind(id)
    .first<{ owner: string | null; status: string; edits: number }>();
  if (!row || row.status !== 'visible') return fail('Ese comentario ya no está disponible.', 404);
  if (row.owner !== visitor.session) return fail('Solo puedes editar tus propios comentarios.', 403);
  if (row.edits >= MAX_EDITS) return fail('Ya no puedes editar más este comentario.', 429);

  const body = data.body.normalize('NFC').trim();
  const rejection = reviewBody(body);
  if (rejection) return fail(rejection, 422);

  await env.DB
    .prepare(`UPDATE comments SET body = ?, fingerprint = ?, edited_at = ?, edits = edits + 1 WHERE id = ? AND owner = ?`)
    .bind(body, fingerprint(body), Date.now(), id, visitor.session)
    .run();
  return json({ body, edited: true });
}

// Al eliminar se borra el texto de verdad. La fila queda para no romper sus respuestas.
async function deleteComment(id: string, visitor: Visitor, env: Env) {
  const row = await env.DB
    .prepare(`SELECT owner, status FROM comments WHERE id = ?`)
    .bind(id)
    .first<{ owner: string | null; status: string }>();
  if (!row || row.status !== 'visible') return fail('Ese comentario ya no está disponible.', 404);
  if (row.owner !== visitor.session) return fail('Solo puedes eliminar tus propios comentarios.', 403);

  await env.DB
    .prepare(`UPDATE comments SET status = 'deleted', body = '', fingerprint = id WHERE id = ? AND owner = ?`)
    .bind(id, visitor.session)
    .run();
  const replies = await countSince(env, `SELECT COUNT(*) AS n FROM comments WHERE parent_id = ? AND status = 'visible'`, id);
  await logAction(env, id, 'eliminado por su autor', 0);
  return json({ ok: true, keepPlaceholder: replies > 0 });
}

// Como en WhatsApp: una sola reacción por persona. Otra emoción la reemplaza; la misma la quita.
async function setReaction(id: string, request: Request, visitor: Visitor, env: Env) {
  const data = await readJson(request);
  const emoji = data?.emoji;
  if (typeof emoji !== 'string' || !(REACTIONS as readonly string[]).includes(emoji)) return fail('Reacción no válida.');
  const exists = await env.DB.prepare(`SELECT id FROM comments WHERE id = ? AND status = 'visible'`).bind(id).first();
  if (!exists) return fail('Ese comentario ya no está disponible.', 404);

  const now = Date.now();
  if (await countSince(env, `SELECT COUNT(*) AS n FROM reactions WHERE visitor = ? AND created_at > ?`, visitor.session, now - LIMITS.reactions.window) >= LIMITS.reactions.max) {
    return fail('Espera un momento antes de reaccionar otra vez.', 429);
  }

  const current = await env.DB
    .prepare(`SELECT emoji FROM reactions WHERE comment_id = ? AND visitor = ?`)
    .bind(id, visitor.session)
    .first<{ emoji: string }>();
  if (current?.emoji === emoji) {
    await env.DB.prepare(`DELETE FROM reactions WHERE comment_id = ? AND visitor = ?`).bind(id, visitor.session).run();
  } else {
    await env.DB
      .prepare(`INSERT INTO reactions (comment_id, visitor, emoji, created_at) VALUES (?, ?, ?, ?)
                ON CONFLICT (comment_id, visitor) DO UPDATE SET emoji = excluded.emoji, created_at = excluded.created_at`)
      .bind(id, visitor.session, emoji, now)
      .run();
  }

  const { results } = await env.DB
    .prepare(`SELECT emoji, COUNT(*) AS n, MAX(visitor = ?) AS own FROM reactions WHERE comment_id = ? GROUP BY emoji`)
    .bind(visitor.session, id)
    .all<{ emoji: string; n: number; own: number }>();
  return json({
    reactions: Object.fromEntries(results.map(r => [r.emoji, r.n])),
    mine: results.find(r => r.own)?.emoji ?? null,
  });
}

// Retiro automático: al llegar al límite, el comentario se oculta solo y queda en el registro.
// Se cuenta una vez por IP para que una persona con varios navegadores no pueda bajar nada sola.
async function reportComment(id: string, visitor: Visitor, env: Env) {
  const row = await env.DB
    .prepare(`SELECT owner, status FROM comments WHERE id = ?`)
    .bind(id)
    .first<{ owner: string | null; status: string }>();
  if (!row || row.status !== 'visible') return json({ ok: true });
  if (row.owner === visitor.session) return fail('No puedes reportar tu propio comentario.', 403);

  const now = Date.now();
  if (await countSince(env, `SELECT COUNT(*) AS n FROM reports WHERE visitor = ? AND created_at > ?`, visitor.ipHash, now - LIMITS.reportsDay.window) >= LIMITS.reportsDay.max) {
    return fail('Llegaste al límite de reportes de hoy.', 429);
  }

  await env.DB
    .prepare(`INSERT OR IGNORE INTO reports (comment_id, visitor, created_at) VALUES (?, ?, ?)`)
    .bind(id, visitor.ipHash, now)
    .run();
  const reports = await countSince(env, `SELECT COUNT(*) AS n FROM reports WHERE comment_id = ?`, id);
  const hidden = reports >= reportLimit(env);
  if (hidden) {
    await env.DB.prepare(`UPDATE comments SET status = 'hidden' WHERE id = ? AND status = 'visible'`).bind(id).run();
    await logAction(env, id, 'retirado por reportes', reports);
  }
  const replies = hidden ? await countSince(env, `SELECT COUNT(*) AS n FROM comments WHERE parent_id = ? AND status = 'visible'`, id) : 0;
  return json({ ok: true, hidden, keepPlaceholder: replies > 0 });
}

async function route(request: Request, url: URL, visitor: Visitor, key: CryptoKey, env: Env) {
  const parts = url.pathname.split('/').filter(Boolean); // api, comments, id, acción
  const { method } = request;

  if (method === 'GET' && parts.length === 2) return json(await listComments(url, visitor, env));
  if (method === 'GET' && parts[2] === 'captcha' && parts.length === 3) return json(await createChallenge(key));
  if (method !== 'POST' && method !== 'PATCH' && method !== 'DELETE') return fail('Método no permitido.', 405);

  if (!sameOrigin(request)) return fail('Origen no permitido.', 403);
  if (!canPost(env)) return fail('Los comentarios están cerrados por ahora.', 503);

  if (method === 'POST') {
    if (parts.length === 2) return createComment(request, visitor, key, env);
    if (parts[2] === 'captcha' && parts[3] === 'check') return solveCaptcha(request, visitor, key, env);
    if (parts[3] === 'reaction') return setReaction(parts[2], request, visitor, env);
    if (parts[3] === 'report') return reportComment(parts[2], visitor, env);
  }
  if (method === 'PATCH' && parts.length === 3) return editComment(parts[2], request, visitor, env);
  if (method === 'DELETE' && parts.length === 3) return deleteComment(parts[2], visitor, env);
  return fail('No encontrado.', 404);
}

async function handleApi(request: Request, env: Env) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[1] !== 'comments' || parts.length > 4) return fail('No encontrado.', 404);

  const key = await signingKey(env);
  const visitor = await readVisitor(request, key);
  const response = await route(request, url, visitor, key, env);
  if (visitor.cookie) response.headers.append('Set-Cookie', visitor.cookie);
  return response;
}

export default {
  async fetch(request, env) {
    if (!new URL(request.url).pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      return await handleApi(request, env);
    } catch (error) {
      console.error('comentarios', error);
      return fail('Algo falló en el servidor. Inténtalo más tarde.', 500);
    }
  },
} satisfies ExportedHandler<Env>;
