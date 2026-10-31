import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Check, Clock3, Flag, Loader2, Lock, MessageSquareText, MessagesSquare, Pencil, RefreshCw, Reply, Send, ShieldCheck, Smile, SmilePlus, Trash2, Undo2, X } from 'lucide-react';
import { MAX_BODY, MIN_BODY, MIN_FILL_MS, NICKS, REACTIONS, nickName, type CaptchaChallenge, type CommentDto, type CommentsPage, type Identity, type NickId } from '../../shared/comments';
import { EMOJI_GROUPS } from '../data/emojis';
import { Emoji, EmojiText } from './Emoji';
import { EASE_OUT, SectionHeading, useUi } from './ui';

// Con qué nombre comenta esta persona: el suyo si ya lo tiene, o el que le tocaría.
interface Author {
  nick: string;
  seq: number;
  locked: boolean;
  taken: Record<string, number>;
}

const STORAGE_NICK = 'comentarios-nick';
const STORAGE_RECENT = 'comentarios-emojis';
const STORAGE_DRAFT = 'comentarios-borrador';
const REFRESH_MS = 45000;

// localStorage puede fallar en modo privado: nunca debe romper la página.
const readStorage = (key: string) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const writeStorage = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch { /* sin memoria local */ }
};

const nickEmoji = (id: string) => NICKS.find(n => n.id === id)?.emoji ?? '🎓';

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

class CaptchaError extends Error {}

async function send<T>(method: 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({})) as T & { error?: string; captcha?: boolean };
  if (!response.ok) {
    const message = data.error ?? 'No se pudo completar. Inténtalo otra vez.';
    throw data.captcha ? new CaptchaError(message) : new Error(message);
  }
  return data;
}

const post = <T,>(path: string, body: unknown) => send<T>('POST', path, body);

type CaptchaStatus = 'loading' | 'ready' | 'checking' | 'correct' | 'failed';

