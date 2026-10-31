import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, m } from 'motion/react';
import {
  BookOpen, CalendarClock, CalendarDays, Check, CircleHelp, Clock, GraduationCap, HardHat, Info, Mail, MessagesSquare, Users, Wrench,
  type LucideIcon,
} from 'lucide-react';
import { CareerView } from './components/CareerView';
import { Directory } from './components/Directory';
import { LinksView } from './components/LinksView';
import { ScheduleView } from './components/Schedule';
import { CopyButton, EASE_OUT, UiContext } from './components/ui';
import { ACTIVE_LAPSO, ACTIVE_SEMESTER } from './data/careers';
import { SEDE_EMAIL } from './data/people';
import { getCaracasDateKey } from './lib/dates';

type Tab = 'cronograma' | '281' | '280' | 'asesores' | 'ayuda' | 'enlaces' | 'comentarios';

const TABS: { id: Tab; label: string; short: string; toast: string; Icon: LucideIcon }[] = [
  { id: 'cronograma', label: 'Cronograma general', short: 'Cronograma', toast: 'Cronograma general', Icon: CalendarDays },
  { id: '281', label: 'TSU HSI (281)', short: '281', toast: 'TSU Higiene y Seguridad Industrial (281)', Icon: HardHat },
  { id: '280', label: 'Ing. Industrial (280)', short: '280', toast: 'Ingeniería Industrial (280)', Icon: Wrench },
  { id: 'asesores', label: 'Asesores', short: 'Asesores', toast: 'Directorio de asesores', Icon: Users },
  { id: 'ayuda', label: 'Ayuda', short: 'Ayuda', toast: 'Ayuda y preguntas', Icon: CircleHelp },
  { id: 'enlaces', label: 'Enlaces', short: 'Enlaces', toast: 'Enlaces oficiales', Icon: BookOpen },
  { id: 'comentarios', label: 'Comentarios', short: 'Comentarios', toast: 'Comentarios', Icon: MessagesSquare },
];

const tabFromHash = (): Tab => {
  const hash = window.location.hash.slice(1);
  return TABS.some(t => t.id === hash) ? (hash as Tab) : 'cronograma';
};

const loadMotionFeatures = () => import('./motion-features').then(mod => mod.default);

// Secciones grandes: se descargan solo cuando alguien las abre.
const Help = lazy(() => import('./components/Help').then(mod => ({ default: mod.Help })));
const Comments = lazy(() => import('./components/Comments').then(mod => ({ default: mod.Comments })));

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

