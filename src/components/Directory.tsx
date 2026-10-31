import { useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Globe, Users } from 'lucide-react';
import { ACTIVE_SEMESTER, CAREERS, DEFAULT_COLOR, SUBJECT_COLOR, type CareerId } from '../data/careers';
import { ADVISORS, SEDE_EMAIL, type Person } from '../data/people';
import { Chips, CopyButton, EASE_OUT, SectionHeading, useUi } from './ui';

function AdvisorCard({ label, person, subject, border }: { label: string; person: Person; subject: string; border: string }) {
  return (
    <div className={`w-full rounded-xl border-l-4 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${border}`}>
      <div className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">{label}</div>
      <div className="mb-0.5 text-base font-bold text-gray-900">{person.name}</div>
      <div className="mb-3 text-xs text-gray-600">{subject}</div>
      {person.email ? (
        <div className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 pl-2.5">
          <span className="mr-2 select-all truncate font-mono text-xs text-blue-700">{person.email}</span>
          <CopyButton text={person.email} />
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-gray-300 px-2.5 py-3 text-xs text-gray-600">Correo por confirmar en la Unidad Académica</p>
      )}
      {person.link && (
        <div className="mt-2 text-xs">
          <a href={person.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
            <Globe className="h-3 w-3" aria-hidden="true" /> Ver sitio web del asesor
          </a>
        </div>
      )}
    </div>
  );
}

export function Directory() {
  const { notify } = useUi();
  const [careerId, setCareerId] = useState<CareerId>('281');
  const [semesterId, setSemesterId] = useState(ACTIVE_SEMESTER);
  const career = CAREERS[careerId];
  const semester = career.semesters.find(s => s.id === semesterId) ?? career.semesters[0];

  return (
    <section className="mb-10">
      <SectionHeading Icon={Users} title="Directorio de asesores" />
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-slate-600">
        El asesor puede cambiar según la carrera y la asignatura. Elige la tuya.
      </p>

      <div className="mb-3">
        <Chips
          id="directorio-carrera"
          label="Elegir carrera"
          value={careerId}
          options={[
            { id: '281', label: 'TSU HSI (281)' },
            { id: '280', label: 'Ing. Industrial (280)' },
          ]}
          onChange={id => {
            setCareerId(id);
            setSemesterId(ACTIVE_SEMESTER);
            notify('Carrera seleccionada', `${CAREERS[id].short} (${id})`);
          }}
        />
      </div>
      <div className="mb-5">
        <Chips
          id="directorio-semestre"
          label="Elegir semestre"
          value={semester.id}
          options={career.semesters.map(s => ({ id: s.id, label: s.label.replace('Semestre ', 'Sem. ') }))}
          onChange={id => { setSemesterId(id); notify('Semestre seleccionado', career.semesters.find(s => s.id === id)!.label); }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={`${careerId}-${semester.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
          className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {semester.subjects.map(subject => (
            <AdvisorCard
              key={subject.code}
              label={`Asignatura ${subject.code}`}
              person={ADVISORS[subject.advisor]}
              subject={subject.name}
              border={(SUBJECT_COLOR[subject.code] ?? DEFAULT_COLOR).border}
            />
          ))}
          <AdvisorCard
            label="Contacto institucional"
            person={{ name: 'Jefatura de Unidad Académica', email: SEDE_EMAIL }}
            subject="Centro Local Táchira"
            border={SUBJECT_COLOR.sede.border}
          />
        </m.div>
      </AnimatePresence>
    </section>
  );
}