// Se valida en el servidor en cuanto se escribe la respuesta completa, sin pulsar nada más.
function Captcha({ onPass, resetKey, inputId }: { onPass: (pass: string | null) => void; resetKey: number; inputId: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [status, setStatus] = useState<CaptchaStatus>('loading');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState(0);

  const load = useCallback(async (keepMessage = false) => {
    setStatus('loading');
    setValue('');
    onPass(null);
    if (!keepMessage) setMessage(null);
    try {
      const response = await fetch('/api/comments/captcha');
      if (!response.ok) throw new Error('captcha');
      setChallenge(await response.json() as CaptchaChallenge);
      setStatus('ready');
    } catch {
      setStatus('failed');
    }
  }, [onPass]);

  useEffect(() => { void load(); }, [load, resetKey]);

  const check = async (answer: string, current: CaptchaChallenge) => {
    setStatus('checking');
    try {
      const { pass } = await post<{ pass: string }>('/api/comments/captcha/check', { captcha: current.token, answer });
      setMessage(null);
      setStatus('correct');
      onPass(pass);
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Prueba con otro.');
      setErrors(n => n + 1);
      await load(true);
      input.current?.focus();
    }
  };

  const change = (raw: string) => {
    if (!challenge || status !== 'ready') return;
    const clean = challenge.kind === 'math' ? raw.replace(/\D/g, '') : raw.replace(/[^a-z]/gi, '').toUpperCase();
    const next = clean.slice(0, challenge.length);
    setValue(next);
    setMessage(null);
    if (next.length === challenge.length) void check(next, challenge);
  };

  if (status === 'failed') {
    return (
      <button type="button" onClick={() => void load()} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-brand-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-50">
        <RefreshCw className="h-4 w-4" aria-hidden="true" /> Cargar el captcha
      </button>
    );
  }

  if (status === 'correct') {
    return (
      <m.p
        role="status"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
        className="flex min-h-11 items-center gap-2 rounded-xl bg-emerald-50 px-3 text-sm font-bold text-emerald-800 ring-1 ring-inset ring-emerald-200"
      >
        <m.span
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 18 }}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
        >
          <Check className="h-4 w-4 stroke-[3]" aria-hidden="true" />
        </m.span>
        Captcha correcto
      </m.p>
    );
  }

  const checking = status === 'checking';

  return (
    <div>
      <div key={errors} className={`grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-end ${errors > 0 ? 'captcha-error' : ''}`}>
        <div className="min-w-0">
          <p className="mb-1 text-xs font-bold text-slate-600">{challenge?.prompt ?? 'Captcha'}</p>
          <div className="flex min-w-0 items-center gap-1">
            <div className="flex h-14 min-w-0 flex-1 items-center overflow-hidden rounded-xl bg-slate-100 sm:max-w-60 sm:flex-none">
              <AnimatePresence mode="wait" initial={false}>
                {challenge && (
                  <m.img
                    key={challenge.token}
                    src={challenge.image}
                    alt="Captcha"
                    width={challenge.width}
                    height={challenge.height}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.08 } }}
                    transition={{ duration: 0.18, ease: EASE_OUT }}
                    className="block h-auto max-h-14 w-auto max-w-full"
                    draggable={false}
                  />
                )}
              </AnimatePresence>
            </div>
            <button type="button" onClick={() => void load()} disabled={checking} aria-label="Cambiar captcha" title="Cambiar captcha" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-blue-50 hover:text-brand-700 disabled:opacity-50">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <label className="block min-w-0" htmlFor={inputId}>
          <span className="mb-1 block text-xs font-bold text-slate-600">Respuesta</span>
          <span className="relative block">
            <input
              ref={input}
              id={inputId}
              value={value}
              onChange={e => change(e.target.value)}
              readOnly={checking || status === 'loading'}
              aria-invalid={Boolean(message)}
              inputMode={challenge?.kind === 'math' ? 'numeric' : 'text'}
              enterKeyHint="done"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              className={`min-h-11 w-full rounded-xl bg-white px-3 text-base tracking-widest text-ink ring-1 ring-inset transition-shadow focus:outline-none focus:ring-2 sm:text-sm ${message ? 'ring-red-400 focus:ring-red-500' : 'ring-slate-300 focus:ring-brand-600'}`}
            />
            {checking && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-700" aria-hidden="true" />}
          </span>
        </label>
      </div>
      <p role="status" className="mt-1 min-h-5 text-sm font-bold text-red-700">{message}</p>
    </div>
  );
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
    <div className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))]">
      {emojis.map(emoji => (
        <m.button
          key={emoji}
          type="button"
          onClick={() => pick(emoji)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.82 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className="flex h-11 items-center justify-center rounded-lg hover:bg-blue-50"
          aria-label={`Agregar ${emoji}`}
        >
          <Emoji char={emoji} className="h-7 w-7" />
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
      className="origin-top overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200"
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
      <div className="max-h-60 overflow-y-auto overscroll-contain p-2">
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

function NickPicker({ value, taken, onChange, onClose }: { value: string; taken: Record<string, number>; onChange: (id: NickId) => void; onClose: () => void }) {
  return (
    <m.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink">Elige tu nombre</p>
          <p className="text-xs text-slate-600">Queda fijo cuando publiques.</p>
        </div>
        <button type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-white" aria-label="Cerrar la lista de nombres">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid max-h-60 grid-cols-[repeat(auto-fill,minmax(min(100%,11.5rem),1fr))] gap-1 overflow-y-auto overscroll-contain">
        {NICKS.map(nick => (
          <button
            key={nick.id}
            type="button"
            onClick={() => { onChange(nick.id); onClose(); }}
            aria-pressed={nick.id === value}
            className={`flex min-h-11 min-w-0 items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-sm font-bold transition-colors ${nick.id === value ? 'bg-brand-700 text-white' : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:ring-blue-300'}`}
          >
            <Emoji char={nick.emoji} className="h-6 w-6" />
            <span className="min-w-0 truncate">{nickName(nick.id, (taken[nick.id] ?? 0) + 1)}</span>
          </button>
        ))}
      </div>
    </m.div>
  );
}

function Composer({ author, onNick, parentId, onPosted, onCancel, autoFocus, draftKey }: {
  author: Author;
  onNick: (id: NickId) => void;
  parentId?: string;
  onPosted: (comment: CommentDto, me: Identity | null) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  draftKey?: string;
}) {
  const { notify } = useUi();
  const area = useRef<HTMLTextAreaElement>(null);
  const trap = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState(() => (draftKey ? readStorage(draftKey) ?? '' : ''));
  const startedAt = useRef<number | null>(body ? Date.now() : null);
  const [engaged, setEngaged] = useState(Boolean(autoFocus || body));
  const [showEmojis, setShowEmojis] = useState(false);
  const [showNicks, setShowNicks] = useState(false);
  const [pass, setPass] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (autoFocus) area.current?.focus(); }, [autoFocus]);

  const begin = () => {
    startedAt.current ??= Date.now();
    setEngaged(true);
  };

  const updateBody = (next: string) => {
    setBody(next);
    if (draftKey) writeStorage(draftKey, next);
  };

  const insertEmoji = (emoji: string) => {
    begin();
    const el = area.current;
    const start = el?.selectionStart ?? body.length;
    const end = el?.selectionEnd ?? body.length;
    const next = `${body.slice(0, start)}${emoji}${body.slice(end)}`;
    if ([...next].length > MAX_BODY) return;
    updateBody(next);
    requestAnimationFrame(() => el?.setSelectionRange(start + emoji.length, start + emoji.length));
  };

  const length = [...body.trim()].length;
  const textReady = length >= MIN_BODY && length <= MAX_BODY;
  const canSend = textReady && Boolean(pass) && !sending;
  const name = nickName(author.nick, author.seq);
  const emoji = nickEmoji(author.nick);
  const hint = !engaged ? null : !textReady ? 'Escribe tu comentario' : !pass ? 'Resuelve el captcha' : null;

  const submit = async () => {
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      const wait = MIN_FILL_MS - (Date.now() - (startedAt.current ?? 0));
      if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
      const result = await post<{ comment?: CommentDto; me?: Identity }>('/api/comments', {
        nick: author.nick,
        body: body.trim(),
        pass,
        parentId,
        startedAt: startedAt.current,
        website: trap.current?.value ?? '',
      });
      updateBody('');
      setShowEmojis(false);
      startedAt.current = null;
      if (result.comment) onPosted(result.comment, result.me ?? null);
      notify(parentId ? 'Respuesta publicada' : 'Comentario publicado', result.comment ? nickName(result.comment.nick, result.comment.seq) : name);
      setCaptchaReset(n => n + 1);
      onCancel?.();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo publicar.');
      // Si el problema fue del captcha, se pide uno nuevo. Si fue del texto, el captcha sigue sirviendo.
      if (reason instanceof CaptchaError) setCaptchaReset(n => n + 1);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={parentId ? 'mt-2 rounded-2xl bg-slate-50 p-3' : 'rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5'}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        {author.locked ? (
          <p className="inline-flex min-h-11 min-w-0 max-w-full items-center gap-2 rounded-xl bg-blue-50 px-3 text-sm font-bold text-brand-800">
            <Emoji char={emoji} className="h-6 w-6" />
            <span className="min-w-0 truncate">{name}</span>
            <Lock className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-label="Tu nombre es fijo" />
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setShowNicks(v => !v)}
            aria-expanded={showNicks}
            aria-label={`${name}. Cambiar`}
            className="inline-flex min-h-11 min-w-0 max-w-full items-center gap-2 rounded-xl bg-blue-50 px-3 text-sm font-bold text-brand-800 transition-colors hover:bg-blue-100"
          >
            <Emoji char={emoji} className="h-6 w-6" />
            <span className="min-w-0 truncate">{name}</span>
            <span className="shrink-0 font-normal text-brand-700">Cambiar</span>
          </button>
        )}
        {onCancel && (
          <button type="button" onClick={onCancel} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-slate-600 hover:bg-white">
            <Undo2 className="h-4 w-4" aria-hidden="true" /> Cancelar
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {showNicks && !author.locked && (
          <div className="mb-3">
            <NickPicker value={author.nick} taken={author.taken} onChange={onNick} onClose={() => setShowNicks(false)} />
          </div>
        )}
      </AnimatePresence>

      <label className="sr-only" htmlFor={parentId ? `resp-${parentId}` : 'nuevo-comentario'}>Tu comentario</label>
      <textarea
        ref={area}
        id={parentId ? `resp-${parentId}` : 'nuevo-comentario'}
        value={body}
        onChange={e => { begin(); updateBody(e.target.value); setError(null); }}
        onFocus={begin}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void submit(); }}
        rows={parentId ? 2 : 3}
        maxLength={MAX_BODY}
        placeholder={parentId ? 'Escribe tu respuesta' : 'Escribe tu comentario o tu duda'}
        className="block w-full resize-y rounded-xl bg-white px-3 py-2.5 text-base text-ink ring-1 ring-inset ring-slate-300 transition-shadow placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-600 sm:text-sm"
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
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2.5 text-sm font-bold transition-colors ${showEmojis ? 'bg-blue-50 text-brand-700' : 'text-slate-600 hover:bg-blue-50 hover:text-brand-700'}`}
        >
          <Smile className="h-5 w-5" aria-hidden="true" /> Emojis
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

      {engaged && (
        <div className="mt-3">
          <Captcha onPass={setPass} resetKey={captchaReset} inputId={parentId ? `captcha-${parentId}` : 'captcha-comentario'} />
        </div>
      )}

      <div className="mt-3 flex items-center justify-end gap-3">
        {hint && <p className="min-w-0 text-sm text-slate-600">{hint}</p>}
        <m.button
          type="button"
          onClick={() => void submit()}
          disabled={!canSend}
          animate={canSend ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors ${canSend ? 'bg-brand-700 text-white hover:bg-brand-800' : 'cursor-not-allowed bg-slate-100 text-slate-500'}`}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          {sending ? 'Publicando' : 'Publicar'}
        </m.button>
      </div>
    </div>
  );
}

