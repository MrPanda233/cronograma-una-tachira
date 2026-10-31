// Pensum de cada carrera, ordenado por semestre.
// Para el próximo lapso: cambia ACTIVE_SEMESTER y agrega las entregas en schedule.ts.
import type { AdvisorId, CentralId } from './people';

export type CareerId = '281' | '280';

export const ACTIVE_LAPSO = '2026-2';
export const ACTIVE_SEMESTER = 'I';

export interface Subject {
  code: string;
  name: string;
  uc: number;
  prereq?: string;
  advisor: AdvisorId;
  central?: CentralId;
  plan?: string; // id del PDF en Google Drive
}

export interface SemesterGroup {
  id: string;
  label: string;
  note?: string;
  subjects: Subject[];
}

export interface Career {
  id: CareerId;
  name: string;
  short: string;
  totalUC: number;
  maxUC: number;
  group: string;
  plansFolder: string;
  semesters: SemesterGroup[];
}

export const planDownloadUrl = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;
export const planViewUrl = (id: string) => `https://drive.google.com/file/d/${id}/view`;

const CAREER_281: Career = {
  id: '281',
  name: 'TSU Higiene y Seguridad Industrial',
  short: 'TSU HSI',
  totalUC: 107,
  maxUC: 22,
  group: 'https://chat.whatsapp.com/FKmVjp6l73kJwSvn8rXnV8',
  plansFolder: 'https://drive.google.com/drive/folders/1dNFgvQTl1P0PCfxBDJF9wGpqIdAOr21K',
  semesters: [
    {
      id: 'I', label: 'Semestre I', subjects: [
        { code: '115', name: 'Lengua y Comunicación', uc: 3, advisor: 'jaimes', plan: '1rj4t95dOXUtvWVJcL6MCZ0U2UsQ1LWgw' },
        { code: '116', name: 'Introducción a la Informática', uc: 3, advisor: 'colmenares', plan: '1V-6bSlWKMSO6C9j6sYkbbHtVLMPc5czt' },
        { code: '117', name: 'Ambiente y Desarrollo Sostenible en Venezuela', uc: 3, advisor: 'nunez', plan: '1nY6MY8-UpsuocaLT0QZ0k0XEV5j48G1g' },
        { code: '177', name: 'Matemática I', uc: 5, advisor: 'gmoreno', plan: '12S3kZJn2gk6cE29pNAzwvHSlpmwpkbmD' },
        { code: '200', name: 'Introducción a la Ingeniería Industrial', uc: 3, advisor: 'roa', plan: '11brVy0-LUOW1N1r0BBgt02cwRQS9x49i' },
      ],
    },
    {
      id: 'II', label: 'Semestre II', subjects: [
        { code: '119', name: 'Temas de Ética', uc: 2, advisor: 'nunez', plan: '1oQfuZGGFcSzPnSBAKGgsiVmhb_YJj_r5' },
        { code: '179', name: 'Matemática II', uc: 5, prereq: '177', advisor: 'gmoreno', plan: '16riJJ2dV_k41d3POsp22bgwJzmlePmD5' },
        { code: '201', name: 'Seguridad e Higiene Industrial', uc: 3, advisor: 'mora', plan: '1qJXyxtHImATNFqyCljKWiHlwAflWdH4Y' },
        { code: '208', name: 'Dibujo Industrial', uc: 3, advisor: 'mora', plan: '1RobMH6LN3ER9FytcLqapd7Gb13Zjyz0S' },
        { code: '259', name: 'Legislación Laboral', uc: 3, advisor: 'mora', plan: '1zGNpREGmtVyMlgJyAremhgPZr8yWxVRG' },
      ],
    },
    {
      id: 'III', label: 'Semestre III', subjects: [
        { code: '209', name: 'Química', uc: 5, advisor: 'mora', plan: '17O5aJxg1EpTOjbOa3igQqMVznO4SjcxG' },
        { code: '251', name: 'Psicología del Trabajo', uc: 4, advisor: 'roa', plan: '1FB2YDb38aedn7p8FRvCtQtmGjJOEHoJ2' },
        { code: '252', name: 'Prevención de Riesgo I', uc: 4, prereq: '201', advisor: 'mora', plan: '1CApmzXz_bblFjjYnG1X8kSycegEO_xSQ' },
        { code: '300', name: 'Física General I', uc: 4, prereq: '179', advisor: 'moncada', plan: '1ueNEaLsvfer0mRPmBjo-paj2q9l9xTYV' },
        { code: '733', name: 'Matemática III', uc: 5, prereq: '179', advisor: 'gmoreno', plan: '10f8kCWOSVuq-_8b78KnVHdtEboW9cUCY' },
      ],
    },
    {
      id: 'IV', label: 'Semestre IV', subjects: [
        { code: '202', name: 'Procesos de Manufacturas', uc: 4, advisor: 'mora', plan: '1nMiY7OGSDw_dTli9XAzxk5g_hN8SfWMp' },
        { code: '231', name: 'Ingeniería de Materiales', uc: 4, prereq: '300 y 209', advisor: 'roa', plan: '1jwX-AxW_sE_K1Zq--huse6YW4R-Vft7c' },
        { code: '255', name: 'Prevención de Riesgo II', uc: 4, prereq: '252', advisor: 'roa', plan: '1-elyBrVGOfooIPeW35XxfUdaXTpphtrb' },
        { code: '326', name: 'Física General II', uc: 4, prereq: '300', advisor: 'moncada', plan: '1DqJ42AXix3OIKn_RXnSAEckyaK44JyyN' },
        { code: '737', name: 'Introducción a la Probabilidad', uc: 4, prereq: '733', advisor: 'gmoreno', plan: '1YKf0all-X1dsrPFd3k1AZ1EsLYt3j5zj' },
      ],
    },
    {
      id: 'V', label: 'Semestre V', subjects: [
        { code: '207', name: 'Mantenimiento Industrial', uc: 4, prereq: '202', advisor: 'mora', plan: '1UBdcqxHj2GkcHsZxOKwDT3H4SorfSALn' },
        { code: '258', name: 'Ergonomía', uc: 4, prereq: '255', advisor: 'mora', plan: '1y-Ik_082r3KGBA1oOv6jZlX2RDI7wH1y' },
        { code: '315', name: 'Investigación de Operaciones I', uc: 4, advisor: 'ruiz', plan: '1tKQxFW3wkQfwnuzfBDMVhlQKZQe5uTjo' },
        { code: '349', name: 'Organización y Métodos', uc: 4, advisor: 'ruiz', plan: '1-5pnSJIQ2j9HGqs1iqegklTTPw6RtyZu' },
        { code: '738', name: 'Inferencia Estadística', uc: 5, prereq: '737', advisor: 'gmoreno', plan: '16XDJXLJbvtBhzhLU7w89m3aSOiSmQOmz' },
      ],
    },
    {
      id: 'VI', label: 'Semestre VI', subjects: [
        { code: '257', name: 'Pasantía', uc: 6, prereq: '96 UC', advisor: 'roa', plan: '1xa4UghOykZZ2vZ4K10GBxBIPe-MZCzwc' },
      ],
    },
    {
      id: 'EXT', label: 'Extensión y egreso', note: 'Para egresar debes aprobar Inglés (108) y cumplir el Servicio Comunitario (011). Extensión e Inglés no cuentan para el máximo de créditos por lapso.', subjects: [
        { code: '811', name: 'Fundamentos Básicos en la Elaboración de Proyectos', uc: 2, prereq: '40 UC', advisor: 'mora', plan: '1YVR7HNLi7Xd8OVedoCo0VbAql2lKYTKf' },
        { code: '814', name: 'Seminario de Acción Social', uc: 3, prereq: '40 UC', advisor: 'villanueva', plan: '1iiaC6c1P9NaGrBv1UbZw8e-6dfrJF5qW' },
        { code: '816', name: 'Formación de Microempresarios', uc: 3, prereq: '40 UC', advisor: 'maldonado', plan: '1jdN7DwjqIrPqCpo-rNhjUMI5C5suHKrN' },
        { code: '011', name: 'Servicio Comunitario', uc: 0, prereq: '811, 814 u 816, y 75 UC', advisor: 'villanueva' },
        { code: '108', name: 'Inglés', uc: 3, advisor: 'villanueva', plan: '1HTlF-W4AK5srf-bMZJf96tX8TX5oDrpx' },
      ],
    },
  ],
};

