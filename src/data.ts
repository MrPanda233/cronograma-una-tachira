// Datos del cronograma. Para actualizar fechas, asesores o enlaces, edita solo este archivo.

export interface Evaluation {
  id: number;
  code: string;
  subject: string;
  evalType: string;
  description: string;
  dateStr: string; // YYYY-MM-DD
  week: string;
  advisor: string;
  email: string;
}

export const BLOG_116_URL = "https://sites.google.com/view/introduccionalainformatica116/";
export const BLOG_MATE_URL = "https://matematicaunatachira.blogspot.com/";
export const SEDE_EMAIL = "sacademicacltachira@gmail.com";

// Color de cada asignatura (etiquetas del cronograma y del directorio).
export const SUBJECT_TAG: Record<string, string> = {
  "115": "bg-emerald-100 text-emerald-900 ring-emerald-300",
  "116": "bg-blue-100 text-blue-900 ring-blue-300",
  "117": "bg-orange-100 text-orange-900 ring-orange-300",
  "177": "bg-purple-100 text-purple-900 ring-purple-300",
  "200": "bg-rose-100 text-rose-900 ring-rose-300",
  "Sede": "bg-indigo-100 text-indigo-900 ring-indigo-300",
};

// Semestre I compartido por las carreras 281 (TSU Higiene y Seguridad Industrial) y 280 (Ingeniería Industrial).
// Nombres de asignaturas según el pensum 281.
export const EVALUATIONS: Evaluation[] = [
  {
    id: 1, code: "116", subject: "Introducción a la Informática", evalType: "Obj I.1",
    description: "Objetivo I.1 — Fundamentos de la ergonomía y postura",
    dateStr: "2026-07-25", week: "Pasado",
    advisor: "Ing. Danny Colmenares", email: "dcolmenaresuna@gmail.com",
  },
  {
    id: 2, code: "116", subject: "Introducción a la Informática", evalType: "Obj I.2",
    description: "Objetivo I.2 — Términos de informática y computación (Tabla y Diapositivas)",
    dateStr: "2026-09-19", week: "Pasado",
    advisor: "Ing. Danny Colmenares", email: "dcolmenaresuna@gmail.com",
  },
  {
    id: 3, code: "115", subject: "Lengua y Comunicación", evalType: "TP1",
    description: "Trabajo Práctico 1 — Objetivos I.1 a I.4 (Infografía, Cuadros y Análisis)",
    dateStr: "2026-10-03", week: "Sem. 40",
    advisor: "Prof. Samuel Jaimes", email: "profesorsamjaimesparra@gmail.com",
  },
  {
    id: 4, code: "116", subject: "Introducción a la Informática", evalType: "Obj I.3",
    description: "Objetivo I.3 — Uso de hoja de cálculo en línea y documento explicativo",
    dateStr: "2026-10-03", week: "Sem. 40",
    advisor: "Ing. Danny Colmenares", email: "dcolmenaresuna@gmail.com",
  },
  {
    id: 5, code: "177", subject: "Matemática I", evalType: "TSP1",
    description: "Trabajo Sustitutivo de Prueba 1 — Operadores, Funciones y Límites",
    dateStr: "2026-10-10", week: "Sem. 41",
    advisor: "Prof. Guido Moreno", email: "aleguidox@gmail.com",
  },
  {
    id: 6, code: "116", subject: "Introducción a la Informática", evalType: "Obj II.1",
    description: "Objetivo II.1 — Fuentes confiables de información en Internet y mapa mental",
    dateStr: "2026-10-17", week: "Sem. 42",
    advisor: "Ing. Danny Colmenares", email: "dcolmenaresuna@gmail.com",
  },
  {
    id: 7, code: "117", subject: "Ambiente y Desarrollo Sostenible en Venezuela", evalType: "TP1",
    description: "Trabajo Práctico 1 — Ambiente y Desarrollo Sostenible en Venezuela",
    dateStr: "2026-10-17", week: "Sem. 42",
    advisor: "Prof. Rose Mary Núñez", email: "rosemarynunez@gmail.com",
  },
  {
    id: 8, code: "200", subject: "Introducción a la Ingeniería Industrial", evalType: "TSP",
    description: "Trabajo Sustitutivo de Prueba (TSP) — Publicado por SDA (1 día de resolución)",
    dateStr: "2026-10-17", week: "Sem. 42",
    advisor: "Prof. Eduardo Roa", email: "eduardoroa1976@gmail.com",
  },
  {
    id: 9, code: "116", subject: "Introducción a la Informática", evalType: "Obj II.2",
    description: "Objetivo II.2 — Redes sociales y plataformas educativas (Infografía digital)",
    dateStr: "2026-10-31", week: "Sem. 44",
    advisor: "Ing. Danny Colmenares", email: "dcolmenaresuna@gmail.com",
  },
  {
    id: 10, code: "115", subject: "Lengua y Comunicación", evalType: "TP2",
    description: "Trabajo Práctico 2 — Comprensión Lectora y Redacción Académica",
    dateStr: "2026-11-07", week: "Sem. 45",
    advisor: "Prof. Samuel Jaimes", email: "profesorsamjaimesparra@gmail.com",
  },
  {
    id: 11, code: "116", subject: "Introducción a la Informática", evalType: "Obj II.3",
    description: "Objetivo II.3 — Edublog Colaborativo (Google Sites con los 6 objetivos)",
    dateStr: "2026-11-14", week: "Sem. 46",
    advisor: "Ing. Danny Colmenares", email: "dcolmenaresuna@gmail.com",
  },
  {
    id: 12, code: "177", subject: "Matemática I", evalType: "TSP2",
    description: "Trabajo Sustitutivo de Prueba 2 — Derivadas e Integrales Aplicadas",
    dateStr: "2026-11-14", week: "Sem. 46",
    advisor: "Prof. Guido Moreno", email: "aleguidox@gmail.com",
  },
  {
    id: 13, code: "200", subject: "Introducción a la Ingeniería Industrial", evalType: "TP",
    description: "Trabajo Práctico (TP) — Fabricación de Juguete Didáctico y Rústico",
    dateStr: "2026-11-21", week: "Sem. 47",
    advisor: "Prof. Eduardo Roa", email: "eduardoroa1976@gmail.com",
  },
  {
    id: 14, code: "117", subject: "Ambiente y Desarrollo Sostenible en Venezuela", evalType: "TP2",
    description: "Trabajo Práctico 2 — Ecosistemas y Desarrollo Sustentable Regional",
    dateStr: "2026-11-21", week: "Sem. 47",
    advisor: "Prof. Rose Mary Núñez", email: "rosemarynunez@gmail.com",
  },
];

