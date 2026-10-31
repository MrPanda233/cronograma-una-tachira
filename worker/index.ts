// Servidor de comentarios. Todo lo que no empieza por /api/ lo sirve Cloudflare como archivo estático.
//
// Capas contra spam y bots:
// 1. Captcha Turnstile verificado aquí en el servidor, en cada comentario.
// 2. Campo trampa invisible y tiempo mínimo de escritura.
// 3. Límites por visitante y límite global.
// 4. Filtro de groserías, enlaces, correos, cédulas y teléfonos.
// 5. Comentarios repetidos bloqueados.
// 6. Solo nicks predeterminados.
// 7. Oculto automático con 3 reportes de personas distintas.
// No se guarda la IP: solo una huella cifrada que no se puede revertir.
import { MIN_FILL_MS, REACTIONS, isNick, type CommentDto, type CommentsPage } from '../shared/comments';
import { fingerprint, reviewBody } from './moderation';

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  TURNSTILE_SECRET?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_HOST?: string;
  COMMENTS_OPEN?: string;
}

interface CommentRow {
  id: string;
  parent_id: string | null;
  nick: string;
  tag: string;
  body: string;
  created_at: number;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const PAGE_SIZE = 20;
const MAX_REQUEST_BYTES = 4096;
const REPORTS_TO_HIDE = 3;

const LIMITS = {
  commentsShort: { max: 3, window: 10 * MINUTE },
  commentsDay: { max: 12, window: DAY },
  commentsGlobal: { max: 40, window: 10 * MINUTE },
  reactions: { max: 40, window: 10 * MINUTE },
  reportsDay: { max: 5, window: DAY },
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'same-origin',
    },
  });

const fail = (error: string, status = 400) => json({ error }, status);

const toHex = (buffer: ArrayBuffer) => [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');

// Huella del visitante: IP y navegador, cifrados con una clave secreta. No se guarda la IP.
async function visitorId(request: Request, env: Env) {
  if (!env.TURNSTILE_SECRET) return '';
  const ip = request.headers.get('CF-Connecting-IP') ?? 'local';
  const agent = request.headers.get('User-Agent') ?? '';
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.TURNSTILE_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ip}|${agent}`));
  return toHex(signature).slice(0, 32);
}

const canPost = (env: Env) => env.COMMENTS_OPEN !== 'false' && Boolean(env.TURNSTILE_SECRET && env.TURNSTILE_SITE_KEY);

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

async function verifyTurnstile(token: string, request: Request, env: Env) {
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET ?? '');
  form.append('response', token);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) form.append('remoteip', ip);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const result = await response.json<{ success: boolean; hostname?: string }>();
  if (!result.success) return false;
  return !env.TURNSTILE_HOST || result.hostname === env.TURNSTILE_HOST;
}

async function listComments(url: URL, visitor: string, env: Env): Promise<CommentsPage> {
  const cursor = Number(url.searchParams.get('cursor')) || Number.MAX_SAFE_INTEGER;
  const { results: top } = await env.DB
    .prepare(`SELECT id, parent_id, nick, tag, body, created_at FROM comments
              WHERE status = 'visible' AND parent_id IS NULL AND created_at < ?
              ORDER BY created_at DESC LIMIT ?`)
    .bind(cursor, PAGE_SIZE + 1)
    .all<CommentRow>();

  const hasMore = top.length > PAGE_SIZE;
  const page = top.slice(0, PAGE_SIZE);
  const page_ids = page.map(c => c.id);
  const marks = page_ids.map(() => '?').join(',');

  const replies = page_ids.length === 0 ? [] : (await env.DB
    .prepare(`SELECT id, parent_id, nick, tag, body, created_at FROM comments
              WHERE status = 'visible' AND parent_id IN (${marks}) ORDER BY created_at ASC`)
    .bind(...page_ids)
    .all<CommentRow>()).results;

  const allIds = [...page_ids, ...replies.map(r => r.id)];
  const allMarks = allIds.map(() => '?').join(',');
  const reactions = allIds.length === 0 ? [] : (await env.DB
    .prepare(`SELECT comment_id, emoji, COUNT(*) AS n, MAX(visitor = ?) AS own FROM reactions
              WHERE comment_id IN (${allMarks}) GROUP BY comment_id, emoji`)
    .bind(visitor, ...allIds)
    .all<{ comment_id: string; emoji: string; n: number; own: number }>()).results;

  const toDto = (row: CommentRow): CommentDto => {
    const own = reactions.filter(r => r.comment_id === row.id);
    return {
      id: row.id,
      parentId: row.parent_id,
      nick: row.nick,
      tag: row.tag,
      body: row.body,
      createdAt: row.created_at,
      reactions: Object.fromEntries(own.map(r => [r.emoji, r.n])),
      mine: own.filter(r => r.own).map(r => r.emoji),
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
    siteKey: canPost(env) ? env.TURNSTILE_SITE_KEY ?? null : null,
  };
}

async function createComment(request: Request, visitor: string, env: Env) {
  const data = await readJson(request);
  if (!data) return fail('No se pudo leer el comentario.');

  // Los bots llenan el campo invisible. Se les responde como si hubiera funcionado.
  if (data.website) return json({ ok: true, ignored: true });

  if (typeof data.startedAt !== 'number' || Date.now() - data.startedAt < MIN_FILL_MS) {
    return fail('Espera unos segundos antes de enviar.', 429);
  }
  if (!isNick(data.nick)) return fail('Elige uno de los nombres de la lista.');
  if (typeof data.body !== 'string') return fail('Escribe tu comentario.');

  const body = data.body.trim();
  const rejection = reviewBody(body);
  if (rejection) return fail(rejection, 422);

  const now = Date.now();
  const mine = `SELECT COUNT(*) AS n FROM comments WHERE visitor = ? AND created_at > ?`;
  if (await countSince(env, mine, visitor, now - LIMITS.commentsShort.window) >= LIMITS.commentsShort.max) {
    return fail('Vas muy rápido. Espera unos minutos para comentar otra vez.', 429);
  }
  if (await countSince(env, mine, visitor, now - LIMITS.commentsDay.window) >= LIMITS.commentsDay.max) {
    return fail('Llegaste al límite de comentarios de hoy.', 429);
  }
  if (await countSince(env, `SELECT COUNT(*) AS n FROM comments WHERE created_at > ?`, now - LIMITS.commentsGlobal.window) >= LIMITS.commentsGlobal.max) {
    return fail('Hay muchos comentarios en este momento. Intenta en unos minutos.', 429);
  }

  const print = fingerprint(body);
  if (await countSince(env, `SELECT COUNT(*) AS n FROM comments WHERE fingerprint = ? AND created_at > ?`, print, now - DAY) > 0) {
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

  // El captcha va de último: su ficha es de un solo uso y no debe gastarse en un texto rechazado.
  if (typeof data.token !== 'string' || !data.token) return fail('Completa el captcha.', 403);
  if (!(await verifyTurnstile(data.token, request, env))) return fail('El captcha no se pudo verificar. Inténtalo otra vez.', 403);

  const id = crypto.randomUUID();
  const tag = visitor.slice(0, 3).toUpperCase();
  await env.DB
    .prepare(`INSERT INTO comments (id, parent_id, nick, tag, body, fingerprint, visitor, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, parentId, data.nick, tag, body, print, visitor, now)
    .run();

  const comment: CommentDto = { id, parentId, nick: data.nick, tag, body, createdAt: now, reactions: {}, mine: [], replies: [] };
  return json({ comment }, 201);
}