const CAREER_280: Career = {
  id: '280',
  name: 'Ingeniería Industrial',
  short: 'Ing. Industrial',
  totalUC: 184,
  maxUC: 24,
  group: 'https://chat.whatsapp.com/DdTkP1Ve3jEBzi7Q99aH5O',
  plansFolder: 'https://drive.google.com/drive/folders/1_AoiymGgijthOjKPaGdaV2udggPKGhvS',
  semesters: [
    {
      id: 'I', label: 'Semestre I', subjects: [
        { code: '107', name: 'Lógica', uc: 3, advisor: 'moncada', plan: '1YXWPekzqCuBDjOE4E7CY5JLLjSdTPtWX' },
        { code: '115', name: 'Lengua y Comunicación', uc: 3, advisor: 'jaimes', plan: '1tmjpwUvL_Khah3dHp54qWFrQFBiY02bv' },
        { code: '116', name: 'Introducción a la Informática', uc: 3, advisor: 'colmenares', plan: '1jeMq-ICmp2sOE2sn8epLTyhCPEPHPvgr' },
        { code: '177', name: 'Matemática I', uc: 5, advisor: 'gmoreno', plan: '1DOgd8FVJIBEm8u-fVcHp4lMwXYR4q913' },
        { code: '200', name: 'Introducción a la Ingeniería Industrial', uc: 3, advisor: 'roa', central: 'dcontreras', plan: '1bwiY-LhxmqZlkz_Ci65MKeML2tD9BoJq' },
      ],
    },
    {
      id: 'II', label: 'Semestre II', subjects: [
        { code: '119', name: 'Temas de Ética', uc: 2, advisor: 'nunez', plan: '1ysTGd8Oi6MwS6PG7Rkf8jrxqNNOCvSkY' },
        { code: '121', name: 'Problemática del Desarrollo Venezolano', uc: 2, advisor: 'jaimes', plan: '1oDirJniqijxsJPXXS_bkzaxYxhlayPyP' },
        { code: '179', name: 'Matemática II', uc: 5, prereq: '177', advisor: 'gmoreno', plan: '1PbvavQre2mUu8wKp_HFwjTm2AFOaPJaA' },
        { code: '208', name: 'Dibujo Industrial', uc: 3, advisor: 'mora', central: 'farias', plan: '1CZcBoB-78R84LOYQCTqa2rt2gEarsgho' },
        { code: '323', name: 'Computación I', uc: 4, prereq: '116 y 177', advisor: 'ruiz', plan: '1NnKGbZwyzgBFz0DuQsnS8bwMaiVgKwwR' },
      ],
    },
    {
      id: 'III', label: 'Semestre III', subjects: [
        { code: '117', name: 'Ambiente y Desarrollo Sostenible en Venezuela', uc: 3, advisor: 'nunez', plan: '1MJ3qNPGJNwIt-DH5OzN1JPLoeNGf6HYF' },
        { code: '209', name: 'Química', uc: 5, advisor: 'mora', central: 'mejias', plan: '1YQlf6FG4u4LSw9ht3USqpmvC03B-F69A' },
        { code: '300', name: 'Física General I', uc: 4, prereq: '179', advisor: 'moncada', plan: '1iEzDeFQ0Qp_yIk4qiOCgri2kl8gFJmuu' },
        { code: '641', name: 'Teoría Económica I', uc: 4, advisor: 'mmoreno', plan: '1DWeJecQ0VUUXxg1ixPteyTK8RjYAmBCE' },
        { code: '733', name: 'Matemática III', uc: 5, prereq: '179', advisor: 'gmoreno', plan: '1CW-YWqOYK11pgnY1zDYsHOH4Y5onOt8F' },
      ],
    },
    {
      id: 'IV', label: 'Semestre IV', subjects: [
        { code: '201', name: 'Seguridad e Higiene Industrial', uc: 3, advisor: 'mora', central: 'useche', plan: '1nTdUO0wsu88KNXyXa0U-txihXFX0cLfL' },
        { code: '231', name: 'Ingeniería de Materiales', uc: 4, prereq: '209 y 300', advisor: 'roa', central: 'jrodriguez', plan: '1fTnzVg6FaxoyaGbdMQGUBJbg50yt937d' },
        { code: '326', name: 'Física General II', uc: 4, prereq: '300', advisor: 'moncada', plan: '1C2SYNzv-ISoHTa7v8cGQyEMBaRndIUuF' },
        { code: '735', name: 'Matemática IV', uc: 5, prereq: '733', advisor: 'gmoreno', plan: '1B5751GjP3MAG6WT171HoQTC9BhuSICg1' },
        { code: '737', name: 'Introducción a la Probabilidad', uc: 4, prereq: '733', advisor: 'gmoreno', plan: '1A-GgbM1nDNoAfUyNz53P6ildFPJLFB1M' },
      ],
    },
    {
      id: 'V', label: 'Semestre V', subjects: [
        { code: '222', name: 'Economía para Ingenieros', uc: 4, prereq: '641', advisor: 'mora', central: 'arodriguez', plan: '1eS1IlYuPx7R1D0o7X4Jsen0WCPDTxV9X' },
        { code: '232', name: 'Mecánica Racional', uc: 4, prereq: '326', advisor: 'mora', central: 'farias', plan: '13JFylsgjzKhmLm8sA-kgF3JogmpmNL1C' },
        { code: '315', name: 'Investigación de Operaciones I', uc: 4, advisor: 'ruiz', plan: '1P6II5Jx5nslVwWrQPoDsuM58k7W3lWG_' },
        { code: '738', name: 'Inferencia Estadística', uc: 5, prereq: '737 y 735', advisor: 'gmoreno', plan: '1Rfv4YDOsQCjQm-3OK88-yPGdtcdAS_18' },
        { code: '739', name: 'Matemática V', uc: 5, prereq: '735', advisor: 'gmoreno', plan: '1HoVl-uHnkCMyHMobNuh3gP1eXy09wgzv' },
      ],
    },
    {
      id: 'VI', label: 'Semestre VI', subjects: [
        { code: '205', name: 'Control de Calidad', uc: 4, prereq: '738', advisor: 'mora', central: 'mejias', plan: '1VfPfXAFI8cmw_amuzvpbrcleQ737Xh2I' },
        { code: '206', name: 'Ingeniería de Métodos', uc: 4, prereq: '315 y 738', advisor: 'roa', central: 'dcontreras', plan: '1bxgdyJApJn2LCC9e4m6FHOXxgGbottxH' },
        { code: '233', name: 'Electrotecnia', uc: 4, prereq: '326 y 739', advisor: 'mora', central: 'duarte', plan: '1lZU__4z7e5q83ouRATdI3NwkJxVwZC5j' },
        { code: '234', name: 'Termofluidos', uc: 4, prereq: '232', advisor: 'roa', central: 'jcontreras', plan: '1He8YadgA0RLsx3DwSZwqVaYe4vSa8d0Z' },
        { code: '655', name: 'Costo Industrial', uc: 4, prereq: '222', advisor: 'mora', plan: '1_Md6kCSH4CC7eGNp0AFMAd-IHFiYCnCL' },
      ],
    },
    {
      id: 'VII', label: 'Semestre VII', subjects: [
        { code: '202', name: 'Procesos de Manufactura', uc: 4, prereq: '231', advisor: 'mora', central: 'arodriguez', plan: '1ZK63t7l9_J86qDHE3CksSsAjVcUqbOM0' },
        { code: '203', name: 'Control de Producción', uc: 4, prereq: '206', advisor: 'mora', central: 'chacon', plan: '1dfCtc-ScH5BJ_YU9P2kBvK2CjjXJBrku' },
        { code: '225', name: 'Evaluación de Proyectos', uc: 3, prereq: '222', advisor: 'mora', central: 'chacon', plan: '19AZCdTJVU_s8BnoTqiDab4DIyqaX-57U' },
        { code: '235', name: 'Gerencia Organizacional', uc: 4, prereq: '655', advisor: 'roa', central: 'arodriguez', plan: '1Le03jzJNMoOPuK2f5WPJVsiRzQlSJTQM' },
        { code: '236', name: 'Logística Industrial', uc: 3, prereq: '206', advisor: 'mora', central: 'chacon', plan: '1F_NLnsWWYJl6beW-lGltI87g3VGnfmeg' },
      ],
    },
    {
      id: 'VIII', label: 'Semestre VIII', subjects: [
        { code: '118', name: 'Metodología de la Investigación', uc: 3, advisor: 'mora', plan: '1JEp5Wtp-vURT6tY7d05m2Cg9N93JAXhA' },
        { code: '204', name: 'Manejo de Materiales', uc: 4, prereq: '236', advisor: 'roa', central: 'urbina', plan: '1RgMckMJPHATqaXoHV8H8M_eBJCkUv0Uq' },
        { code: '207', name: 'Mantenimiento Industrial', uc: 4, prereq: '202', advisor: 'mora', central: 'jcontreras', plan: '10b_ADw2187LnMcjt2B0FmoPjgaiTpT7W' },
        { code: '216', name: 'Ingeniería de Planta', uc: 4, prereq: '225 y 236', advisor: 'mora', central: 'leon', plan: '1sySPFILbH-tPQZVjZWYaSesrqp79396U' },
        { code: '223', name: 'Gerencia Industrial', uc: 4, prereq: '235', advisor: 'roa', central: 'urbina', plan: '1W0ZkaJ195MJcRe7FtunqIiKyMqERxEWD' },
      ],
    },
    {
      id: 'IX', label: 'Semestre IX', subjects: [
        { code: '237', name: 'Práctica Profesional I', uc: 4, prereq: '141 UC y 118', advisor: 'mora', plan: '1vEPqa4IBBMAMFb4z0g4P40VHdyBaF2BL' },
      ],
    },
    {
      id: 'X', label: 'Semestre X', subjects: [
        { code: '238', name: 'Práctica Profesional II', uc: 8, prereq: '237', advisor: 'roa', plan: '1CCLugjR-rdflKk4trE4ftXIMTkUtosHQ' },
      ],
    },
    {
      id: 'ELE', label: 'Electivas', note: 'Mínimo 9 UC. Se escogen en los semestres VI, VII y VIII.', subjects: [
        { code: '228', name: 'Instrumentación y Control', uc: 3, prereq: '96 UC', advisor: 'mora', central: 'duarte', plan: '1yLKAp5zn5VRWrrnnnWiVkuuaLYjjPd8q' },
        { code: '240', name: 'Procesos Químicos', uc: 3, prereq: '96 UC', advisor: 'roa', central: 'jrodriguez', plan: '1H8wYEvu97OwqyxkaSpeHi_pghtthZ2yB' },
        { code: '241', name: 'Gestión de Calidad', uc: 3, prereq: '96 UC', advisor: 'roa', central: 'jrodriguez', plan: '1l009sGrVT7h8yqD8zRIGZpzluP0an1es' },
        { code: '305', name: 'Teoría de Decisiones', uc: 3, prereq: '96 UC', advisor: 'roa', plan: '1ci9b3B1Z_Oi5ypavwZ5LdTqU2ueUy3Qq' },
        { code: '337', name: 'Simulación de Sistemas', uc: 4, prereq: '96 UC', advisor: 'ruiz', plan: '1fdiQezpgJTplcui0TV4qiUmVPAFNmSuw' },
        { code: '348', name: 'Investigación de Operaciones II', uc: 4, prereq: '96 UC', advisor: 'ruiz', plan: '12mwkogjqUWobH2dbVk6I3OBHdL3_qhLG' },
      ],
    },
    {
      id: 'EXT', label: 'Extensión y egreso', note: 'Para egresar debes aprobar Inglés (108) y cumplir el Servicio Comunitario (011). Extensión e Inglés no cuentan para el máximo de créditos por lapso.', subjects: [
        { code: '810', name: 'Redacción de Informes Técnicos', uc: 3, prereq: '40 UC', advisor: 'villanueva', plan: '17eJx-rlvg_TgcDXZjbGwPXEuEuFZYg8S' },
        { code: '811', name: 'Fundamentos Básicos en la Elaboración de Proyectos', uc: 2, prereq: '40 UC', advisor: 'mora', plan: '1cmdtC_Hz95xp9YVnQAnyCYxwyz6L3rZI' },
        { code: '813', name: 'Liderazgo', uc: 3, prereq: '40 UC', advisor: 'roa', plan: '1tqXUxvrJ6sKWzQ3gAgafnpWQwYTp-t0t' },
        { code: '814', name: 'Seminario de Acción Social', uc: 3, prereq: '40 UC', advisor: 'villanueva', plan: '1Dgz2FuOXrPVxwwOOcqk6_Ojdh86xmoke' },
        { code: '816', name: 'Formación de Microempresarios', uc: 3, prereq: '40 UC', advisor: 'maldonado', plan: '1VL67ILI9w9n41NHOc-LlHrrv1SNc5dgK' },
        { code: '011', name: 'Servicio Comunitario', uc: 0, prereq: '811, 814 u 816, y 129 UC', advisor: 'villanueva' },
        { code: '108', name: 'Inglés', uc: 3, advisor: 'villanueva', plan: '1FjNiyY8IEZOReJ5nORx_5-OwHQNcDKGt' },
      ],
    },
  ],
};

