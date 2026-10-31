import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { AlarmClock, Archive, BellRing, BookOpen, CalendarDays, ChevronDown, ExternalLink, Laptop, Mail, Send, Upload } from 'lucide-react';
import type { CareerId } from '../data/careers';
import { BLOG_116_URL, BLOG_MATE_URL } from '../data/people';
import { EVALUATIONS, MISSING_DATES, type Evaluation } from '../data/schedule';
import { daysBetween, dueDate, formatDate, formatWeekday, isPending, nextKeyDate } from '../lib/dates';
import { Chips, EASE_OUT, EmailLink, SectionHeading, StatusBadge, SubjectTag, useUi } from './ui';

type Filter = 'todas' | CareerId;

const forCareer = (career: Filter) => EVALUATIONS.filter(e => career === 'todas' || e.careers.includes(career));

const sortByNextDate = (evals: Evaluation[], today: string) =>
  [...evals].sort((a, b) => nextKeyDate(a, today).localeCompare(nextKeyDate(b, today)));

// En un TSP distingue si falta la publicación o ya corre el plazo para entregar.
const nextStep = (ev: Evaluation, today: string) => {
  if (ev.kind === 'TSP' && today < ev.dateStr) return 'Se publica';
  return 'Entrega';
};

function CareerNote({ ev }: { ev: Evaluation }) {
  if (ev.careers.length > 1) return null;
  return <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-bold text-slate-600">Solo {ev.careers[0]}</span>;
}

function DateCell({ ev }: { ev: Evaluation }) {
  if (ev.kind !== 'TSP') return <p className="font-bold tabular-nums">{formatDate(ev.dateStr)}</p>;
  return (
    <div className="space-y-0.5 tabular-nums">
      <p className="flex items-center gap-1.5 text-sm text-slate-700"><Upload className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden="true" /> Publica SDA: <strong className="text-ink">{formatDate(ev.dateStr)}</strong></p>
      <p className="flex items-center gap-1.5 text-sm text-slate-700"><Send className="h-3.5 w-3.5 shrink-0 text-brand-700" aria-hidden="true" /> Entrega: <strong className="text-ink">{formatDate(dueDate(ev))}</strong></p>
    </div>
  );
}

