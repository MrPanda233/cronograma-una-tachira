import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Check, Clock3, Flag, MessageSquareText, MessagesSquare, RefreshCw, Reply, Send, ShieldCheck, Smile, SmilePlus, Undo2, X } from 'lucide-react';
import { MAX_BODY, MIN_BODY, MIN_FILL_MS, NICKS, REACTIONS, type CommentDto, type CommentsPage, type NickId } from '../../shared/comments';
import { EMOJI_GROUPS } from '../data/emojis';
import { EASE_OUT, SectionHeading, useUi } from './ui';

const STORAGE_NICK = 'comentarios-nick';
const STORAGE_RECENT = 'comentarios-emojis';
const REFRESH_MS = 45000;
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

// localStorage puede fallar en modo privado: nunca debe romper la página.
const readStorage = (key: string) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const writeStorage = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch { /* sin memoria local */ }
};

const nickInfo = (id: string) => NICKS.find(n => n.id === id) ?? { id, name: 'Estudiante', emoji: '🎓' };

const initialNick = (): NickId => {
  const saved = readStorage(STORAGE_NICK);
  const found = NICKS.find(n => n.id === saved);
  return (found ?? NICKS[Math.floor(Math.random() * NICKS.length)]).id;
};

const timeAgo = (timestamp: number, now: number) => {
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const minutes = Math.round((timestamp - now) / 60000);
  if (Math.abs(minutes) < 1) return 'ahora';
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(days, 'day');
  return new Date(timestamp).toLocaleDateString('es-VE');
};

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? 'No se pudo completar. Inténtalo otra vez.');
  return data;
}

let turnstileScript: Promise<void> | null = null;

// El captcha solo se descarga cuando alguien va a escribir.
const loadTurnstile = () => {
  turnstileScript ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { turnstileScript = null; reject(new Error('turnstile')); };
    document.head.appendChild(script);
  });
  return turnstileScript;
};

function Captcha({ siteKey, onToken, resetKey }: { siteKey: string; onToken: (token: string | null) => void; resetKey: number }) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile || widget.current) return;
        widget.current = window.turnstile.render(box.current, {
          sitekey: siteKey,
          action: 'comment',
          language: 'es',
          theme: 'light',
          size: 'flexible',
          callback: (token: string) => onToken(token),
          'expired-callback': () => onToken(null),
          'error-callback': () => onToken(null),
        });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, [siteKey, onToken]);

  useEffect(() => {
    if (resetKey > 0 && widget.current) window.turnstile?.reset(widget.current);
  }, [resetKey]);

  if (failed) return <p className="text-sm text-red-700">No se pudo cargar el captcha. Revisa tu conexión y recarga la página.</p>;
  return <div ref={box} className="min-h-[65px] w-full" />;
}

