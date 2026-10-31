// Captcha propio: una operación o unas letras al azar, dibujadas como imagen.
// La imagen está hecha de cuadritos, sin texto dentro, para que un bot no pueda leerla del código.
// La ficha va firmada, vence a los 10 minutos y solo sirve para un intento.

const GLYPHS: Record<string, string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  'x': ['00000', '10001', '01010', '00100', '01010', '10001', '00000'],
  '=': ['00000', '00000', '11111', '00000', '11111', '00000', '00000'],
  '?': ['01110', '10001', '00001', '00010', '00100', '00000', '00100'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10011', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
};

// Sin letras que se confundan (I, O, Q, B).
const LETTERS = 'ACDEFGHJKLMNPRSTUVWXYZ';
const INK = ['#0d47a1', '#10223a', '#7c2d12', '#581c87', '#065f46'];
const NOISE = ['#cbd5e1', '#bfdbfe', '#fde68a', '#fbcfe8'];

const CELL = 4;
const GLYPH_WIDTH = CELL * 6 + 6;
const HEIGHT = 56;

const randomInt = (min: number, max: number) => {
  const range = max - min + 1;
  return min + (crypto.getRandomValues(new Uint32Array(1))[0] % range);
};

const pick = <T,>(items: readonly T[] | string) => items[randomInt(0, items.length - 1)] as T;

const num = (value: number) => value.toFixed(1);

function renderImage(chars: string[]) {
  const width = chars.length * GLYPH_WIDTH + 16;
  const parts: string[] = [`<rect width="${width}" height="${HEIGHT}" rx="10" fill="#f1f5f9"/>`];

  for (let i = 0; i < 5; i++) {
    parts.push(`<path d="M${randomInt(0, width)} ${randomInt(0, HEIGHT)}Q${randomInt(0, width)} ${randomInt(0, HEIGHT)} ${randomInt(0, width)} ${randomInt(0, HEIGHT)}" fill="none" stroke="${pick<string>(NOISE)}" stroke-width="${randomInt(1, 2)}"/>`);
  }
  for (let i = 0; i < 22; i++) {
    parts.push(`<circle cx="${randomInt(0, width)}" cy="${randomInt(0, HEIGHT)}" r="${num(0.6 + Math.random())}" fill="${pick<string>(NOISE)}"/>`);
  }

  chars.forEach((char, index) => {
    const glyph = GLYPHS[char];
    const x = 10 + index * GLYPH_WIDTH + randomInt(-2, 2);
    const y = 11 + randomInt(-5, 5);
    const angle = randomInt(-14, 14);
    const ink = pick<string>(INK);
    const cells: string[] = [];
    glyph.forEach((row, rowIndex) => {
      [...row].forEach((bit, columnIndex) => {
        if (bit !== '1') return;
        const jitterX = num(columnIndex * CELL + Math.random() * 0.8);
        const jitterY = num(rowIndex * CELL + Math.random() * 0.8);
        cells.push(`<rect x="${jitterX}" y="${jitterY}" width="${CELL}" height="${CELL}" rx="1"/>`);
      });
    });
    parts.push(`<g fill="${ink}" transform="translate(${x} ${y}) rotate(${angle} 10 14)">${cells.join('')}</g>`);
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${HEIGHT}" viewBox="0 0 ${width} ${HEIGHT}">${parts.join('')}</svg>`;
  return { image: `data:image/svg+xml,${encodeURIComponent(svg)}`, width, height: HEIGHT };
}

function createPuzzle() {
  const kind = randomInt(0, 3);
  if (kind === 0) {
    const a = randomInt(2, 15);
    const b = randomInt(2, 15);
    return { chars: [...`${a}+${b}=?`], answer: String(a + b), prompt: 'Resuelve la suma', kind: 'math' as const };
  }
  if (kind === 1) {
    const a = randomInt(6, 20);
    const b = randomInt(1, a - 1);
    return { chars: [...`${a}-${b}=?`], answer: String(a - b), prompt: 'Resuelve la resta', kind: 'math' as const };
  }
  if (kind === 2) {
    const a = randomInt(2, 9);
    const b = randomInt(2, 6);
    return { chars: [...`${a}x${b}=?`], answer: String(a * b), prompt: 'Resuelve la multiplicación', kind: 'math' as const };
  }
  const letters = Array.from({ length: 5 }, () => pick<string>(LETTERS));
  return { chars: letters, answer: letters.join(''), prompt: 'Escribe las letras', kind: 'letters' as const };
}

export const normalizeAnswer = (answer: string) => answer.replace(/\s+/g, '').toUpperCase();

const toHex = (buffer: ArrayBuffer) => [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');

export async function sign(key: CryptoKey, text: string) {
  return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text)));
}

const CAPTCHA_TTL = 10 * 60_000;
const PASS_TTL = 15 * 60_000;

export async function createChallenge(key: CryptoKey) {
  const puzzle = createPuzzle();
  const payload = `${crypto.randomUUID()}.${Date.now() + CAPTCHA_TTL}`;
  const signature = await sign(key, `${payload}|${normalizeAnswer(puzzle.answer)}`);
  return { token: `${payload}.${signature}`, prompt: puzzle.prompt, kind: puzzle.kind, length: puzzle.answer.length, ...renderImage(puzzle.chars) };
}

export const sameText = (a: string, b: string) => {
  let difference = a.length ^ b.length;
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
};

// Pase que se entrega al resolver el captcha. Permite publicar una sola vez.
export async function issuePass(key: CryptoKey) {
  const payload = `${crypto.randomUUID()}.${Date.now() + PASS_TTL}`;
  return `${payload}.${await sign(key, `pase|${payload}`)}`;
}

export async function readPass(key: CryptoKey, pass: string) {
  const [nonce, expires, signature, extra] = pass.split('.');
  if (!nonce || !expires || !signature || extra !== undefined) return null;
  const expected = await sign(key, `pase|${nonce}.${expires}`);
  return sameText(expected, signature) ? { nonce, expiresAt: Number(expires) } : null;
}

// Comprueba la firma sin gastar la ficha. Devuelve los datos de la ficha, o null si no es válida.
export async function readToken(key: CryptoKey, token: string, answer: string) {
  const [nonce, expires, signature, extra] = token.split('.');
  if (!nonce || !expires || !signature || extra !== undefined) return null;
  const expected = await sign(key, `${nonce}.${expires}|${normalizeAnswer(answer)}`);
  return { nonce, expiresAt: Number(expires), correct: sameText(expected, signature) };
}