async function visibleComment(id: string, env: Env) {
  return env.DB.prepare(`SELECT id FROM comments WHERE id = ? AND status = 'visible'`).bind(id).first();
}

async function toggleReaction(id: string, request: Request, visitor: string, env: Env) {
  const data = await readJson(request);
  const emoji = data?.emoji;
  if (typeof emoji !== 'string' || !(REACTIONS as readonly string[]).includes(emoji)) return fail('Reacción no válida.');
  if (!(await visibleComment(id, env))) return fail('Ese comentario ya no está disponible.', 404);

  const now = Date.now();
  if (await countSince(env, `SELECT COUNT(*) AS n FROM reactions WHERE visitor = ? AND created_at > ?`, visitor, now - LIMITS.reactions.window) >= LIMITS.reactions.max) {
    return fail('Espera un momento antes de reaccionar otra vez.', 429);
  }

  const removed = await env.DB
    .prepare(`DELETE FROM reactions WHERE comment_id = ? AND emoji = ? AND visitor = ?`)
    .bind(id, emoji, visitor)
    .run();
  if (removed.meta.changes === 0) {
    await env.DB
      .prepare(`INSERT INTO reactions (comment_id, emoji, visitor, created_at) VALUES (?, ?, ?, ?)`)
      .bind(id, emoji, visitor, now)
      .run();
  }

  const { results } = await env.DB
    .prepare(`SELECT emoji, COUNT(*) AS n, MAX(visitor = ?) AS own FROM reactions WHERE comment_id = ? GROUP BY emoji`)
    .bind(visitor, id)
    .all<{ emoji: string; n: number; own: number }>();
  return json({
    reactions: Object.fromEntries(results.map(r => [r.emoji, r.n])),
    mine: results.filter(r => r.own).map(r => r.emoji),
  });
}

async function reportComment(id: string, visitor: string, env: Env) {
  if (!(await visibleComment(id, env))) return json({ ok: true });

  const now = Date.now();
  if (await countSince(env, `SELECT COUNT(*) AS n FROM reports WHERE visitor = ? AND created_at > ?`, visitor, now - LIMITS.reportsDay.window) >= LIMITS.reportsDay.max) {
    return fail('Llegaste al límite de reportes de hoy.', 429);
  }

  await env.DB
    .prepare(`INSERT OR IGNORE INTO reports (comment_id, visitor, created_at) VALUES (?, ?, ?)`)
    .bind(id, visitor, now)
    .run();
  const reports = await countSince(env, `SELECT COUNT(*) AS n FROM reports WHERE comment_id = ?`, id);
  const hidden = reports >= REPORTS_TO_HIDE;
  if (hidden) await env.DB.prepare(`UPDATE comments SET status = 'hidden' WHERE id = ?`).bind(id).run();
  return json({ ok: true, hidden });
}

async function handleApi(request: Request, env: Env) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean); // api, comments, id, acción
  if (parts[1] !== 'comments' || parts.length > 4) return fail('No encontrado.', 404);

  const visitor = await visitorId(request, env);

  if (request.method === 'GET' && parts.length === 2) return json(await listComments(url, visitor, env));
  if (request.method !== 'POST') return fail('Método no permitido.', 405);

  if (!sameOrigin(request)) return fail('Origen no permitido.', 403);
  if (!canPost(env)) return fail('Los comentarios están cerrados por ahora.', 503);

  if (parts.length === 2) return createComment(request, visitor, env);
  if (parts[3] === 'reaction') return toggleReaction(parts[2], request, visitor, env);
  if (parts[3] === 'report') return reportComment(parts[2], visitor, env);
  return fail('No encontrado.', 404);
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
