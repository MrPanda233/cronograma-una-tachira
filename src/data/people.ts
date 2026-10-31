// Asesores del Centro Local y correctores de nivel central.
// Fuente: "Carga académica lapso 2026/2" (Unidad Académica) y la tabla de responsables de la carrera 280.

export const SEDE_EMAIL = "sacademicacltachira@gmail.com";
export const BLOG_116_URL = "https://sites.google.com/view/introduccionalainformatica116/";
export const BLOG_MATE_URL = "https://matematicaunatachira.blogspot.com/";

export interface Person {
  name: string;
  email?: string; // sin correo = pendiente de confirmar (no publicar uno dudoso)
  link?: string;
}

export const ADVISORS = {
  colmenares: { name: "Ing. Danny Colmenares", email: "dcolmenaresuna@gmail.com", link: BLOG_116_URL },
  jaimes: { name: "Prof. Samuel Jaimes", email: "profesorsamjaimesparra@gmail.com" },
  nunez: { name: "Prof. Rose Mary Núñez", email: "rosemarynunez@gmail.com" },
  gmoreno: { name: "Prof. Guido Moreno", email: "aleguidox@gmail.com" },
  roa: { name: "Prof. Eduardo Roa", email: "eduardoroa1976@gmail.com" },
  moncada: { name: "Prof. Keila Moncada", email: "kmoncadaunatachira@gmail.com" },
  ruiz: { name: "Prof. María Ruiz", email: "mariaruizunatachira@gmail.com" },
  // Correos distintos entre los documentos: se muestran cuando estén confirmados.
  mora: { name: "Prof. Elisa Mora" },
  mmoreno: { name: "Prof. Marcos Moreno" },
  villanueva: { name: "Prof. Wendy Villanueva" },
  maldonado: { name: "Prof. Darwin Maldonado" },
} satisfies Record<string, Person>;

export type AdvisorId = keyof typeof ADVISORS;

// Responsables de corrección de TP y TSP, nivel central (carrera 280).
export const CENTRAL = {
  urbina: { name: "Martha Urbina", email: "marthaurbina05@gmail.com" },
  chacon: { name: "José Leonardo Chacón", email: "jlchaconuna@gmail.com" },
  farias: { name: "Richard Farías", email: "richardjf2009@gmail.com" },
  duarte: { name: "Alfredo Duarte", email: "alfredotduarteo@gmail.com" },
  jrodriguez: { name: "José Ramón Rodríguez", email: "jrrp290470@gmail.com" },
  arodriguez: { name: "Ángel Rodríguez", email: "ajrodriguez.una@gmail.com" },
  dcontreras: { name: "Diomaris Contreras", email: "dcontrerasuna@gmail.com" },
  mejias: { name: "Gelin Mejías", email: "gelinsteel07@gmail.com" },
  leon: { name: "Reynaldo León", email: "reynaldoleon2310@gmail.com" },
  jcontreras: { name: "Jesús Contreras", email: "jesusverdi2013@gmail.com" },
  useche: { name: "Julio César Useche", email: "ing.useche86@gmail.com" },
} satisfies Record<string, Person>;

export type CentralId = keyof typeof CENTRAL;
