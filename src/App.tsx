import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, m } from 'motion/react';
import {
  AlarmClock, Archive, BellRing, BookOpen, CalendarClock, CalendarDays, Check, ChevronDown, Clock, Copy,
  ExternalLink, FileText, FolderOpen, Globe, GraduationCap, Info, Laptop, Mail, Users,
  type LucideIcon,
} from 'lucide-react';
import {
  ADVISORS, BLOG_116_URL, BLOG_MATE_URL, EVALUATIONS, OFFICIAL_LINKS, SEDE_EMAIL, SUBJECT_TAG,
  type Evaluation,
} from './data';

type Tab = 'cronograma' | 'recursos' | 'asesores';

const TABS: { id: Tab; label: string; short: string; Icon: LucideIcon }[] = [
  { id: 'cronograma', label: 'Cronograma general', short: 'Cronograma', Icon: CalendarDays },
  { id: 'recursos', label: 'Enlaces oficiales', short: 'Enlaces', Icon: BookOpen },
  { id: 'asesores', label: 'Directorio de asesores', short: 'Asesores', Icon: Users },
];

const loadMotionFeatures = () => import('./motion-features').then(mod => mod.default);

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Fecha de hoy en Venezuela (America/Caracas) como YYYY-MM-DD.
const getCaracasDateKey = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Caracas', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
};

const daysBetween = (fromKey: string, toKey: string) => {
  const toUtc = (k: string) => Date.UTC(+k.slice(0, 4), +k.slice(5, 7) - 1, +k.slice(8, 10));
  return Math.round((toUtc(toKey) - toUtc(fromKey)) / 86400000);
};

const formatDate = (dateStr: string) => dateStr.split('-').reverse().join('/');

const formatWeekday = (dateStr: string) =>
  new Intl.DateTimeFormat('es-VE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
    .format(new Date(`${dateStr}T12:00:00Z`));

type Status = { label: string; className: string; Icon: LucideIcon };

const getStatus = (days: number): Status => {
  if (days === 0) return { label: 'Hoy', className: 'bg-red-600 text-white', Icon: AlarmClock };
  if (days === 1) return { label: 'Mañana', className: 'bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300', Icon: Clock };
  if (days <= 7) return { label: `En ${days} días`, className: 'bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300', Icon: Clock };
  return { label: `En ${days} días`, className: 'bg-blue-50 text-blue-900 ring-1 ring-inset ring-blue-200', Icon: CalendarClock };
};

function StatusBadge({ days }: { days: number }) {
  const { label, className, Icon } = getStatus(days);
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
    </span>
  );
}

