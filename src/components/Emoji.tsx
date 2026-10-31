import { useMemo } from 'react';
import { NICKS, REACTIONS } from '../../shared/comments';
import { EMOJI_GROUPS } from '../data/emojis';

// Los emojis son imágenes propias para que se vean igual en cualquier teléfono.
const stripVariation = (char: string) => (char.includes('‍') ? char : char.replace(/️/g, ''));

const emojiUrl = (char: string) =>
  `/emoji/${[...stripVariation(char)].map(c => c.codePointAt(0)?.toString(16)).join('-')}.svg`;

const KNOWN = new Set([
  ...EMOJI_GROUPS.flatMap(group => group.emojis),
  ...NICKS.map(nick => nick.emoji),
  ...REACTIONS,
].map(stripVariation));

export function Emoji({ char, className = 'h-5 w-5' }: { char: string; className?: string }) {
  return (
    <img
      src={emojiUrl(char)}
      alt={char}
      draggable={false}
      decoding="async"
      className={`inline-block shrink-0 select-none align-[-0.2em] ${className}`}
    />
  );
}

// Muestra un comentario como texto. Nunca se interpreta como HTML: lo escrito solo puede salir
// como texto, y los emojis conocidos se cambian por una imagen de la lista propia.
export function EmojiText({ text }: { text: string }) {
  const parts = useMemo(() => {
    if (typeof Intl.Segmenter !== 'function') return [text];
    const result: (string | { emoji: string })[] = [];
    for (const { segment } of new Intl.Segmenter('es', { granularity: 'grapheme' }).segment(text)) {
      const last = result[result.length - 1];
      if (KNOWN.has(stripVariation(segment))) result.push({ emoji: segment });
      else if (typeof last === 'string') result[result.length - 1] = `${last}${segment}`;
      else result.push(segment);
    }
    return result;
  }, [text]);

  return (
    <>
      {parts.map((part, index) => (typeof part === 'string'
        ? <span key={index}>{part}</span>
        : <Emoji key={index} char={part.emoji} className="mx-px h-[1.2em] w-[1.2em]" />))}
    </>
  );
}