function ReactionBar({ comment, onChange }: { comment: CommentDto; onChange: (reactions: Record<string, number>, mine: string | null) => void }) {
  const { notify } = useUi();
  const [open, setOpen] = useState(false);

  const toggle = async (emoji: string) => {
    setOpen(false);
    try {
      const result = await post<{ reactions: Record<string, number>; mine: string | null }>(`/api/comments/${comment.id}/reaction`, { emoji });
      onChange(result.reactions, result.mine);
    } catch (reason) {
      notify('No se pudo reaccionar', reason instanceof Error ? reason.message : '');
    }
  };

  const used = REACTIONS.filter(emoji => comment.reactions[emoji]);

  return (
    <>
      <AnimatePresence initial={false}>
        {used.map(emoji => {
          const mine = comment.mine === emoji;
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
              <Emoji char={emoji} className="h-[1.15rem] w-[1.15rem]" /> {comment.reactions[emoji]}
            </m.button>
          );
        })}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label="Reaccionar"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-slate-100 hover:text-brand-700 ${open ? 'bg-blue-50 text-brand-700' : 'text-slate-500'}`}
      >
        <SmilePlus className="h-5 w-5" aria-hidden="true" />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <m.div
            key="reacciones"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="order-last basis-full overflow-hidden"
          >
            <div className="flex flex-wrap gap-0.5 rounded-2xl bg-slate-50 p-1">
              {REACTIONS.map((emoji, index) => (
                <m.button
                  key={emoji}
                  type="button"
                  onClick={() => void toggle(emoji)}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 20, delay: index * 0.02 }}
                  aria-label={`Reaccionar con ${emoji}`}
                  aria-pressed={comment.mine === emoji}
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${comment.mine === emoji ? 'bg-blue-100 ring-1 ring-inset ring-blue-300' : ''}`}
                >
                  <Emoji char={emoji} className="h-7 w-7" />
                </m.button>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}

