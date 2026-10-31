// Cronograma de evaluaciones del semestre en curso.
//
// IMPORTANTE sobre los TSP: `dateStr` es el día en que el SDA PUBLICA el TSP, no el día de entrega.
// La entrega se calcula sola con TSP_HOURS (ver dueDate en lib/dates.ts).
import type { CareerId } from './careers';

export type EvalKind = 'TP' | 'TSP' | 'OBJ';

export const TSP_HOURS = 24;

export interface Evaluation {
  id: number;
  code: string;
  subject: string;
  kind: EvalKind;
  evalType: string;
  description: string;
  dateStr: string; // YYYY-MM-DD
  week: string;
  advisor: string;
  email: string;
  careers: CareerId[];
}

const BOTH: CareerId[] = ['281', '280'];
const ONLY_281: CareerId[] = ['281'];

const INF = { code: '116', subject: 'Introducción a la Informática', advisor: 'Ing. Danny Colmenares', email: 'dcolmenaresuna@gmail.com', careers: BOTH };
const LEN = { code: '115', subject: 'Lengua y Comunicación', advisor: 'Prof. Samuel Jaimes', email: 'profesorsamjaimesparra@gmail.com', careers: BOTH };
const MAT = { code: '177', subject: 'Matemática I', advisor: 'Prof. Guido Moreno', email: 'aleguidox@gmail.com', careers: BOTH };
const IND = { code: '200', subject: 'Introducción a la Ingeniería Industrial', advisor: 'Prof. Eduardo Roa', email: 'eduardoroa1976@gmail.com', careers: BOTH };
const AMB = { code: '117', subject: 'Ambiente y Desarrollo Sostenible en Venezuela', advisor: 'Prof. Rose Mary Núñez', email: 'rosemarynunez@gmail.com', careers: ONLY_281 };

export const EVALUATIONS: Evaluation[] = [
  { id: 1, ...INF, kind: 'OBJ', evalType: 'Obj I.1', description: 'Fundamentos de la ergonomía y postura', dateStr: '2026-07-25', week: 'Pasado' },
  { id: 2, ...INF, kind: 'OBJ', evalType: 'Obj I.2', description: 'Términos de informática y computación (tabla y diapositivas)', dateStr: '2026-09-19', week: 'Pasado' },
  { id: 3, ...LEN, kind: 'TP', evalType: 'TP1', description: 'Objetivos I.1 a I.4 (infografía, cuadros y análisis)', dateStr: '2026-10-03', week: 'Sem. 40' },
  { id: 4, ...INF, kind: 'OBJ', evalType: 'Obj I.3', description: 'Uso de hoja de cálculo en línea y documento explicativo', dateStr: '2026-10-03', week: 'Sem. 40' },
  { id: 5, ...MAT, kind: 'TSP', evalType: 'TSP1', description: 'Operadores, funciones y límites', dateStr: '2026-10-10', week: 'Sem. 41' },
  { id: 6, ...INF, kind: 'OBJ', evalType: 'Obj II.1', description: 'Fuentes confiables de información en Internet y mapa mental', dateStr: '2026-10-17', week: 'Sem. 42' },
  { id: 7, ...AMB, kind: 'TP', evalType: 'TP1', description: 'Ambiente y desarrollo sostenible en Venezuela', dateStr: '2026-10-17', week: 'Sem. 42' },
  { id: 8, ...IND, kind: 'TSP', evalType: 'TSP', description: 'Trabajo Sustitutivo de Prueba de la asignatura', dateStr: '2026-10-17', week: 'Sem. 42' },
  { id: 9, ...INF, kind: 'OBJ', evalType: 'Obj II.2', description: 'Redes sociales y plataformas educativas (infografía digital)', dateStr: '2026-10-31', week: 'Sem. 44' },
  { id: 10, ...LEN, kind: 'TP', evalType: 'TP2', description: 'Comprensión lectora y redacción académica', dateStr: '2026-11-07', week: 'Sem. 45' },
  { id: 11, ...INF, kind: 'OBJ', evalType: 'Obj II.3', description: 'Edublog colaborativo (Google Sites con los 6 objetivos)', dateStr: '2026-11-14', week: 'Sem. 46' },
  { id: 12, ...MAT, kind: 'TSP', evalType: 'TSP2', description: 'Derivadas e integrales aplicadas', dateStr: '2026-11-14', week: 'Sem. 46' },
  { id: 13, ...IND, kind: 'TP', evalType: 'TP', description: 'Fabricación de juguete didáctico y rústico', dateStr: '2026-11-21', week: 'Sem. 47' },
  { id: 14, ...AMB, kind: 'TP', evalType: 'TP2', description: 'Ecosistemas y desarrollo sustentable regional', dateStr: '2026-11-21', week: 'Sem. 47' },
];

// Asignaturas del semestre que todavía no tienen fechas cargadas.
export const MISSING_DATES: { career: CareerId; code: string; name: string }[] = [
  { career: '280', code: '107', name: 'Lógica' },
];