export const CAREERS: Record<CareerId, Career> = { '281': CAREER_281, '280': CAREER_280 };

export const activeSubjects = (career: CareerId) =>
  CAREERS[career].semesters.find(s => s.id === ACTIVE_SEMESTER)?.subjects ?? [];

// Color de las asignaturas del semestre en curso (etiquetas y directorio).
export const SUBJECT_COLOR: Record<string, { tag: string; border: string }> = {
  '107': { tag: 'bg-teal-100 text-teal-900 ring-teal-300', border: 'border-teal-600' },
  '115': { tag: 'bg-emerald-100 text-emerald-900 ring-emerald-300', border: 'border-green-600' },
  '116': { tag: 'bg-blue-100 text-blue-900 ring-blue-300', border: 'border-blue-600' },
  '117': { tag: 'bg-orange-100 text-orange-900 ring-orange-300', border: 'border-orange-500' },
  '177': { tag: 'bg-purple-100 text-purple-900 ring-purple-300', border: 'border-purple-600' },
  '200': { tag: 'bg-rose-100 text-rose-900 ring-rose-300', border: 'border-red-600' },
  sede: { tag: 'bg-indigo-100 text-indigo-900 ring-indigo-300', border: 'border-indigo-600' },
};

export const DEFAULT_COLOR = { tag: 'bg-slate-100 text-slate-800 ring-slate-300', border: 'border-slate-400' };