export function NextAlert({ career, today }: { career: Filter; today: string }) {
  const pending = sortByNextDate(forCareer(career).filter(e => isPending(e, today)), today);
  if (pending.length === 0) return null;
  const nextDate = nextKeyDate(pending[0], today);
  const items = pending.filter(e => nextKeyDate(e, today) === nextDate);
  const days = daysBetween(today, nextDate);
  const title = days === 0 ? '¡Hay fechas importantes hoy!' : days === 1 ? 'Próxima fecha: mañana' : `Próxima fecha en ${days} días`;
  return (
    <m.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      aria-labelledby="proxima-fecha"
      className={`mb-6 rounded-2xl p-4 text-white shadow-[0_10px_30px_-12px_rgba(194,65,12,0.55)] sm:p-5 md:mb-8 ${days === 0 ? 'bg-red-700' : 'bg-orange-700'}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
          {days === 0 ? <AlarmClock className="h-5 w-5" aria-hidden="true" /> : <BellRing className="h-5 w-5" aria-hidden="true" />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="proxima-fecha" className="text-base font-extrabold leading-snug sm:text-lg">{title}</h2>
          <p className="text-sm text-orange-50 first-letter:uppercase">{formatWeekday(nextDate)}</p>
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {items.map(e => (
              <li key={e.id} className="rounded-xl bg-black/15 p-3 text-sm">
                <p className="font-bold">{nextStep(e, today)}: {e.code} {e.evalType}</p>
                <p className="text-orange-50">{e.description}</p>
                <a href={`mailto:${e.email}`} className="mt-1 inline-flex items-center gap-1.5 text-amber-100 underline decoration-amber-100/40 underline-offset-2 [overflow-wrap:anywhere] hover:decoration-amber-100">
                  <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {e.email}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </m.section>
  );
}

export function ScheduleList({ career, today }: { career: Filter; today: string }) {
  const evals = forCareer(career);
  const upcoming = sortByNextDate(evals.filter(e => isPending(e, today)), today);
  const past = evals.filter(e => !isPending(e, today)).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
  const missing = MISSING_DATES.filter(item => career === "todas" || item.career === career);
  const [showPast, setShowPast] = useState(false);

  return (
    <>
      {/* Celular: tarjetas */}
      <ol className="mb-4 space-y-3 sm:hidden">
        {upcoming.map(ev => {
          const days = daysBetween(today, nextKeyDate(ev, today));
          return (
            <li key={ev.id} className={`rounded-2xl bg-white p-4 ring-1 ${days === 0 ? 'ring-2 ring-red-500' : 'ring-slate-200'}`}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <DateCell ev={ev} />
                <StatusBadge days={days} verb={ev.kind === 'TSP' ? nextStep(ev, today) : undefined} />
              </div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <SubjectTag code={ev.code} />
                <span className="text-sm font-bold">{ev.subject}</span>
                <CareerNote ev={ev} />
              </div>
              <p className="text-sm leading-relaxed text-slate-700"><strong className="text-ink">{ev.evalType}:</strong> {ev.description}</p>
              <div className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-600">
                <p className="font-bold text-slate-800">{ev.advisor}</p>
                <EmailLink email={ev.email} />
              </div>
            </li>
          );
        })}
      </ol>

      {/* Computadora: tabla */}
      <div className="mb-4 hidden w-full overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,34,58,0.06),0_8px_24px_-12px_rgba(15,34,58,0.15)] ring-1 ring-slate-200 sm:block">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-brand-700 text-white">
                <th scope="col" className="px-4 py-3 font-bold">Fecha</th>
                <th scope="col" className="px-4 py-3 font-bold">Asignatura</th>
                <th scope="col" className="px-4 py-3 font-bold">Evaluación</th>
                <th scope="col" className="px-4 py-3 font-bold">Asesor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcoming.map(ev => {
                const days = daysBetween(today, nextKeyDate(ev, today));
                return (
                  <tr key={ev.id} className={`align-top transition-colors hover:bg-blue-50/50 ${days === 0 ? 'bg-red-50' : ''}`}>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <DateCell ev={ev} />
                      <p className="mb-1.5 text-xs text-slate-500">{ev.week}</p>
                      <StatusBadge days={days} verb={ev.kind === 'TSP' ? nextStep(ev, today) : undefined} />
                    </td>
                    <td className="px-4 py-3.5">
                      <SubjectTag code={ev.code} /><CareerNote ev={ev} />
                      <p className="mt-1 max-w-[12rem] text-sm font-bold leading-snug">{ev.subject}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold">{ev.evalType}</p>
                      <p className="max-w-md leading-relaxed text-slate-700">{ev.description}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      <p className="font-bold text-slate-800">{ev.advisor}</p>
                      <EmailLink email={ev.email} className="whitespace-nowrap text-xs" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {upcoming.length === 0 && (
        <p className="mb-4 rounded-2xl bg-white p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200">
          No quedan entregas pendientes en este lapso. Revisa el historial más abajo.
        </p>
      )}

      {missing.map(item => (
        <p key={item.code} className="mb-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-950 ring-1 ring-inset ring-blue-200">
          Las fechas de {item.code} {item.name} ({item.career}) aún no están en este cronograma. Consúltalas en el plan de curso.
        </p>
      ))}

      {/* ENTREGAS PASADAS */}
      <div className="mb-10 w-full">
        <button
          onClick={() => setShowPast(v => !v)}
          aria-expanded={showPast}
          className="flex min-h-12 w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
        >
          <span className="flex items-center gap-2">
            <Archive className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
            {showPast ? 'Ocultar entregas pasadas' : `Ver entregas pasadas (${past.length})`}
          </span>
          <m.span animate={{ rotate: showPast ? 180 : 0 }} transition={{ duration: 0.2, ease: EASE_OUT }}>
            <ChevronDown className="h-5 w-5 shrink-0" aria-hidden="true" />
          </m.span>
        </button>

        <AnimatePresence initial={false}>
          {showPast && (
            <m.ul
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200"
            >
              {past.map(ev => (
                <li key={ev.id} className="flex flex-col gap-1 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:gap-4">
                  <span className="w-24 shrink-0 tabular-nums text-slate-500">{formatDate(dueDate(ev))}</span>
                  <span className="flex min-w-0 items-center gap-2">
                    <SubjectTag code={ev.code} />
                    <span><strong className="text-slate-700">{ev.evalType}:</strong> {ev.description}</span>
                  </span>
                </li>
              ))}
            </m.ul>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export function ScheduleView({ today }: { today: string }) {
  const { notify } = useUi();
  const [filter, setFilter] = useState<Filter>('todas');
  const options: { id: Filter; label: string }[] = [
    { id: 'todas', label: 'Ambas carreras' },
    { id: '281', label: '281' },
    { id: '280', label: '280' },
  ];
  return (
    <>
      <NextAlert career={filter} today={today} />

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
            className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(15,34,58,0.06),0_4px_12px_-6px_rgba(15,34,58,0.12)] ring-1 ring-slate-200 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,34,58,0.06),0_12px_24px_-12px_rgba(13,71,161,0.35)] hover:ring-blue-300"
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

      <SectionHeading Icon={CalendarDays} title="Cronograma general" />
      <div className="mb-4">
        <Chips
          id="filtro-cronograma"
          label="Filtrar por carrera"
          value={filter}
          options={options}
          onChange={id => { setFilter(id); notify('Filtro seleccionado', options.find(o => o.id === id)!.label); }}
        />
      </div>
      <ScheduleList career={filter} today={today} />
    </>
  );
}
