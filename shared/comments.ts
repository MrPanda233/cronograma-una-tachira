// Datos que comparten la web y el servidor de comentarios.

export const MAX_BODY = 500;
export const MIN_BODY = 2;
export const MIN_FILL_MS = 3000;

// Solo se puede comentar con estos nombres: así nadie puede usar un nick obsceno.
export const NICKS = [
  { id: 'buho', name: 'Búho del TSP', emoji: '🦉' },
  { id: 'casco', name: 'Casco Seguro', emoji: '⛑️' },
  { id: 'camino', name: 'Ingeniería en Camino', emoji: '🛠️' },
  { id: 'tsu', name: 'Futuro TSU', emoji: '🎓' },
  { id: 'objetivos', name: 'Caza Objetivos', emoji: '🎯' },
  { id: 'derivada', name: 'Derivada Feliz', emoji: '📈' },
  { id: 'integral', name: 'Integral Definida', emoji: '🧮' },
  { id: 'brujula', name: 'Brújula del SDA', emoji: '🧭' },
  { id: 'mr', name: 'Fan del MR', emoji: '📝' },
  { id: 'pdf', name: 'PDF Puntual', emoji: '📄' },
  { id: 'prelacion', name: 'Prelación Cumplida', emoji: '✅' },
  { id: 'credito', name: 'Unidad de Crédito', emoji: '🏅' },
  { id: 'sabado', name: 'Turno del Sábado', emoji: '🗓️' },
  { id: 'viernes', name: 'Viernes de Asesoría', emoji: '📚' },
  { id: 'cafe', name: 'Café y Apuntes', emoji: '☕' },
  { id: 'apuntes', name: 'Apuntes al Día', emoji: '🗒️' },
  { id: 'mapa', name: 'Mapa Mental', emoji: '🧠' },
  { id: 'enlace', name: 'Enlace Compartido', emoji: '🔗' },
  { id: 'extintor', name: 'Extintor Listo', emoji: '🧯' },
  { id: 'chaleco', name: 'Chaleco Reflectivo', emoji: '🦺' },
  { id: 'senal', name: 'Señal de Seguridad', emoji: '⚠️' },
  { id: 'tornillo', name: 'Tornillo Firme', emoji: '🔩' },
  { id: 'engranaje', name: 'Engranaje Fino', emoji: '⚙️' },
  { id: 'fabrica', name: 'Fábrica de Ideas', emoji: '🏭' },
  { id: 'andes', name: 'Orgullo Tachirense', emoji: '🏔️' },
  { id: 'noche', name: 'Noche de Estudio', emoji: '🌙' },
  { id: 'madrugada', name: 'Madrugada de TP', emoji: '⏰' },
  { id: 'meta', name: 'Última Entrega', emoji: '🏁' },
  { id: 'semilla', name: 'Semilla del Semestre', emoji: '🌱' },
  { id: 'lapso', name: 'Lapso en Curso', emoji: '⏳' },
] as const;

export type NickId = (typeof NICKS)[number]['id'];

export const isNick = (id: unknown): id is NickId => NICKS.some(n => n.id === id);

export const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'] as const;

export interface CommentDto {
  id: string;
  parentId: string | null;
  nick: string;
  tag: string;
  body: string;
  createdAt: number;
  reactions: Record<string, number>;
  mine: string[];
  replies: CommentDto[];
}

export interface CommentsPage {
  comments: CommentDto[];
  nextCursor: number | null;
  canPost: boolean;
}

export interface CaptchaChallenge {
  token: string;
  prompt: string;
  image: string;
  width: number;
  height: number;
}