function SubjectTag({ code, children }: { code: string; children?: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${SUBJECT_TAG[code] ?? 'bg-slate-100 text-slate-800 ring-slate-300'}`}>
      {children ?? code}
    </span>
  );
}

function SectionHeading({ Icon, title, aside }: { Icon: LucideIcon; title: string; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-bold text-ink sm:text-xl">
        <Icon className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" /> {title}
      </h2>
      {aside}
    </div>
  );
}

// Reloj aislado: se actualiza cada segundo sin volver a dibujar toda la página.
function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const text = new Intl.DateTimeFormat('es-VE', {
    timeZone: 'America/Caracas', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true,
  }).format(now);
  return <time className="tabular-nums">{text}</time>;
}

function EmailLink({ email, className = '' }: { email: string; className?: string }) {
  return (
    <a href={`mailto:${email}`} className={`[overflow-wrap:anywhere] text-brand-700 underline decoration-brand-700/30 underline-offset-2 hover:decoration-brand-700 ${className}`}>
      {email}
    </a>
  );
}

function CopyButton({ email, copied, onCopy, tone = 'light' }: { email: string; copied: boolean; onCopy: (e: string) => void; tone?: 'light' | 'dark' }) {
  const toneClass = tone === 'dark'
    ? 'text-blue-200 hover:bg-white/10 hover:text-white'
    : 'text-slate-500 hover:bg-blue-50 hover:text-brand-700';
  return (
    <button
      onClick={() => onCopy(email)}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors ${toneClass}`}
      aria-label={`Copiar ${email}`}
      title="Copiar correo"
    >
      {copied ? <Check className={`h-4 w-4 ${tone === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

export default function App() {
  const [todayStr, setTodayStr] = useState(() => getCaracasDateKey(new Date()));
  const [activeTab, setActiveTab] = useState<Tab>('cronograma');
  const [showPastEvals, setShowPastEvals] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; title: string; detail: string } | null>(null);

  // La fecha de referencia cambia a medianoche (hora de Venezuela).
  useEffect(() => {
    const timer = setInterval(() => setTodayStr(getCaracasDateKey(new Date())), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEmail(text);
      setToast({ id: Date.now(), title: 'Correo copiado', detail: text });
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch {
      setToast({ id: Date.now(), title: 'No se pudo copiar. Selecciona el correo a mano', detail: text });
    }
  };

  const upcomingEvals = EVALUATIONS.filter(e => e.dateStr >= todayStr).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  const pastEvals = EVALUATIONS.filter(e => e.dateStr < todayStr).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  const nextDate = upcomingEvals[0]?.dateStr;
  const nextEvals = upcomingEvals.filter(e => e.dateStr === nextDate);
  const daysToNext = nextDate ? daysBetween(todayStr, nextDate) : 0;
  const isToday = (ev: Evaluation) => ev.dateStr === todayStr;

  return (
    <LazyMotion features={loadMotionFeatures} strict>
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-canvas font-sans text-ink antialiased">

        {/* AVISO FLOTANTE (solo al copiar un correo) */}
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4 sm:inset-x-auto sm:right-5 sm:top-5 sm:bottom-auto" aria-live="polite">
          <AnimatePresence>
            {toast && (
              <m.div
                key={toast.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="flex max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-brand-950 px-4 py-3 text-white shadow-[0_12px_32px_-8px_rgba(8,34,56,0.5)]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check className="h-4 w-4 stroke-[3]" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-bold">{toast.title}</span>
                  <span className="truncate text-xs text-blue-100/80">{toast.detail}</span>
                </span>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        {/* CABECERA */}
        <header className="w-full bg-gradient-to-br from-brand-800 to-brand-600 px-4 pb-8 pt-7 text-center text-white sm:px-6 md:pb-10 md:pt-9">
          <GraduationCap className="mx-auto mb-3 h-9 w-9 text-blue-100" strokeWidth={1.75} aria-hidden="true" />
          <h1 className="text-balance text-[1.75rem] font-extrabold leading-tight tracking-tight sm:text-4xl">
            Cronograma de entregas
          </h1>
          <p className="mt-1 text-base font-bold text-blue-100 sm:text-lg">Lapso 2026-2, Semestre I</p>
          <p className="mx-auto mt-3 max-w-xl text-balance text-sm text-blue-50 sm:text-base">
            Hecho por estudiantes, para estudiantes del Centro Local Táchira
          </p>
          <p className="mx-auto mt-1 max-w-xl text-balance text-xs text-blue-100/90 sm:text-sm">
            TSU Higiene y Seguridad Industrial (281) e Ingeniería Industrial (280)
          </p>

          <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row sm:flex-wrap">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-950/30 px-3.5 py-1.5 text-xs font-bold text-cyan-100 ring-1 ring-inset ring-white/15 sm:text-sm">
              <Clock className="h-4 w-4 shrink-0" aria-hidden="true" /> <LiveClock />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3.5 py-1.5 text-xs text-amber-50 ring-1 ring-inset ring-amber-200/30 sm:text-sm">
              <CalendarClock className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="text-balance">Atención: <strong>viernes 1 a 5 p. m. y sábados 8 a. m. a 12 m.</strong></span>
            </div>
          </div>
        </header>

        {/* AVISO DE SITIO NO OFICIAL */}
        <div className="w-full border-b border-amber-200 bg-amber-50 text-amber-950" role="note">
          <div className="mx-auto flex max-w-6xl items-start justify-center gap-2 px-4 py-2.5 text-xs leading-relaxed sm:items-center sm:px-6">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 sm:mt-0" aria-hidden="true" />
            <p>
              <strong>Sitio no oficial.</strong> No pertenece a la Universidad Nacional Abierta ni al Centro Local Táchira. Confirma fechas e instrucciones con tu asesor.
            </p>
          </div>
        </div>

        {/* PESTAÑAS */}
        <nav className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85" aria-label="Secciones">
          <div className="mx-auto grid max-w-3xl grid-cols-3 px-1 sm:px-4">
            {TABS.map(({ id, label, short, Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex min-h-12 items-center justify-center gap-1.5 px-2 py-3 text-sm font-bold transition-colors sm:text-base ${active ? 'text-brand-800' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="sm:hidden">{short}</span>
                  <span className="hidden sm:inline">{label}</span>
                  {active && (
                    <m.span
                      layoutId="tab-underline"
                      className="absolute inset-x-3 -bottom-px h-[3px] rounded-full bg-brand-800"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <main className="mx-auto box-border w-full max-w-6xl px-4 py-6 sm:px-6 md:py-8">

          {/* PRÓXIMA ENTREGA */}
          {nextDate && (
            <m.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              aria-labelledby="proxima-entrega"
              className={`mb-6 rounded-2xl p-4 text-white shadow-[0_10px_30px_-12px_rgba(194,65,12,0.55)] sm:p-5 md:mb-8 ${daysToNext === 0 ? 'bg-red-700' : 'bg-orange-700'}`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  {daysToNext === 0 ? <AlarmClock className="h-5 w-5" aria-hidden="true" /> : <BellRing className="h-5 w-5" aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 id="proxima-entrega" className="text-base font-extrabold leading-snug sm:text-lg">
                    {daysToNext === 0 ? '¡Hay entregas hoy!' : daysToNext === 1 ? 'Próxima entrega: mañana' : `Próxima entrega en ${daysToNext} días`}
                  </h2>
                  <p className="text-sm text-orange-50 first-letter:uppercase">{formatWeekday(nextDate)}</p>
                  <ul className="mt-3 space-y-2">
                    {nextEvals.map(e => (
                      <li key={e.id} className="rounded-xl bg-black/15 p-3 text-sm">
                        <p className="font-bold">Asignatura {e.code} · {e.evalType}</p>
                        <p className="text-orange-50">{e.description}</p>
                        <a href={`mailto:${e.email}`} className="mt-1 inline-flex items-center gap-1.5 break-all text-amber-100 underline decoration-amber-100/40 underline-offset-2 hover:decoration-amber-100">
                          <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {e.email}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </m.section>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
            >
              {activeTab === 'cronograma' && (
                <>
                  {/* BLOGS */}
                  <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {[
                      { href: BLOG_116_URL, Icon: Laptop, title: 'Blog Informática 116', detail: 'Sitio del asesor Ing. Danny Colmenares' },
                      { href: BLOG_MATE_URL, Icon: BookOpen, title: 'Blog de Matemática y Repositorio UNA', detail: 'matematicaunatachira.blogspot.com' },
                    ].map(({ href, Icon, title, detail }) => (
                      <a
                        key={href}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(15,34,58,0.06),0_4px_12px_-6px_rgba(15,34,58,0.12)] ring-1 ring-slate-200 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:ring-blue-300 hover:shadow-[0_2px_4px_rgba(15,34,58,0.06),0_12px_24px_-12px_rgba(13,71,161,0.35)]"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold leading-snug text-brand-800 sm:text-base">{title}</span>
                            <span className="block truncate text-xs text-slate-600 sm:text-sm">{detail}</span>
                          </span>
                        </span>
                        <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-brand-700" aria-label="Abre en otra pestaña" />
                      </a>
                    ))}
                  </div>

                  {/* PRÓXIMAS ENTREGAS (lista única) */}
                  <SectionHeading
                    Icon={CalendarDays}
                    title="Próximas entregas"
                    aside={<span className="shrink-0 rounded-full bg-brand-700 px-2.5 py-0.5 text-xs font-bold text-white">{upcomingEvals.length} pendientes</span>}
                  />

                  {/* Celular: tarjetas */}
                  <ol className="mb-6 space-y-3 sm:hidden">
                    {upcomingEvals.map(ev => (
                      <li key={ev.id} className={`rounded-2xl bg-white p-4 ring-1 ${isToday(ev) ? 'ring-2 ring-red-500' : 'ring-slate-200'}`}>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-sm font-bold tabular-nums text-ink">{formatDate(ev.dateStr)} <span className="font-normal text-slate-500">· {ev.week}</span></span>
                          <StatusBadge days={daysBetween(todayStr, ev.dateStr)} />
                        </div>
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <SubjectTag code={ev.code} />
                          <span className="text-sm font-bold">{ev.subject}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-700"><strong className="text-ink">{ev.evalType}:</strong> {ev.description.replace(/^[^—]*—\s*/, '')}</p>
                        <div className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-600">
                          <p className="font-bold text-slate-800">{ev.advisor}</p>
                          <EmailLink email={ev.email} />
                        </div>
                      </li>
                    ))}
                  </ol>

                  {/* Computadora: tabla */}
                  <div className="mb-6 hidden w-full overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,34,58,0.06),0_8px_24px_-12px_rgba(15,34,58,0.15)] ring-1 ring-slate-200 sm:block">
                    <div className="w-full overflow-x-auto">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="bg-brand-700 text-white">
                            <th scope="col" className="px-4 py-3 font-bold">Fecha límite</th>
                            <th scope="col" className="px-4 py-3 font-bold">Asignatura</th>
                            <th scope="col" className="px-4 py-3 font-bold">Evaluación</th>
                            <th scope="col" className="px-4 py-3 font-bold">Asesor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {upcomingEvals.map(ev => (
                            <tr key={ev.id} className={`align-top transition-colors hover:bg-blue-50/50 ${isToday(ev) ? 'bg-red-50' : ''}`}>
                              <td className="whitespace-nowrap px-4 py-3.5">
                                <p className="font-bold tabular-nums">{formatDate(ev.dateStr)}</p>
                                <p className="mb-1.5 text-xs text-slate-500">{ev.week}</p>
                                <StatusBadge days={daysBetween(todayStr, ev.dateStr)} />
                              </td>
                              <td className="px-4 py-3.5">
                                <SubjectTag code={ev.code} />
                                <p className="mt-1 max-w-[12rem] text-sm font-bold leading-snug">{ev.subject}</p>
                              </td>
                              <td className="px-4 py-3.5">
                                <p className="font-bold">{ev.evalType}</p>
                                <p className="max-w-md leading-relaxed text-slate-700">{ev.description.replace(/^[^—]*—\s*/, '')}</p>
                              </td>
                              <td className="px-4 py-3.5 text-sm">
                                <p className="font-bold text-slate-800">{ev.advisor}</p>
                                <EmailLink email={ev.email} className="whitespace-nowrap text-xs [word-break:normal]" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {upcomingEvals.length === 0 && (
                    <p className="mb-6 rounded-2xl bg-white p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200">
                      No quedan entregas pendientes en este lapso. Revisa el historial más abajo.
                    </p>
                  )}

                  {/* ENTREGAS PASADAS */}
                  <div className="mb-10 w-full">
                    <button
                      onClick={() => setShowPastEvals(v => !v)}
                      aria-expanded={showPastEvals}
                      aria-controls="entregas-pasadas"
                      className="flex min-h-12 w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-2">
                        <Archive className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
                        {showPastEvals ? 'Ocultar entregas pasadas' : `Ver entregas pasadas (${pastEvals.length})`}
                      </span>
                      <m.span animate={{ rotate: showPastEvals ? 180 : 0 }} transition={{ duration: 0.2, ease: EASE_OUT }}>
                        <ChevronDown className="h-5 w-5 shrink-0" aria-hidden="true" />
                      </m.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {showPastEvals && (
                        <m.ul
                          id="entregas-pasadas"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                          transition={{ duration: 0.22, ease: EASE_OUT }}
                          className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200"
                        >
                          {pastEvals.map(ev => (
                            <li key={ev.id} className="flex flex-col gap-1 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:gap-4">
                              <span className="w-24 shrink-0 tabular-nums text-slate-500">{formatDate(ev.dateStr)}</span>
                              <span className="flex min-w-0 items-center gap-2">
                                <SubjectTag code={ev.code} />
                                <span><strong className="text-slate-700">{ev.evalType}:</strong> {ev.description.replace(/^[^—]*—\s*/, '')}</span>
                              </span>
                            </li>
                          ))}
                        </m.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {activeTab === 'recursos' && (
                <section className="mb-10">
                  <SectionHeading Icon={FolderOpen} title="Enlaces oficiales" />
                  <p className="-mt-2 mb-4 max-w-2xl text-sm text-slate-600">
                    Pensum, planes de curso, TP y TSP. Llevan a sitios de la UNA y de sus unidades; este portal solo los reúne y no los administra.
                  </p>
                  <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                    {OFFICIAL_LINKS.map(link => (
                      <li key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex min-h-14 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-blue-50/60"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <FileText className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
                            <span className="min-w-0">
                              <span className="block font-bold text-ink group-hover:text-brand-800">{link.title}</span>
                              <span className="block truncate text-xs text-slate-500">{link.host}</span>
                            </span>
                          </span>
                          <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-brand-700" aria-label="Abre en otra pestaña" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {activeTab === 'asesores' && (
                <section className="mb-10">
                  <SectionHeading Icon={Users} title="Directorio de asesores" />
                  <p className="-mt-2 mb-4 text-sm text-slate-600">Semestre I, carreras 281 y 280.</p>
                  <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                    {ADVISORS.map(adv => (
                      <li key={adv.email} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                        <div className="flex min-w-0 items-start gap-3">
                          <SubjectTag code={adv.code} />
                          <div className="min-w-0">
                            <p className="font-bold text-ink">{adv.name}</p>
                            <p className="text-sm text-slate-600">{adv.subject}</p>
                            {adv.link && (
                              <a href={adv.link} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline">
                                <Globe className="h-3.5 w-3.5" aria-hidden="true" /> Ver sitio del asesor
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 pl-11 sm:pl-0">
                          <EmailLink email={adv.email} className="text-xs sm:text-sm" />
                          <CopyButton email={adv.email} copied={copiedEmail === adv.email} onCopy={copyToClipboard} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </m.div>
          </AnimatePresence>
        </main>

        {/* PIE DE PÁGINA */}
        <footer className="mt-4 w-full bg-brand-950 text-blue-100/80">
          <div className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:px-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-xl space-y-2 text-sm leading-relaxed">
                <p className="text-base font-bold text-white">Cronograma de entregas, lapso 2026-2</p>
                <p>Hecho por estudiantes, para estudiantes del Centro Local Táchira.</p>
                <p>Por ahora reúne el Semestre I de las carreras TSU Higiene y Seguridad Industrial (281) e Ingeniería Industrial (280), que comparten asignaturas. Iremos sumando más carreras.</p>
              </div>
              <div className="space-y-1 text-sm md:text-right">
                <p>Envía copia de cada entrega al correo de la sede:</p>
                <div className="flex items-center gap-1 md:justify-end">
                  <a href={`mailto:${SEDE_EMAIL}`} className="inline-flex items-center gap-1.5 break-all font-bold text-white underline decoration-blue-300/50 underline-offset-4 hover:decoration-white">
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> {SEDE_EMAIL}
                  </a>
                  <CopyButton email={SEDE_EMAIL} copied={copiedEmail === SEDE_EMAIL} onCopy={copyToClipboard} tone="dark" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-4 text-xs text-blue-100/75 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl">
                <strong className="text-blue-50">Sitio no oficial.</strong> No pertenece ni está avalado por la Universidad Nacional Abierta (UNA) ni por el Centro Local Táchira. La información válida es la que publica cada asesor.
              </p>
              <p className="shrink-0">© 2026 Estudiantes del C.L. Táchira</p>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
    </LazyMotion>
  );
}