function EmojiPanel({ onPick }: { onPick: (emoji: string) => void }) {
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(readStorage(STORAGE_RECENT) ?? '[]') as string[]; } catch { return []; }
  });
  const [groupId, setGroupId] = useState(EMOJI_GROUPS[0].id);
  const group = EMOJI_GROUPS.find(g => g.id === groupId) ?? EMOJI_GROUPS[0];

  const pick = (emoji: string) => {
    onPick(emoji);
    const next = [emoji, ...recent.filter(e => e !== emoji)].slice(0, 16);
    setRecent(next);
    writeStorage(STORAGE_RECENT, JSON.stringify(next));
  };

  const grid = (emojis: string[]) => (
    <div className="grid grid-cols-8 gap-0.5 sm:grid-cols-10">
      {emojis.map(emoji => (
        <m.button
          key={emoji}
          type="button"
          onClick={() => pick(emoji)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className="flex aspect-square items-center justify-center rounded-lg text-xl hover:bg-blue-50"
          aria-label={`Agregar ${emoji}`}
        >
          {emoji}
        </m.button>
      ))}
    </div>
  );

  return (
    <m.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98, transition: { duration: 0.12 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      style={{ transformOrigin: 'bottom left' }}
      className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200"
    >
      <div className="flex border-b border-slate-100 px-1" role="tablist" aria-label="Grupos de emojis">
        {EMOJI_GROUPS.map(({ id, label, Icon }) => {
          const active = id === group.id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={label}
              title={label}
              onClick={() => setGroupId(id)}
              className={`relative flex min-h-11 flex-1 items-center justify-center transition-colors ${active ? 'text-brand-700' : 'text-slate-400 hover:text-slate-700'}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {active && <m.span layoutId="emoji-group" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-700" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            </button>
          );
        })}
      </div>
      <div className="max-h-56 overflow-y-auto p-2">
        {recent.length > 0 && group.id === EMOJI_GROUPS[0].id && (
          <div className="mb-2">
            <p className="mb-1 px-1 text-xs font-bold text-slate-500">Recientes</p>
            {grid(recent)}
          </div>
        )}
        <p className="mb-1 px-1 text-xs font-bold text-slate-500">{group.label}</p>
        {grid(group.emojis)}
      </div>
    </m.div>
  );
}

function NickPicker({ value, onChange, onClose }: { value: NickId; onChange: (id: NickId) => void; onClose: () => void }) {
  return (
    <m.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-ink">Elige tu nombre</p>
        <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-white" aria-label="Cerrar la lista de nombres">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
        {NICKS.map(nick => (
          <button
            key={nick.id}
            type="button"
            onClick={() => { onChange(nick.id); onClose(); }}
            aria-pressed={nick.id === value}
            className={`flex min-h-11 items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-sm font-bold transition-colors ${nick.id === value ? 'bg-brand-700 text-white' : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:ring-blue-300'}`}
          >
            <span className="text-lg" aria-hidden="true">{nick.emoji}</span> {nick.name}
          </button>
        ))}
      </div>
    </m.div>
  );
}

function Composer({ page, nick, onNick, parentId, onPosted, onCancel, autoFocus }: {
  page: CommentsPage;
  nick: NickId;
  onNick: (id: NickId) => void;
  parentId?: string;
  onPosted: (comment: CommentDto) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const { notify } = useUi();
  const area = useRef<HTMLTextAreaElement>(null);
  const trap = useRef<HTMLInputElement>(null);
  const startedAt = useRef<number | null>(null);
  const [body, setBody] = useState('');
  const [engaged, setEngaged] = useState(Boolean(autoFocus));
  const [showEmojis, setShowEmojis] = useState(false);
  const [showNicks, setShowNicks] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (autoFocus) area.current?.focus(); }, [autoFocus]);

  const begin = () => {
    startedAt.current ??= Date.now();
    setEngaged(true);
  };

  const insertEmoji = (emoji: string) => {
    begin();
    const el = area.current;
    const start = el?.selectionStart ?? body.length;
    const end = el?.selectionEnd ?? body.length;
    const next = `${body.slice(0, start)}${emoji}${body.slice(end)}`;
    if ([...next].length > MAX_BODY) return;
    setBody(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  const length = [...body.trim()].length;
  const canSend = length >= MIN_BODY && length <= MAX_BODY && Boolean(token) && !sending;
  const info = nickInfo(nick);

  const submit = async () => {
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      const wait = MIN_FILL_MS - (Date.now() - (startedAt.current ?? 0));
      if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
      const result = await post<{ comment?: CommentDto }>('/api/comments', {
        nick,
        body: body.trim(),
        token,
        parentId,
        startedAt: startedAt.current,
        website: trap.current?.value ?? '',
      });
      setBody('');
      setShowEmojis(false);
      startedAt.current = null;
      if (result.comment) onPosted(result.comment);
      notify(parentId ? 'Respuesta publicada' : 'Comentario publicado', info.name);
      onCancel?.();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo publicar.');
    } finally {
      setSending(false);
      setToken(null);
      setCaptchaReset(n => n + 1);
    }
  };

  return (
    <div className={parentId ? 'mt-3 rounded-2xl bg-slate-50 p-3' : 'rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5'}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setShowNicks(v => !v)}
          aria-expanded={showNicks}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-50 px-3 text-sm font-bold text-brand-800 transition-colors hover:bg-blue-100"
        >
          <span className="text-lg" aria-hidden="true">{info.emoji}</span> {info.name}
          <span className="font-normal text-brand-700">Cambiar</span>
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-slate-600 hover:bg-white">
            <Undo2 className="h-4 w-4" aria-hidden="true" /> Cancelar
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {showNicks && (
          <div className="mb-3">
            <NickPicker value={nick} onChange={onNick} onClose={() => setShowNicks(false)} />
          </div>
        )}
      </AnimatePresence>

      <label className="sr-only" htmlFor={parentId ? `resp-${parentId}` : 'nuevo-comentario'}>Tu comentario</label>
      <textarea
        ref={area}
        id={parentId ? `resp-${parentId}` : 'nuevo-comentario'}
        value={body}
        onChange={e => { begin(); setBody(e.target.value); setError(null); }}
        onFocus={begin}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void submit(); }}
        rows={parentId ? 2 : 3}
        maxLength={MAX_BODY * 2}
        placeholder={parentId ? 'Escribe tu respuesta' : 'Escribe tu comentario o tu duda'}
        className="w-full resize-y rounded-xl bg-white px-3 py-2.5 text-base text-ink ring-1 ring-inset ring-slate-300 transition-shadow placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 sm:text-sm"
      />

      {/* Campo trampa: las personas no lo ven; los bots lo llenan. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          No llenar este campo
          <input ref={trap} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-1 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setShowEmojis(v => !v)}
          aria-expanded={showEmojis}
          aria-label={showEmojis ? 'Cerrar emojis' : 'Abrir emojis'}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${showEmojis ? 'bg-blue-50 text-brand-700' : 'text-slate-500 hover:bg-blue-50 hover:text-brand-700'}`}
        >
          <Smile className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className={`text-xs tabular-nums ${length > MAX_BODY ? 'font-bold text-red-700' : 'text-slate-500'}`}>{length}/{MAX_BODY}</span>
      </div>

      <AnimatePresence initial={false}>
        {showEmojis && (
          <div className="mt-1">
            <EmojiPanel onPick={insertEmoji} />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {error && (
          <m.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-800 ring-1 ring-inset ring-red-200"
          >
            {error}
          </m.p>
        )}
      </AnimatePresence>

      {engaged && page.siteKey && (
        <div className="mt-3">
          <Captcha siteKey={page.siteKey} onToken={setToken} resetKey={captchaReset} />
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!canSend}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors ${canSend ? 'bg-brand-700 text-white hover:bg-brand-800' : 'cursor-not-allowed bg-slate-100 text-slate-500'}`}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {sending ? 'Publicando' : !engaged || length < MIN_BODY ? 'Publicar' : token ? 'Publicar' : 'Completa el captcha'}
        </button>
      </div>
    </div>
  );
}

function ReactionBar({ comment, onChange }: { comment: CommentDto; onChange: (reactions: Record<string, number>, mine: string[]) => void }) {
  const { notify } = useUi();
  const [open, setOpen] = useState(false);

  const toggle = async (emoji: string) => {
    setOpen(false);
    try {
      const result = await post<{ reactions: Record<string, number>; mine: string[] }>(`/api/comments/${comment.id}/reaction`, { emoji });
      onChange(result.reactions, result.mine);
    } catch (reason) {
      notify('No se pudo reaccionar', reason instanceof Error ? reason.message : '');
    }
  };

  const used = REACTIONS.filter(emoji => comment.reactions[emoji]);

  return (
    <div className="relative flex flex-wrap items-center gap-1.5">
      <AnimatePresence initial={false}>
        {used.map(emoji => {
          const mine = comment.mine.includes(emoji);
          return (
            <m.button
              key={emoji}
              layout
              type="button"
              onClick={() => void toggle(emoji)}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 520, damping: 24 }}
              aria-pressed={mine}
              aria-label={`${emoji} ${comment.reactions[emoji]} reacciones`}
              className={`inline-flex min-h-9 items-center gap-1 rounded-full px-2.5 text-sm tabular-nums transition-colors ${mine ? 'bg-blue-100 font-bold text-brand-800 ring-1 ring-inset ring-blue-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <span aria-hidden="true">{emoji}</span> {comment.reactions[emoji]}
            </m.button>
          );
        })}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label="Reaccionar"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-700"
      >
        <SmilePlus className="h-5 w-5" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, scale: 0.8, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
            transition={{ type: 'spring', stiffness: 520, damping: 30 }}
            style={{ transformOrigin: 'bottom left' }}
            className="absolute bottom-full left-0 z-10 mb-1 flex gap-0.5 rounded-full bg-white p-1 shadow-[0_8px_24px_-8px_rgba(15,34,58,0.35)] ring-1 ring-slate-200"
          >
            {REACTIONS.map(emoji => (
              <m.button
                key={emoji}
                type="button"
                onClick={() => void toggle(emoji)}
                whileHover={{ scale: 1.25, y: -2 }}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 520, damping: 20 }}
                aria-label={`Reaccionar con ${emoji}`}
                className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
              >
                {emoji}
              </m.button>
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CommentItem({ comment, now, page, nick, onNick, onUpdate, onReply, onRemoved, isReply }: {
  comment: CommentDto;
  now: number;
  page: CommentsPage;
  nick: NickId;
  onNick: (id: NickId) => void;
  onUpdate: (id: string, patch: Partial<CommentDto>) => void;
  onReply: (parentId: string, reply: CommentDto) => void;
  onRemoved: (id: string) => void;
  isReply?: boolean;
}) {
  const { notify } = useUi();
  const [replying, setReplying] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const info = nickInfo(comment.nick);

  const report = async () => {
    if (!confirming) { setConfirming(true); return; }
    setConfirming(false);
    try {
      const result = await post<{ hidden?: boolean }>(`/api/comments/${comment.id}/report`, {});
      notify('Reporte enviado', 'Gracias por avisar');
      if (result.hidden) onRemoved(comment.id);
    } catch (reason) {
      notify('No se pudo reportar', reason instanceof Error ? reason.message : '');
    }
  };

  return (
    <m.li
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12, transition: { duration: 0.16 } }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      className={isReply ? 'pt-3' : 'rounded-2xl bg-white p-4 ring-1 ring-slate-200'}
    >
      <div className="flex items-start gap-3">
        <span className={`flex shrink-0 items-center justify-center rounded-full bg-blue-50 ${isReply ? 'h-8 w-8 text-base' : 'h-10 w-10 text-xl'}`} aria-hidden="true">{info.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
            <span className="font-bold text-ink">{info.name}</span>
            <span className="text-xs tabular-nums text-slate-500" title="Identificador del visitante">#{comment.tag}</span>
            <time className="text-xs text-slate-500" dateTime={new Date(comment.createdAt).toISOString()}>{timeAgo(comment.createdAt, now)}</time>
          </p>
          <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 [overflow-wrap:anywhere]">{comment.body}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-1">
            <ReactionBar comment={comment} onChange={(reactions, mine) => onUpdate(comment.id, { reactions, mine })} />
            {!isReply && page.canPost && (
              <button type="button" onClick={() => setReplying(v => !v)} aria-expanded={replying} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-700">
                <Reply className="h-4 w-4" aria-hidden="true" /> Responder
              </button>
            )}
            <button
              type="button"
              onClick={() => void report()}
              onBlur={() => setConfirming(false)}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-sm transition-colors ${confirming ? 'bg-red-50 font-bold text-red-800' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <Flag className="h-3.5 w-3.5" aria-hidden="true" /> {confirming ? '¿Reportar?' : 'Reportar'}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {replying && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.14 } }}
                transition={{ duration: 0.24, ease: EASE_OUT }}
                className="overflow-hidden"
              >
                <Composer
                  page={page}
                  nick={nick}
                  onNick={onNick}
                  parentId={comment.id}
                  autoFocus
                  onPosted={reply => onReply(comment.id, reply)}
                  onCancel={() => setReplying(false)}
                />
              </m.div>
            )}
          </AnimatePresence>

          {comment.replies.length > 0 && (
            <ul className="mt-2 divide-y divide-slate-100 border-t border-slate-100">
              <AnimatePresence initial={false}>
                {comment.replies.map(reply => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    now={now}
                    page={page}
                    nick={nick}
                    onNick={onNick}
                    onUpdate={onUpdate}
                    onReply={onReply}
                    onRemoved={onRemoved}
                    isReply
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </m.li>
  );
}

const RULES = [
  'Respeta a todos. Sin groserías ni ofensas.',
  'No publiques tu cédula, teléfono ni correo.',
  'No se permiten enlaces.',
  'Eliges un nombre de la lista; no hace falta crear cuenta.',
];

const EMPTY_PAGE: CommentsPage = { comments: [], nextCursor: null, canPost: false, siteKey: null };

export function Comments() {
  const [page, setPage] = useState<CommentsPage>(EMPTY_PAGE);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [nick, setNickState] = useState<NickId>(initialNick);

  const setNick = useCallback((id: NickId) => {
    setNickState(id);
    writeStorage(STORAGE_NICK, id);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/comments');
      if (!response.ok) throw new Error('lista');
      const first = await response.json() as CommentsPage;
      setPage(current => {
        const fresh = new Set(first.comments.map(c => c.id));
        const older = current.comments.filter(c => !fresh.has(c.id) && c.createdAt < (first.comments[first.comments.length - 1]?.createdAt ?? 0));
        return { ...first, comments: [...first.comments, ...older], nextCursor: older.length > 0 ? current.nextCursor : first.nextCursor };
      });
      setNow(Date.now());
      setStatus('ready');
    } catch {
      setStatus(current => (current === 'ready' ? 'ready' : 'error'));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const loadMore = async () => {
    if (!page.nextCursor) return;
    setLoadingMore(true);
    try {
      const response = await fetch(`/api/comments?cursor=${page.nextCursor}`);
      const more = await response.json() as CommentsPage;
      setPage(current => ({ ...current, comments: [...current.comments, ...more.comments], nextCursor: more.nextCursor }));
    } finally {
      setLoadingMore(false);
    }
  };

  const patch = useCallback((id: string, change: Partial<CommentDto>) => {
    setPage(current => ({
      ...current,
      comments: current.comments.map(c => (c.id === id
        ? { ...c, ...change }
        : { ...c, replies: c.replies.map(r => (r.id === id ? { ...r, ...change } : r)) })),
    }));
  }, []);

  const addReply = useCallback((parentId: string, reply: CommentDto) => {
    setPage(current => ({
      ...current,
      comments: current.comments.map(c => (c.id === parentId || c.replies.some(r => r.id === parentId)
        ? { ...c, replies: [...c.replies, reply] }
        : c)),
    }));
  }, []);

  const remove = useCallback((id: string) => {
    setPage(current => ({
      ...current,
      comments: current.comments
        .filter(c => c.id !== id)
        .map(c => ({ ...c, replies: c.replies.filter(r => r.id !== id) })),
    }));
  }, []);

  const addComment = useCallback((comment: CommentDto) => {
    setPage(current => ({ ...current, comments: [comment, ...current.comments] }));
    setNow(Date.now());
  }, []);

  return (
    <section className="mb-10">
      <SectionHeading
        Icon={MessagesSquare}
        title="Comentarios"
        aside={(
          <button
            type="button"
            onClick={() => void refresh()}
            aria-label="Actualizar comentarios"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-white hover:text-brand-700"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      />
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-slate-600">
        Pregunta, comparte y ayuda a tus compañeros. Lo que escribas aquí es público y no lo revisa la UNA.
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <div className="min-w-0">
          {status === 'ready' && (page.canPost
            ? <Composer page={page} nick={nick} onNick={setNick} onPosted={addComment} />
            : (
              <p className="flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-sm text-amber-950 ring-1 ring-inset ring-amber-200">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                Los comentarios abren pronto. Por ahora solo se pueden leer.
              </p>
            ))}

          <div className="mt-4">
            {status === 'loading' && <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200">Cargando comentarios</p>}
            {status === 'error' && (
              <div className="rounded-2xl bg-white p-6 text-center ring-1 ring-slate-200">
                <p className="mb-3 text-sm text-slate-700">No se pudieron cargar los comentarios.</p>
                <button type="button" onClick={() => void refresh()} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3.5 text-sm font-bold text-brand-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-50">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" /> Intentar de nuevo
                </button>
              </div>
            )}
            {status === 'ready' && page.comments.length === 0 && (
              <div className="rounded-2xl bg-white p-6 text-center ring-1 ring-slate-200">
                <MessageSquareText className="mx-auto mb-2 h-6 w-6 text-slate-400" aria-hidden="true" />
                <p className="text-sm text-slate-700">Todavía no hay comentarios. Deja el primero.</p>
              </div>
            )}
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {page.comments.map(comment => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    now={now}
                    page={page}
                    nick={nick}
                    onNick={setNick}
                    onUpdate={patch}
                    onReply={addReply}
                    onRemoved={remove}
                  />
                ))}
              </AnimatePresence>
            </ul>
            {page.nextCursor && (
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={loadingMore}
                className="mt-3 flex min-h-12 w-full items-center justify-center rounded-2xl bg-white text-sm font-bold text-brand-700 ring-1 ring-slate-200 transition-colors hover:bg-blue-50"
              >
                {loadingMore ? 'Cargando' : 'Ver comentarios anteriores'}
              </button>
            )}
          </div>
        </div>

        <aside className="self-start rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
          <h3 className="mb-2 flex items-center gap-2 font-bold text-ink">
            <ShieldCheck className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" /> Reglas
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            {RULES.map(rule => (
              <li key={rule} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" /> {rule}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Un comentario con varios reportes se oculta solo.
          </p>
        </aside>
      </div>
    </section>
  );
}
