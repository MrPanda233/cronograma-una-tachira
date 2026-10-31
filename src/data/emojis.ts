// Panel de emojis de los comentarios, agrupado como en WhatsApp y Telegram.
import { BookOpen, Hand, Smile, Sparkles, type LucideIcon } from 'lucide-react';

export const EMOJI_GROUPS: { id: string; label: string; Icon: LucideIcon; emojis: string[] }[] = [
  {
    id: 'caras',
    label: 'Caras',
    Icon: Smile,
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😜', '🤪', '😎', '🤓', '🧐', '🤔', '🤨', '😐', '😶', '🙄', '😏', '😬', '😮', '😯', '😲', '🥱', '😴', '😪', '😵', '🤯', '🥳', '🥺', '😢', '😭', '😤', '😠', '😱', '😰', '😓', '🤗', '🫡'],
  },
  {
    id: 'gestos',
    label: 'Gestos',
    Icon: Hand,
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤝', '👏', '🙌', '🙏', '💪', '👋', '🤙', '👉', '👈', '👆', '👇', '✋', '🫶', '🤲', '✍️', '🧠', '👀', '🙋', '🤷', '🤦', '🧑‍🎓', '🧑‍🏫', '👷', '🧑‍🔧', '🧑‍💻'],
  },
  {
    id: 'estudio',
    label: 'Estudio',
    Icon: BookOpen,
    emojis: ['📚', '📖', '📝', '✏️', '📐', '📏', '🧮', '📊', '📈', '📉', '📅', '🗓️', '⏰', '⏳', '📌', '📎', '📄', '🗂️', '💻', '📱', '🔍', '💡', '🎓', '🏫', '🧪', '🛠️', '⚙️', '⛑️', '🦺', '🧯'],
  },
  {
    id: 'varios',
    label: 'Varios',
    Icon: Sparkles,
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💯', '✅', '❌', '⚠️', '❓', '❗', '🔥', '⭐', '✨', '🎉', '🎊', '🏆', '🥇', '🎯', '🚀', '☕', '🍕', '🌙', '☀️', '🌧️', '🏔️', '🇻🇪', '🍀'],
  },
];
