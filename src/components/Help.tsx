import { useId, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
import {
  ArrowRight, Check, ChevronDown, CircleHelp, ExternalLink, FileText, Lightbulb, Link2, Mail, MessageCircle, Paperclip, Send, ShieldCheck, X,
} from 'lucide-react';
import { ACTIVE_LAPSO, activeSubjects, type CareerId } from '../data/careers';
import { EXAMENES_URL, MATERIAL_URL, TSP_URL, VALIDADOS_URL } from '../data/links';
import { ADVISORS, SEDE_EMAIL } from '../data/people';
import { EVALUATIONS, LINK_DELIVERY_CODES } from '../data/schedule';
import { Chips, CopyButton, EASE_OUT, SectionHeading, useUi } from './ui';

/* ---------- Conceptos: TP, TSP, MR y plan de curso ---------- */

type ConceptId = 'tp' | 'tsp' | 'mr' | 'plan';

const CONCEPTS: Record<ConceptId, {
  short: string;
  name: string;
  what: string;
  example: string;
  steps: { title: string; detail: string }[];
}> = {
  tp: {
    short: 'TP',
    name: 'Trabajo Práctico',
    what: 'Es una tarea que haces en casa, con tiempo, para demostrar que lograste uno o varios objetivos de la asignatura. Tiene una fecha límite fija.',
    example: '115 TP2: comprensión lectora y redacción académica. Fecha límite: 07/11/2026. Tienes semanas para trabajarlo, pero debes entregarlo ese día a más tardar.',
    steps: [
      { title: 'Descarga el enunciado', detail: 'Búscalo en la página del SDA con el código de tu asignatura. Revisa qué objetivos evalúa.' },
      { title: 'Hazlo con calma', detail: 'Usa el material instruccional y sigue lo que indique tu asesor. Cita tus fuentes si te lo piden.' },
      { title: 'Envíalo por correo', detail: 'A tu asesor, con copia a la sede, antes de la fecha límite. Va en un solo PDF, salvo que tu asesor pida otra cosa, como en 116, que se entrega por enlace.' },
      { title: 'Prepárate para defenderlo', detail: 'El asesor puede convocarte a una verificación para que expliques tu trabajo.' },
    ],
  },
  tsp: {
    short: 'TSP',
    name: 'Trabajo Sustitutivo de Prueba',
    what: 'Reemplaza al examen: en vez de presentar una prueba en el aula, resuelves un trabajo en casa en poco tiempo. La fecha del cronograma es el día en que se publica, no el día de entrega.',
    example: '177 TSP2: el SDA lo publica el 14/11/2026. Con 24 horas de plazo, debes entregarlo a más tardar el 15/11/2026.',
    steps: [
      { title: 'El SDA lo publica', detail: 'Ese día entra a la página del SDA y descarga el TSP de tu asignatura. Está en la sección de trabajos sustitutivos.' },
      { title: 'Corre el tiempo', detail: 'Normalmente tienes 24 horas, pero el plazo exacto lo indica cada enunciado. Léelo primero.' },
      { title: 'Entrega al día siguiente', detail: 'Envía un solo PDF a tu asesor, con copia a la sede, antes de que venza el plazo.' },
      { title: 'Compara con el MR', detail: 'Después se publica el Modelo de Respuesta y puedes revisar qué lograste.' },
    ],
  },
  mr: {
    short: 'MR',
    name: 'Modelo de Respuesta',
    what: 'Es la solución oficial de un TP o TSP. Muestra las respuestas correctas y los criterios para corregir cada objetivo. Se publica después de la evaluación, así que no está disponible mientras resuelves.',
    example: 'Entregaste tu TSP1 de Matemática. Días después sale el MR: lo comparas pregunta por pregunta y ves qué objetivos lograste antes de que te llegue la nota.',
    steps: [
      { title: 'Entregas tu trabajo', detail: 'Primero se cierra la evaluación. El MR no aparece antes.' },
      { title: 'Sale el MR', detail: 'Lo publica el SDA junto al trabajo. Descárgalo con el mismo código de asignatura.' },
      { title: 'Comparas tus respuestas', detail: 'Revisa objetivo por objetivo: qué hiciste bien y dónde te equivocaste.' },
      { title: 'Estudias lo que faltó', detail: 'Te sirve para preparar lo que viene y para aclarar dudas con tu asesor.' },
    ],
  },
  plan: {
    short: 'Plan de curso',
    name: 'Plan de curso',
    what: 'Es el documento de la asignatura con sus objetivos y contenidos. Cada asesor indica cómo trabaja: algunos publican su propia metodología, como el de 116 en su blog. Siempre vale lo que diga tu asesor.',
    example: 'Abre la sección de tu carrera, elige el semestre y toca "Plan de curso" al lado de la asignatura. Se descarga en PDF.',
    steps: [
      { title: 'Busca tu carrera', detail: 'Entra en 281 o 280. Las asignaturas están ordenadas por semestre.' },
      { title: 'Descarga el plan', detail: 'Hay un botón por asignatura. No necesitas cuenta de Google.' },
      { title: 'Pregunta cómo evalúa tu asesor', detail: 'Revisa si la asignatura lleva TP, TSP o prueba. Si tu asesor tiene su propia metodología, sigue la suya.' },
      { title: 'Anota tus fechas', detail: 'Cruza lo que sabes con el cronograma general para organizarte.' },
    ],
  },
};

function StepFlow({ steps }: { steps: { title: string; detail: string }[] }) {
  const id = useId();
  const [active, setActive] = useState(0);
  const last = active === steps.length - 1;
  return (
    <div>
      <ol className="grid gap-1.5 sm:grid-cols-4">
        {steps.map((step, i) => {
          const current = i === active;
          return (
            <li key={step.title}>
              <button
                onClick={() => setActive(i)}
                aria-current={current ? 'step' : undefined}
                className="relative flex min-h-12 w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm font-bold"
              >
                {current && (
                  <m.span
                    layoutId={`step-${id}`}
                    className="absolute inset-0 rounded-xl bg-blue-50 ring-1 ring-inset ring-blue-200"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs tabular-nums transition-colors ${i <= active ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {i < active ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
                </span>
                <span className={`relative leading-snug ${current ? 'text-brand-800' : 'text-slate-600'}`}>{step.title}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
        <m.div
          className="h-full origin-left rounded-full bg-brand-600"
          initial={false}
          animate={{ scaleX: (active + 1) / steps.length }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        />
      </div>

      <div className="mt-3 flex min-h-20 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AnimatePresence mode="wait" initial={false}>
          <m.p
            key={active}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6, transition: { duration: 0.1 } }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="max-w-2xl text-sm leading-relaxed text-slate-700"
          >
            {steps[active].detail}
          </m.p>
        </AnimatePresence>
        <button
          onClick={() => setActive(last ? 0 : active + 1)}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 self-start rounded-xl px-3.5 text-sm font-bold text-brand-700 ring-1 ring-inset ring-blue-200 transition-colors hover:bg-blue-50 sm:self-auto"
        >
          {last ? 'Ver desde el inicio' : 'Siguiente paso'} {!last && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

const MR_DEMO = [
  { objective: 'Objetivo 1', mine: 'Resultado: 42', mr: 'Resultado: 42', ok: true, note: 'Coincide: objetivo logrado.' },
  { objective: 'Objetivo 2', mine: 'Resultado: 18, sin explicar', mr: 'Resultado: 18, con cada paso justificado', ok: false, note: 'Faltó justificar los pasos.' },
  { objective: 'Objetivo 3', mine: 'Usé la fórmula correcta', mr: 'Fórmula correcta y unidades', ok: true, note: 'Coincide en lo esencial.' },
];

function MrCompare() {
  const [shown, setShown] = useState(false);
  return (
    <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-ink">Prueba cómo se usa (ejemplo inventado)</p>
        <button
          onClick={() => setShown(v => !v)}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 self-start rounded-xl bg-brand-700 px-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-800 sm:self-auto"
        >
          {shown ? 'Ocultar el MR' : 'Comparar con el MR'}
        </button>
      </div>
      <ul className="space-y-2">
        {MR_DEMO.map((row, i) => (
          <li key={row.objective} className="rounded-xl bg-white p-3 text-sm ring-1 ring-slate-200">
            <p className="font-bold text-ink">{row.objective}</p>
            <p className="text-slate-700">Tu trabajo: {row.mine}</p>
            <AnimatePresence initial={false}>
              {shown && (
                <m.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.25, delay: i * 0.12, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <p className="pt-1 text-slate-700">MR: {row.mr}</p>
                  <p className={`mt-1 flex items-center gap-1.5 font-bold ${row.ok ? 'text-emerald-700' : 'text-red-700'}`}>
                    {row.ok ? <Check className="h-4 w-4" aria-hidden="true" /> : <X className="h-4 w-4" aria-hidden="true" />} {row.note}
                  </p>
                </m.div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConceptExplorer() {
  const { notify } = useUi();
  const [selected, setSelected] = useState<ConceptId>('tp');
  const concept = CONCEPTS[selected];
  return (
    <section className="mb-10">
      <SectionHeading Icon={Lightbulb} title="¿Qué significa cada cosa?" />
      <div className="mb-4">
        <Chips
          id="concepto"
          label="Elegir concepto"
          value={selected}
          options={(Object.keys(CONCEPTS) as ConceptId[]).map(id => ({ id, label: CONCEPTS[id].short }))}
          onChange={id => { setSelected(id); notify('Tema seleccionado', CONCEPTS[id].name); }}
        />
      </div>
      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
          >
            <h3 className="text-lg font-bold text-ink">{concept.name}</h3>
            <p className="mb-4 mt-1 max-w-3xl leading-relaxed text-slate-700">{concept.what}</p>
            <StepFlow key={selected} steps={concept.steps} />
            <p className="mt-3 max-w-3xl rounded-xl bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-950">
              <strong>Ejemplo.</strong> {concept.example}
            </p>
            {selected === 'mr' && <MrCompare />}
          </m.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---------- Armador del correo de entrega ---------- */

const FALLBACK_EVALS = ['TP1', 'TP2', 'TSP1', 'TSP2'];

const SEGMENT_STYLES = [
  'bg-blue-100 text-blue-900',
  'bg-emerald-100 text-emerald-900',
  'bg-purple-100 text-purple-900',
  'bg-amber-100 text-amber-900',
  'bg-rose-100 text-rose-900',
];

const inputClass = 'min-h-11 w-full rounded-xl bg-white px-3 text-base text-ink ring-1 ring-inset ring-slate-300 transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-600 sm:text-sm';

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block text-sm font-bold text-slate-800">
      {label}
      <span className="mt-1 block font-normal">{children}</span>
      {hint && <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span>}
    </label>
  );
}

function PreviewRow({ label, value, children, copyLabel }: { label: string; value: string; children?: ReactNode; copyLabel: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 py-1 last:border-b-0">
      <span className="w-14 shrink-0 text-xs font-bold text-slate-500">{label}</span>
      <span className="min-w-0 flex-1 text-sm [overflow-wrap:anywhere]">{children ?? value}</span>
      <CopyButton text={value} label={copyLabel} />
    </div>
  );
}

function EmailBuilder() {
  const [careerId, setCareerId] = useState<CareerId>('281');
  const subjects = activeSubjects(careerId);
  const [code, setCode] = useState(subjects[0].code);
  const [evalChoice, setEvalChoice] = useState('');
  const [name, setName] = useState('');
  const [cedula, setCedula] = useState('');
  const [link, setLink] = useState('');
  const [segment, setSegment] = useState<number | null>(null);

  const subject = subjects.find(s => s.code === code) ?? subjects[0];
  const advisor: { name: string; email?: string } = ADVISORS[subject.advisor];

  const evalOptions = useMemo(() => {
    const fromSchedule = EVALUATIONS
      .filter(e => e.code === subject.code && e.careers.includes(careerId))
      .map(e => e.evalType.replace(/\s+/g, ''));
    return fromSchedule.length > 0 ? fromSchedule : FALLBACK_EVALS;
  }, [subject.code, careerId]);

  const evalValue = evalOptions.includes(evalChoice) ? evalChoice : evalOptions[0];
  const cleanName = name.trim().replace(/_/g, ' ').replace(/\s+/g, ' ');
  const cleanCedula = cedula.replace(/\D/g, '');

  const segments = [
    { text: subject.code, label: 'Código de la asignatura', help: 'Está en el pensum y en el cronograma. Es lo primero que ve quien recibe tu correo.' },
    { text: evalValue, label: 'Evaluación', help: 'Lo que estás entregando: TP1, TP2, TSP1 o el objetivo que te pidan.' },
    { text: cleanName || 'Nombre', label: 'Tu nombre', help: 'Escríbelo igual que en tu inscripción. El nombre va en el asunto, no en el archivo.' },
    { text: cleanCedula || 'Cédula', label: 'Tu cédula', help: 'Solo números, sin puntos y sin la V.' },
    { text: ACTIVE_LAPSO, label: 'Lapso', help: 'El lapso en curso. Cambia cada semestre.' },
  ];

  const subjectLine = segments.map(s => s.text).join('_');
  const fileName = `${subject.code}_${evalValue}_${cleanCedula || 'Cédula'}_${ACTIVE_LAPSO}.pdf`;
  const byLink = LINK_DELIVERY_CODES.includes(subject.code);
  const cleanLink = link.trim();
  const ready = Boolean(cleanName && cleanCedula && (!byLink || cleanLink));
  const body = `Buenos días, ${advisor.name}.\n\nLe envío mi ${evalValue} de la asignatura ${subject.code} ${subject.name}, lapso ${ACTIVE_LAPSO}.${byLink ? `\n\nEnlace: ${cleanLink}` : ''}\n\nNombre: ${cleanName}\nCédula: ${cleanCedula}\n\nSaludos.`;
  const mailto = `mailto:${advisor.email ?? ''}?cc=${encodeURIComponent(SEDE_EMAIL)}&subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;

  return (
    <section className="mb-10">
      <SectionHeading Icon={Mail} title="Arma tu correo de entrega" />
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-slate-600">
        Llena los datos y el correo se escribe solo. Tu nombre y tu cédula no se guardan ni se envían a ningún lado: todo pasa en tu teléfono.
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
          <Chips
            id="correo-carrera"
            label="Elegir carrera"
            value={careerId}
            options={[{ id: '281', label: '281' }, { id: '280', label: '280' }]}
            onChange={id => { setCareerId(id); setCode(activeSubjects(id)[0].code); }}
          />
          <Field label="Asignatura">
            <select value={subject.code} onChange={e => setCode(e.target.value)} className={inputClass}>
              {subjects.map(s => <option key={s.code} value={s.code}>{s.code} {s.name}</option>)}
            </select>
          </Field>
          <Field label="Evaluación">
            <select value={evalValue} onChange={e => setEvalChoice(e.target.value)} className={inputClass}>
              {evalOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Tu nombre">
            <input value={name} onChange={e => setName(e.target.value)} autoComplete="off" placeholder="María Pérez" className={inputClass} />
          </Field>
          <Field label="Tu cédula" hint="Solo números, sin puntos.">
            <input value={cedula} onChange={e => setCedula(e.target.value)} inputMode="numeric" autoComplete="off" placeholder="12345678" className={inputClass} />
          </Field>
          {byLink && (
            <Field label="Enlace de tu trabajo" hint="Comparte el documento para que el asesor pueda abrirlo y pega aquí el enlace.">
              <input value={link} onChange={e => setLink(e.target.value)} inputMode="url" autoComplete="off" placeholder="https://docs.google.com/..." className={inputClass} />
            </Field>
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
          <p className="mb-1 text-sm font-bold text-ink">Así queda tu correo</p>
          <PreviewRow label="Para" value={advisor.email ?? ''} copyLabel="Correo del asesor" />
          <PreviewRow label="Copia" value={SEDE_EMAIL} copyLabel="Correo de la sede" />
          <PreviewRow label="Asunto" value={subjectLine} copyLabel="Asunto copiado">
            <span className="flex flex-wrap items-center gap-y-1 font-bold">
              {segments.map((seg, i) => (
                <span key={seg.label} className="inline-flex items-center">
                  {i > 0 && <span className="px-0.5 text-slate-400">_</span>}
                  <button
                    onClick={() => setSegment(segment === i ? null : i)}
                    aria-pressed={segment === i}
                    className={`rounded-md px-1.5 py-1 transition-shadow ${SEGMENT_STYLES[i]} ${segment === i ? 'ring-2 ring-brand-600' : ''}`}
                  >
                    <m.span key={seg.text} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>{seg.text}</m.span>
                  </button>
                </span>
              ))}
            </span>
          </PreviewRow>
          {byLink ? (
            <PreviewRow label="Enlace" value={cleanLink || 'Pega el enlace de tu trabajo'} copyLabel="Enlace copiado">
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                <Link2 className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" /> {cleanLink || 'Pega el enlace de tu trabajo'}
              </span>
            </PreviewRow>
          ) : (
            <PreviewRow label="Archivo" value={fileName} copyLabel="Nombre del archivo copiado">
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                <Paperclip className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" /> {fileName}
              </span>
            </PreviewRow>
          )}

          <div className="mt-2 min-h-14 text-sm">
            <AnimatePresence mode="wait" initial={false}>
              <m.p
                key={segment ?? 'tip'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
                transition={{ duration: 0.18, ease: EASE_OUT }}
                className="rounded-xl bg-slate-50 px-3 py-2 leading-relaxed text-slate-700"
              >
                {segment === null
                  ? 'Toca cada parte del asunto para ver qué significa.'
                  : <><strong className="text-ink">{segments[segment].label}.</strong> {segments[segment].help}</>}
              </m.p>
            </AnimatePresence>
          </div>

          <a
            href={ready ? mailto : undefined}
            aria-disabled={!ready}
            className={`mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors ${ready ? 'bg-brand-700 text-white hover:bg-brand-800' : 'cursor-not-allowed bg-slate-100 text-slate-500'}`}
          >
            <Send className="h-4 w-4" aria-hidden="true" /> {ready ? 'Abrir en mi correo' : byLink ? 'Completa tus datos y el enlace' : 'Escribe tu nombre y tu cédula'}
          </a>
          <p className="mt-2 text-xs text-slate-500">
            {byLink ? 'El enlace ya va dentro del mensaje. Cada objetivo va en un correo aparte.' : 'El PDF lo adjuntas tú antes de enviar. Si tu asesor pide otro formato, usa el suyo.'}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
        <p className="mb-2 font-bold text-ink">Errores que debes evitar</p>
        <ul className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          {[
            'Olvidar la copia a la sede.',
            'Enviar fotos o varios archivos. Va un solo PDF, o el enlace si tu asesor trabaja así.',
            'Cambiar el orden del asunto o del nombre del archivo.',
            'Dejarlo para el último minuto, sobre todo en un TSP.',
          ].map(text => (
            <li key={text} className="flex items-start gap-2">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" /> {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Preguntas frecuentes ---------- */

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-brand-700 underline decoration-brand-700/30 underline-offset-2 hover:decoration-brand-700">
      {children} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

const FAQ: { q: string; a: ReactNode }[] = [
  { q: '¿Qué es el SDA y dónde veo los TSP?', a: <>Es el Subprograma de Diseño Académico de la UNA. Publica los planes de curso, los TP, los TSP y los modelos de respuesta. Aquí está su <Ext href={TSP_URL}>página de TSP</Ext>.</> },
  { q: '¿La fecha de un TSP es para entregarlo?', a: <>No. En el cronograma esa fecha es la publicación. Desde ese momento corre el plazo, normalmente 24 horas. Este portal te muestra las dos fechas, pero el plazo exacto es el que indica el enunciado.</> },
  { q: '¿Qué es la verificación?', a: <>Después de entregar, el asesor puede convocarte, en persona o por internet, para que expliques tu trabajo. Si te convoca y no vas, pierdes ese objetivo. Por eso conviene entender lo que entregas.</> },
  { q: '¿Por qué 116 se entrega distinto?', a: <>El Ing. Danny Colmenares trabaja con su propia metodología, publicada en su blog. Los trabajos se hacen en herramientas en línea, como Google Docs, y se entrega el enlace compartido en vez de un PDF. Cada objetivo va en un correo aparte, con tu nombre, cédula, asignatura y objetivo.</> },
  { q: '¿Qué significan U.C. y "requiere"?', a: <>U.C. son unidades de crédito: el peso de cada asignatura. "Requiere" es la prelación: la asignatura que debes aprobar antes de inscribir esta. Hay un máximo de U.C. por semestre: 22 en la 281 y 24 en la 280.</> },
  { q: '¿Las carreras 281 y 280 ven lo mismo?', a: <>No todo. Comparten varias asignaturas, pero la 117 es del Semestre I en la 281 y del Semestre III en la 280, y la 107 Lógica solo está en la 280. En los trabajos de la 280, algunos los corrige un profesor de nivel central.</> },
  { q: '¿Cómo sé si estoy inscrito?', a: <>Consulta el <Ext href={VALIDADOS_URL}>listado de alumnos validados</Ext>.</> },
  { q: '¿Dónde consigo los libros y las guías?', a: <>En el <Ext href={MATERIAL_URL}>material instruccional</Ext>. Si quieres practicar, también hay <Ext href={EXAMENES_URL}>pruebas de otros semestres</Ext>.</> },
  { q: '¿Cuándo atienden en la sede?', a: <>Viernes de 1 a 5 p. m. y sábados de 8 a. m. a 12 m.</> },
  { q: '¿Este sitio es de la UNA?', a: <>No. Lo hacemos estudiantes para ayudarnos. Si algo no coincide con lo que dice tu asesor, vale lo que diga tu asesor.</> },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mb-10">
      <SectionHeading Icon={CircleHelp} title="Preguntas frecuentes" />
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
        {FAQ.map((item, i) => {
          const isOpen = open === i;
          return (
            <li key={item.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left font-bold text-ink transition-colors hover:bg-blue-50/60"
              >
                {item.q}
                <m.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2, ease: EASE_OUT }} className="shrink-0 text-slate-500">
                  <ChevronDown className="h-5 w-5" aria-hidden="true" />
                </m.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0, transition: { duration: 0.14 } }}
                    transition={{ duration: 0.24, ease: EASE_OUT }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-3xl px-4 pb-4 text-sm leading-relaxed text-slate-700">{item.a}</p>
                  </m.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
          <p className="text-sm text-slate-700">
            <strong className="text-ink">¿Sigues con dudas?</strong> Pregúntale a tu asesor o deja tu pregunta en los comentarios.
          </p>
        </div>
        <a href="#comentarios" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3.5 text-sm font-bold text-brand-700 ring-1 ring-inset ring-blue-200 transition-colors hover:bg-blue-50">
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ir a los comentarios
        </a>
      </div>
    </section>
  );
}

export function Help() {
  return (
    <>
      <div className="mb-6 flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-bold text-ink sm:text-xl">¿Andas perdido? Empieza aquí</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-700">
            Aquí se explica qué es un TP, un TSP y un MR, cómo escribir el correo de entrega y las dudas más comunes.
          </p>
        </div>
      </div>
      <ConceptExplorer />
      <EmailBuilder />
      <Faq />
    </>
  );
}
