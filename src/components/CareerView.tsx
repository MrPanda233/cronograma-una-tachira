import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { CalendarDays, Download, Eye, FolderDown, GraduationCap, MessageCircle } from 'lucide-react';
import { ACTIVE_LAPSO, ACTIVE_SEMESTER, CAREERS, planDownloadUrl, planViewUrl, type CareerId, type Subject } from '../data/careers';
import { ADVISORS, CENTRAL } from '../data/people';
import { NextAlert, ScheduleList } from './Schedule';
import { Chips, CopyButton, EASE_OUT, EmailLink, SectionHeading, SubjectTag, useUi } from './ui';

function SubjectRow({ subject }: { subject: Subject }) {
  const advisor: { name: string; email?: string } = ADVISORS[subject.advisor];
  const central = subject.central ? CENTRAL[subject.central] : null;
  return (
    <li className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
      <div className="flex min-w-0 items-start gap-3">
        <SubjectTag code={subject.code} />
        <div className="min-w-0">
          <p className="font-bold leading-snug text-ink">{subject.name}</p>
          <p className="text-sm text-slate-600">
            {subject.uc} U.C.{subject.prereq ? `, requiere ${subject.prereq}` : ''}
          </p>
          <div className="mt-1 text-sm text-slate-700">
            <span className="font-bold">{advisor.name}</span>
            {advisor.email
              ? <span className="ml-1 inline-flex items-center"><EmailLink email={advisor.email} className="text-xs" /><CopyButton text={advisor.email} /></span>
              : <span className="ml-1 text-xs text-slate-500">(correo por confirmar)</span>}
          </div>
          {central && (
            <p className="text-xs text-slate-600">
              Corrige TP y TSP en nivel central: <span className="font-bold">{central.name}</span>, <EmailLink email={central.email} />
            </p>
          )}
        </div>
      </div>
      {subject.plan ? (
        <div className="flex shrink-0 gap-2 pl-11 lg:pl-0">
          <a
            href={planDownloadUrl(subject.plan)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-brand-700 px-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-800"
            aria-label={`Descargar plan de curso de ${subject.name}`}
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Plan de curso
          </a>
          <a
            href={planViewUrl(subject.plan)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-brand-700 ring-1 ring-inset ring-blue-200 transition-colors hover:bg-blue-50"
            aria-label={`Ver plan de curso de ${subject.name}`}
          >
            <Eye className="h-4 w-4" aria-hidden="true" /> Ver
          </a>
        </div>
      ) : (
        <p className="pl-11 text-sm text-slate-500 lg:pl-0">Sin plan de curso</p>
      )}
    </li>
  );
}

export function CareerView({ careerId, today }: { careerId: CareerId; today: string }) {
  const { notify } = useUi();
  const career = CAREERS[careerId];
  const [semesterId, setSemesterId] = useState(ACTIVE_SEMESTER);
  const semester = career.semesters.find(s => s.id === semesterId) ?? career.semesters[0];
  const isActive = semester.id === ACTIVE_SEMESTER;
  const totalUC = semester.subjects.reduce((sum, s) => sum + s.uc, 0);

  return (
    <>
      <NextAlert career={careerId} today={today} />

      <section className="mb-6 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink sm:text-xl">
              <GraduationCap className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
              {career.name} ({career.id})
            </h2>
            <p className="text-sm text-slate-600">{career.totalUC} U.C. en total. Máximo {career.maxUC} U.C. por semestre.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={career.plansFolder} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-brand-700 ring-1 ring-inset ring-blue-200 transition-colors hover:bg-blue-50">
              <FolderDown className="h-4 w-4" aria-hidden="true" /> Todos los planes
            </a>
            <a href={career.group} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-emerald-800 ring-1 ring-inset ring-emerald-300 transition-colors hover:bg-emerald-50">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Grupo de WhatsApp
            </a>
          </div>
        </div>
      </section>

      <div className="mb-4">
        <Chips
          id={`semestre-${careerId}`}
          label="Elegir semestre"
          value={semester.id}
          options={career.semesters.map(s => ({
            id: s.id,
            label: s.label,
            hint: s.id === ACTIVE_SEMESTER ? ACTIVE_LAPSO : undefined,
          }))}
          onChange={id => {
            setSemesterId(id);
            notify('Semestre seleccionado', career.semesters.find(s => s.id === id)!.label);
          }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={semester.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
        >
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-base font-bold text-ink">{semester.label}{isActive ? `, lapso ${ACTIVE_LAPSO}` : ''}</h3>
            <p className="text-sm tabular-nums text-slate-600">{semester.subjects.length} asignaturas, {totalUC} U.C.</p>
          </div>
          {semester.note && <p className="mb-3 max-w-3xl text-sm text-slate-600">{semester.note}</p>}

          <ul className="mb-8 divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            {semester.subjects.map(subject => <SubjectRow key={subject.code} subject={subject} />)}
          </ul>

          {isActive && (
            <>
              <SectionHeading Icon={CalendarDays} title={`Entregas de la carrera ${career.id}`} />
              <ScheduleList career={careerId} today={today} />
            </>
          )}
        </m.div>
      </AnimatePresence>
    </>
  );
}
