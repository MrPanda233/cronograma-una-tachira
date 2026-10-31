import { ExternalLink, FileText, FolderOpen, MessageCircle, type LucideIcon } from 'lucide-react';
import { DOCUMENT_LINKS, WHATSAPP_LINKS } from '../data/links';
import { SectionHeading } from './ui';

function LinkList({ links, Icon }: { links: { title: string; url: string; host: string }[]; Icon: LucideIcon }) {
  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
      {links.map(link => (
        <li key={link.url}>
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="group flex min-h-14 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-blue-50/60">
            <span className="flex min-w-0 items-center gap-3">
              <Icon className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block font-bold text-ink group-hover:text-brand-800">{link.title}</span>
                <span className="block truncate text-xs text-slate-500">{link.host}</span>
              </span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-brand-700" aria-label="Abre en otra pestaña" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function LinksView() {
  return (
    <div className="mb-10 space-y-8">
      <section>
        <SectionHeading Icon={FolderOpen} title="Enlaces oficiales" />
        <p className="-mt-2 mb-4 max-w-2xl text-sm text-slate-600">
          Material para revisar por orden y por código. Estos sitios no los administra este portal.
        </p>
        <LinkList links={DOCUMENT_LINKS} Icon={FileText} />
      </section>
      <section>
        <SectionHeading Icon={MessageCircle} title="Canales de WhatsApp" />
        <p className="-mt-2 mb-4 max-w-2xl text-sm text-slate-600">
          Son canales para leer avisos, no chats. Para preguntar, escríbele a tu asesor.
        </p>
        <LinkList links={WHATSAPP_LINKS} Icon={MessageCircle} />
      </section>
    </div>
  );
}