export const ADVISORS = [
  { code: "115", name: "Prof. Samuel Jaimes", subject: "Lengua y Comunicación", email: "profesorsamjaimesparra@gmail.com" },
  { code: "116", name: "Ing. Danny Colmenares", subject: "Introducción a la Informática", email: "dcolmenaresuna@gmail.com", link: BLOG_116_URL },
  { code: "117", name: "Prof. Rose Mary Núñez", subject: "Ambiente y Desarrollo Sostenible en Venezuela", email: "rosemarynunez@gmail.com" },
  { code: "177", name: "Prof. Guido Moreno", subject: "Matemática I", email: "aleguidox@gmail.com" },
  { code: "200", name: "Prof. Eduardo Roa", subject: "Introducción a la Ingeniería Industrial", email: "eduardoroa1976@gmail.com" },
  { code: "Sede", name: "Jefatura de Unidad Académica", subject: "Centro Local Táchira", email: SEDE_EMAIL },
];

// Destinos reales de los antiguos enlaces de tinyurl (sin acortador ni parámetros de rastreo).
export const OFFICIAL_LINKS = [
  { title: "Pensum y plan de estudio", url: "https://unidadacademicacla.blogspot.com/p/oferta-academica.html", host: "unidadacademicacla.blogspot.com" },
  { title: "Planes de curso", url: "https://subprogramadisenoacademicouna826543778.wordpress.com/acerca-de/", host: "Diseño Académico UNA" },
  { title: "Trabajos prácticos (TP)", url: "https://subprogramadisenoacademicouna826543778.wordpress.com/trabajos-practicos/", host: "Diseño Académico UNA" },
  { title: "Trabajos sustitutivos de prueba (TSP)", url: "https://subprogramadisenoacademicouna826543778.wordpress.com/trabajos-sustitutivos-de-pruebas/", host: "Diseño Académico UNA" },
  { title: "Material instruccional (libros y guías)", url: "https://materialinstruccionalunagratis.wordpress.com/about/", host: "materialinstruccionalunagratis.wordpress.com" },
  { title: "Consultar alumnos validados", url: "https://sites.google.com/view/registrounatachira/listado-de-validados", host: "Registro UNA Táchira" },
];