export default function App() {
  const [today, setToday] = useState(() => getCaracasDateKey(new Date()));
  const [activeTab, setActiveTab] = useState<Tab>(tabFromHash);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; title: string; subtitle: string } | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // La fecha de referencia cambia a medianoche (hora de Venezuela).
  useEffect(() => {
    const timer = setInterval(() => setToday(getCaracasDateKey(new Date())), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onHashChange = () => setActiveTab(tabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((title: string, subtitle: string) => {
    setToast({ id: Date.now(), title, subtitle });
  }, []);

  const copy = useCallback(async (text: string, label = 'Correo copiado exitosamente') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      notify(label, text);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      notify('No se pudo copiar, selecciónalo a mano', text);
    }
  }, [notify]);

  const ui = useMemo(() => ({ notify, copy, copied }), [notify, copy, copied]);

  const selectTab = (tab: (typeof TABS)[number], button: HTMLButtonElement) => {
    setActiveTab(tab.id);
    notify('Pestaña seleccionada', tab.toast);
    window.history.replaceState(null, '', `#${tab.id}`);
    button.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    const nav = navRef.current;
    if (nav && window.scrollY > nav.offsetTop) window.scrollTo({ top: nav.offsetTop });
  };

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <UiContext.Provider value={ui}>
          <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-canvas font-sans text-ink antialiased">

            {/* NOTIFICACIÓN FLOTANTE */}
            <div className="pointer-events-none fixed inset-x-3 top-3 z-[100] flex justify-end sm:inset-x-auto sm:right-5 sm:top-5" aria-live="polite">
              <AnimatePresence>
                {toast && (
                  <m.div
                    key={toast.id}
                    initial={{ opacity: 0, x: 80 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 80, transition: { duration: 0.2 } }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="flex max-w-sm items-center gap-3.5 rounded-2xl border border-blue-600/40 bg-brand-950 px-5 py-3 text-white shadow-[0_16px_40px_-12px_rgba(8,34,56,0.6)]"
                  >
                    <m.span
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22, delay: 0.08 }}
                      className="flex shrink-0 items-center justify-center rounded-full bg-emerald-500/20 p-2 text-emerald-400"
                    >
                      <Check className="h-5 w-5 stroke-[3]" aria-hidden="true" />
                    </m.span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-xs font-medium text-gray-300">{toast.title}</span>
                      <span className="truncate text-sm font-bold uppercase tracking-wide text-white">{toast.subtitle}</span>
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
              <p className="mt-1 text-base font-bold text-blue-100 sm:text-lg">Lapso {ACTIVE_LAPSO}, Semestre {ACTIVE_SEMESTER}</p>
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
            <nav ref={navRef} className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85" aria-label="Secciones">
              <div className="scrollbar-none mx-auto flex max-w-6xl justify-between gap-0.5 overflow-x-auto px-1 sm:justify-center sm:gap-2 sm:px-4">
                {TABS.map(tab => {
                  const active = activeTab === tab.id;
                  const { Icon } = tab;
                  return (
                    <button
                      key={tab.id}
                      onClick={e => selectTab(tab, e.currentTarget)}
                      aria-current={active ? 'page' : undefined}
                      className={`relative flex min-h-12 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap px-1 py-3 text-sm font-bold transition-colors sm:px-3 ${active ? 'text-brand-800' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      <Icon className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
                      <span className="lg:hidden">{tab.short}</span>
                      <span className="hidden lg:inline">{tab.label}</span>
                      {active && (
                        <m.span
                          layoutId="tab-underline"
                          className="absolute inset-x-1.5 -bottom-px h-[3px] rounded-full bg-brand-800"
                          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            <main className="mx-auto box-border w-full max-w-6xl px-4 py-6 sm:px-6 md:py-8">
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.22, ease: EASE_OUT }}
                >
                  {activeTab === 'cronograma' && <ScheduleView today={today} />}
                  {activeTab === '281' && <CareerView careerId="281" today={today} />}
                  {activeTab === '280' && <CareerView careerId="280" today={today} />}
                  {activeTab === 'asesores' && <Directory />}
                  <Suspense fallback={<p className="py-10 text-center text-sm text-slate-600">Cargando</p>}>
                    {activeTab === 'ayuda' && <Help />}
                    {activeTab === 'comentarios' && <Comments />}
                  </Suspense>
                  {activeTab === 'enlaces' && <LinksView />}
                </m.div>
              </AnimatePresence>
            </main>

            {/* PIE DE PÁGINA */}
            <footer className="mt-4 w-full bg-brand-950 text-blue-100/80">
              <div className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:px-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-xl space-y-2 text-sm leading-relaxed">
                    <p className="text-base font-bold text-white">Cronograma de entregas, lapso {ACTIVE_LAPSO}</p>
                    <p>Hecho por estudiantes, para estudiantes del Centro Local Táchira.</p>
                    <p>Por ahora reúne las carreras TSU Higiene y Seguridad Industrial (281) e Ingeniería Industrial (280). Iremos sumando más carreras.</p>
                  </div>
                  <div className="space-y-1 text-sm md:text-right">
                    <p>Envía copia de cada entrega al correo de la sede:</p>
                    <div className="flex items-center gap-1 md:justify-end">
                      <a href={`mailto:${SEDE_EMAIL}`} className="inline-flex items-center gap-1.5 font-bold text-white underline decoration-blue-300/50 underline-offset-4 [overflow-wrap:anywhere] hover:decoration-white">
                        <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> {SEDE_EMAIL}
                      </a>
                      <CopyButton text={SEDE_EMAIL} tone="dark" />
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
        </UiContext.Provider>
      </MotionConfig>
    </LazyMotion>
  );
}