function EditBox({ comment, onSaved, onCancel }: { comment: CommentDto; onSaved: (body: string) => void; onCancel: () => void }) {
  const area = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState(comment.body);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const changed = body.trim() !== comment.body && [...body.trim()].length >= MIN_BODY;

  useEffect(() => { area.current?.focus(); }, []);

  const save = async () => {
    if (!changed || saving) return;
    setSaving(true);
    setError(null);
    try {
      const result = await send<{ body: string }>('PATCH', `/api/comments/${comment.id}`, { body: body.trim() });
      onSaved(result.body);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo guardar.');
      setSaving(false);
    }
  };

  return (
    <div className="mt-1">
      <label className="sr-only" htmlFor={`editar-${comment.id}`}>Editar comentario</label>
      <textarea
        ref={area}
        id={`editar-${comment.id}`}
        value={body}
        onChange={e => { setBody(e.target.value); setError(null); }}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void save(); }}
        rows={3}
        maxLength={MAX_BODY}
        className="block w-full resize-y rounded-xl bg-white px-3 py-2.5 text-base text-ink ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600 sm:text-sm"
      />
      {error && <p role="alert" className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-800 ring-1 ring-inset ring-red-200">{error}</p>}
      <div className="mt-2 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} className="inline-flex min-h-11 items-center rounded-xl px-3.5 text-sm font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
        <button
          type="button"
          onClick={() => void save()}
          disabled={!changed || saving}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-bold transition-colors ${changed && !saving ? 'bg-brand-700 text-white hover:bg-brand-800' : 'cursor-not-allowed bg-slate-100 text-slate-500'}`}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} {saving ? 'Guardando' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

function CommentItem({ comment, now, canPost, author, onNick, onUpdate, onReply, onRemoved, isReply }: {
  comment: CommentDto;
  now: number;
  canPost: boolean;
  author: Author;
  onNick: (id: NickId) => void;
  onUpdate: (id: string, patch: Partial<CommentDto>) => void;
  onReply: (parentId: string, reply: CommentDto, me: Identity | null) => void;
  onRemoved: (id: string) => void;
  isReply?: boolean;
}) {
  const { notify } = useUi();
  const [replying, setReplying] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [canEdit, setCanEdit] = useState(comment.editMsLeft > 0);
  const name = nickName(comment.nick, comment.seq);

  // El botón Editar desaparece solo cuando se cumplen los 15 minutos.
  useEffect(() => {
    setCanEdit(comment.editMsLeft > 0);
    if (comment.editMsLeft <= 0) return;
    const timer = setTimeout(() => setCanEdit(false), comment.editMsLeft);
    return () => clearTimeout(timer);
  }, [comment.editMsLeft]);

  const retire = (keepPlaceholder: boolean | undefined, removed: 'user' | 'reports') => {
    if (keepPlaceholder) onUpdate(comment.id, { removed, body: '', own: false, reactions: {}, mine: null });
    else onRemoved(comment.id);
  };

  const remove = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setConfirmDelete(false);
    try {
      const result = await send<{ keepPlaceholder?: boolean }>('DELETE', `/api/comments/${comment.id}`);
      notify('Comentario eliminado', name);
      retire(result.keepPlaceholder, 'user');
    } catch (reason) {
      notify('No se pudo eliminar', reason instanceof Error ? reason.message : '');
    }
  };

  const report = async () => {
    if (!confirming) { setConfirming(true); return; }
    setConfirming(false);
    try {
      const result = await post<{ hidden?: boolean; keepPlaceholder?: boolean }>(`/api/comments/${comment.id}/report`, {});
      notify('Reporte enviado', 'Gracias por avisar');
      if (result.hidden) retire(result.keepPlaceholder, 'reports');
    } catch (reason) {
      notify('No se pudo reportar', reason instanceof Error ? reason.message : '');
    }
  };

  // En celular las acciones y respuestas usan todo el ancho; desde tableta se alinean con el texto.
  const indent = isReply ? 'sm:pl-11' : 'sm:pl-[3.25rem]';

  return (
    <m.li
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12, transition: { duration: 0.16 } }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      className={isReply ? 'py-3 last:pb-0' : 'min-w-0 rounded-2xl bg-white p-4 ring-1 ring-slate-200'}
    >
      <div className="flex items-start gap-3">
        <span className={`flex shrink-0 items-center justify-center rounded-full bg-blue-50 ${isReply ? 'h-8 w-8' : 'h-10 w-10'}`}>
          <Emoji char={nickEmoji(comment.nick)} className={isReply ? 'h-5 w-5' : 'h-6 w-6'} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
            <span className="font-bold text-ink">{name}</span>
            <time className="text-xs text-slate-500" dateTime={new Date(comment.createdAt).toISOString()}>{timeAgo(comment.createdAt, now)}</time>
            {comment.edited && !comment.removed && <span className="text-xs text-slate-500">editado</span>}
            {comment.own && <span className="rounded bg-blue-50 px-1.5 text-xs font-bold text-brand-700">Tú</span>}
          </p>
          {comment.removed ? (
            <p className="mt-0.5 text-sm italic text-slate-500">
              {comment.removed === 'user' ? 'Su autor eliminó este comentario.' : 'Comentario retirado por reportes.'}
            </p>
          ) : editing ? (
            <EditBox
              comment={comment}
              onCancel={() => setEditing(false)}
              onSaved={body => { onUpdate(comment.id, { body, edited: true }); setEditing(false); notify('Comentario editado', name); }}
            />
          ) : (
            <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 [overflow-wrap:anywhere]"><EmojiText text={comment.body} /></p>
          )}
        </div>
      </div>

      {!comment.removed && !editing && (
        <div className={`mt-2 flex flex-wrap items-center gap-x-1 gap-y-1 ${indent}`}>
          <ReactionBar comment={comment} onChange={(reactions, mine) => onUpdate(comment.id, { reactions, mine })} />
          {!isReply && canPost && (
            <button type="button" onClick={() => setReplying(v => !v)} aria-expanded={replying} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-700">
              <Reply className="h-4 w-4" aria-hidden="true" /> Responder
            </button>
          )}
          {comment.own ? (
            <>
              {canEdit && (
                <button type="button" onClick={() => setEditing(true)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-700">
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Editar
                </button>
              )}
              <button
                type="button"
                onClick={() => void remove()}
                onBlur={() => setConfirmDelete(false)}
                aria-label={confirmDelete ? 'Confirmar eliminación' : 'Eliminar comentario'}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-sm transition-colors ${confirmDelete ? 'bg-red-50 font-bold text-red-800' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> {confirmDelete ? '¿Eliminar?' : 'Eliminar'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => void report()}
              onBlur={() => setConfirming(false)}
              aria-label={confirming ? 'Confirmar reporte' : 'Reportar comentario'}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-sm transition-colors ${confirming ? 'bg-red-50 font-bold text-red-800' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <Flag className="h-3.5 w-3.5" aria-hidden="true" /> {confirming ? '¿Reportar?' : 'Reportar'}
            </button>
          )}
        </div>
      )}

      <AnimatePresence initial={false}>
        {replying && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.14 } }}
            transition={{ duration: 0.24, ease: EASE_OUT }}
            className={`overflow-hidden ${indent}`}
          >
            <Composer
              author={author}
              onNick={onNick}
              parentId={comment.id}
              autoFocus
              onPosted={(reply, me) => onReply(comment.id, reply, me)}
              onCancel={() => setReplying(false)}
            />
          </m.div>
        )}
      </AnimatePresence>

      {comment.replies.length > 0 && (
        <ul className={`mt-2 divide-y divide-slate-100 border-t border-slate-100 ${indent}`}>
          <AnimatePresence initial={false}>
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                now={now}
                canPost={canPost}
                author={author}
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
    </m.li>
  );
}

const RULES = [
  'No publiques tu cédula, teléfono ni correo.',
  'No hace falta crear cuenta. El nombre que elijas será siempre el tuyo.',
  'Puedes editar un comentario durante 15 minutos y eliminarlo cuando quieras.',
];

const EMPTY_PAGE: CommentsPage = { comments: [], nextCursor: null, canPost: false, me: null, taken: {} };

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

  const addReply = useCallback((parentId: string, reply: CommentDto, me: Identity | null) => {
    setPage(current => ({
      ...current,
      me: me ?? current.me,
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

  const addComment = useCallback((comment: CommentDto, me: Identity | null) => {
    setPage(current => ({ ...current, me: me ?? current.me, comments: [comment, ...current.comments] }));
    setNow(Date.now());
  }, []);

  // El nombre lo decide el servidor en cuanto la persona comenta por primera vez.
  const author: Author = {
    nick: page.me?.nick ?? nick,
    seq: page.me?.seq ?? (page.taken[nick] ?? 0) + 1,
    locked: Boolean(page.me),
    taken: page.taken,
  };

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
        Lo que escribas aquí es público.
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <div className="min-w-0">
          {status === 'ready' && (page.canPost
            ? <Composer author={author} onNick={setNick} onPosted={addComment} draftKey={STORAGE_DRAFT} />
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
                    canPost={page.canPost}
                    author={author}
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

        <aside className="min-w-0 self-start rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
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
        </aside>
      </div>
    </section>
  );
}
