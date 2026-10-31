// Filtro de contenido de los comentarios. Devuelve el motivo del rechazo, o null si el texto pasa.
import { MAX_BODY, MIN_BODY } from '../shared/comments';

// Palabras completas (sin acentos, ñ escrita como "ny"). Se compara palabra por palabra
// para no bloquear palabras normales como "computadora" o "disputa".
const BANNED = [
  'mierda', 'mierdas', 'puta', 'putas', 'puto', 'putos', 'putita', 'putazo', 'putear', 'hijueputa', 'hijoputa', 'hijodeputa', 'hdp',
  'mamaguevo', 'mamaguebo', 'mamahuevo', 'mamawebo', 'mamawevo', 'mmg', 'mmgv', 'mmgvo', 'marico', 'marica', 'maricon', 'maricos', 'maricas', 'maricones',
  'verga', 'vergas', 'vergacion', 'vergajo', 'conyo', 'conyazo', 'conyaza', 'conyoetumadre', 'conchetumadre', 'pendejo', 'pendeja', 'pendejos', 'pendejas', 'pendejada',
  'gueva', 'guevon', 'guevona', 'huevon', 'huevona', 'webon', 'culo', 'culos', 'culiar', 'culear', 'culero', 'cojones', 'cojudo', 'cojuda',
  'cabron', 'cabrona', 'cabrones', 'joder', 'jodete', 'jodido', 'jodida', 'nojoda', 'pinga', 'pingon', 'tetas', 'tetona', 'chupame', 'mamame', 'mamada',
  'porno', 'porn', 'xxx', 'zorra', 'zorras', 'perra', 'perras', 'idiota', 'idiotas', 'imbecil', 'imbeciles', 'estupido', 'estupida', 'tarado', 'tarada', 'retrasado', 'retrasada',
  'gonorrea', 'malparido', 'malparida', 'fuck', 'fucking', 'shit', 'bitch', 'asshole', 'dick', 'pussy',
];

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's' };

const collapse = (word: string) => word.replace(/(.)\1+/g, '$1');

const BANNED_RAW = new Set(BANNED);
// Las palabras con letras dobles (perra, zorra) no entran aquí: colapsadas serían "pera" o "zora".
const BANNED_COLLAPSED = new Set(BANNED.filter(w => collapse(w) === w));

// Convierte el texto en palabras comparables, deshaciendo trucos como "p u t a", "m1erda" o "puuuta".
export function tokens(text: string): string[] {
  const clean = text
    .toLowerCase()
    .replace(/ñ/g, 'ny')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[013457@$]/g, c => LEET[c]);
  const words = clean.split(/[^a-z]+/).filter(Boolean);

  const joined: string[] = [];
  let run = '';
  for (const word of words) {
    if (word.length === 1) { run += word; continue; }
    if (run) { joined.push(run); run = ''; }
    joined.push(word);
  }
  if (run) joined.push(run);
  return joined;
}

export const hasBannedWord = (text: string) =>
  tokens(text).some(w => BANNED_RAW.has(w) || BANNED_COLLAPSED.has(collapse(w)));

const LINK = /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|ve|edu|gov|info|io|co|ly|app|xyz|site|online|click|link|top|shop|store)\b|t\.me\/|wa\.me\/|@[a-z0-9_])/i;
const LONG_NUMBER = /(?:\d[\s.\-]?){7,}/;
const REPEATED = /(.)\1{7,}/u;

export function reviewBody(body: string): string | null {
  const length = [...body].length;
  if (length < MIN_BODY) return 'Escribe un poco más.';
  if (length > MAX_BODY) return `El máximo es de ${MAX_BODY} caracteres.`;
  if (body.split('\n').length > 10) return 'El comentario tiene demasiadas líneas.';
  if (LINK.test(body)) return 'No se permiten enlaces ni correos en los comentarios.';
  if (LONG_NUMBER.test(body)) return 'No publiques tu cédula ni números de teléfono.';
  if (REPEATED.test(body)) return 'Revisa tu comentario: tiene muchas letras repetidas.';
  if (hasBannedWord(body)) return 'Tu comentario tiene palabras que no se permiten aquí.';
  return null;
}

// Huella para detectar comentarios repetidos aunque cambien mayúsculas o signos.
export const fingerprint = (body: string) => tokens(body).join(' ').slice(0, 200) || body.trim();
