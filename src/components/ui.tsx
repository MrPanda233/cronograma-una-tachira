import { createContext, useContext, type ReactNode } from 'react';
import { m } from 'motion/react';
import { AlarmClock, CalendarClock, Check, Clock, Copy, type LucideIcon } from 'lucide-react';
import { DEFAULT_COLOR, SUBJECT_COLOR } from '../data/careers';

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface Ui {
  notify: (title: string, subtitle: string) => void;
  copy: (text: string, label?: string) => void;
  copied: string | null;
}

export const UiContext = createContext<Ui>({ notify: () => {}, copy: () => {}, copied: null });
export const useUi = () => useContext(UiContext);

export function StatusBadge({ days, verb }: { days: number; verb?: string }) {
  const soon = days <= 7;
  const Icon: LucideIcon = days === 0 ? AlarmClock : soon ? Clock : CalendarClock;
  const className = days === 0
    ? 'bg-red-600 text-white'
    : soon
      ? 'bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300'
      : 'bg-blue-50 text-blue-900 ring-1 ring-inset ring-blue-200';
  const when = days === 0 ? 'hoy' : days === 1 ? 'mañana' : `en ${days} días`;
  const label = verb ? `${verb} ${when}` : when;
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold first-letter:uppercase ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" /> <span className="first-letter:uppercase">{label}</span>
    </span>
  );
}

export function SubjectTag({ code, children }: { code: string; children?: ReactNode }) {
  const { tag } = SUBJECT_COLOR[code] ?? DEFAULT_COLOR;
  return (
    <span className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ring-1 ring-inset ${tag}`}>
      {children ?? code}
    </span>
  );
}

export function SectionHeading({ Icon, title, aside }: { Icon: LucideIcon; title: string; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-bold text-ink sm:text-xl">
        <Icon className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" /> {title}
      </h2>
      {aside}
    </div>
  );
}

export function EmailLink({ email, className = '' }: { email: string; className?: string }) {
  return (
    <a href={`mailto:${email}`} className={`[overflow-wrap:anywhere] text-brand-700 underline decoration-brand-700/30 underline-offset-2 hover:decoration-brand-700 ${className}`}>
      {email}
    </a>
  );
}

export function CopyButton({ text, label, tone = 'light' }: { text: string; label?: string; tone?: 'light' | 'dark' }) {
  const { copy, copied } = useUi();
  const toneClass = tone === 'dark'
    ? 'text-blue-200 hover:bg-white/10 hover:text-white'
    : 'text-slate-500 hover:bg-blue-50 hover:text-brand-700';
  return (
    <button
      onClick={() => copy(text, label)}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors ${toneClass}`}
      aria-label={`Copiar ${text}`}
      title="Copiar"
    >
      {copied === text
        ? <Check className={`h-4 w-4 ${tone === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} aria-hidden="true" />
        : <Copy className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}

// Selector de opciones (carrera, semestre, tema). El resaltado se desliza entre opciones.
export function Chips<T extends string>({ value, options, onChange, id, label }: {
  value: T;
  options: { id: T; label: string; hint?: string }[];
  onChange: (id: T) => void;
  id: string;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map(opt => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            className={`relative min-h-11 rounded-xl px-3.5 py-2 text-sm font-bold transition-colors ${active ? 'text-white' : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-brand-800 hover:ring-blue-300'}`}
          >
            {active && (
              <m.span
                layoutId={`chip-${id}`}
                className="absolute inset-0 rounded-xl bg-brand-700"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{opt.label}</span>
            {opt.hint && <span className={`relative ml-1.5 text-xs font-normal ${active ? 'text-blue-100' : 'text-slate-500'}`}>{opt.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}
