import type { ReactNode } from 'react';
import { cn } from '@deutschflow/ui';

export const SECTION_IDS = {
  hero: 'hero',
  how: 'how-it-works',
  tutor: 'ai-tutor',
  world: 'immersive-world',
  path: 'learning-path',
  speaking: 'speaking-practice',
  personalized: 'personalized-learning',
  progress: 'progress',
  testimonials: 'testimonials',
  faq: 'faq',
  cta: 'get-started',
} as const;

export const NAV_LINKS = [
  { href: `#${SECTION_IDS.how}`, label: 'How it works' },
  { href: `#${SECTION_IDS.tutor}`, label: 'AI tutor' },
  { href: `#${SECTION_IDS.path}`, label: 'Learning path' },
  { href: `#${SECTION_IDS.faq}`, label: 'FAQ' },
] as const;

export function Section({
  id,
  labelledBy,
  className,
  children,
  tone = 'white',
}: {
  id: string;
  labelledBy: string;
  className?: string;
  children: ReactNode;
  tone?: 'white' | 'muted' | 'dark';
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'scroll-mt-16 py-20 sm:py-24',
        tone === 'muted' && 'bg-slate-50',
        tone === 'dark' && 'bg-slate-950 text-white',
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function SectionHeader({
  id,
  eyebrow,
  title,
  lead,
  align = 'left',
  dark = false,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  dark?: boolean;
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <p className={cn('text-sm font-semibold uppercase tracking-wider', dark ? 'text-indigo-300' : 'text-indigo-600')}>{eyebrow}</p>
      <h2 id={id} className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {lead ? <p className={cn('mt-4 text-lg', dark ? 'text-slate-300' : 'text-slate-600')}>{lead}</p> : null}
    </div>
  );
}

const ICON_PATHS = {
  chat: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.12 2.99 2.7 3.22 1.09.16 2.19.28 3.3.37V21l4.18-4.18a1.15 1.15 0 0 1 .78-.33 48.4 48.4 0 0 0 5.83-.5c1.58-.23 2.7-1.62 2.7-3.23V6.74c0-1.6-1.12-2.99-2.7-3.22A48.4 48.4 0 0 0 12 3c-2.39 0-4.73.17-7.02.5-1.58.24-2.7 1.63-2.7 3.23v6.02Z',
  sparkles: 'M9.8 15.9 9 18.75l-.8-2.85a4.5 4.5 0 0 0-3.1-3.1L2.25 12l2.85-.8a4.5 4.5 0 0 0 3.1-3.1L9 5.25l.8 2.85a4.5 4.5 0 0 0 3.1 3.1l2.85.8-2.85.8a4.5 4.5 0 0 0-3.1 3.1ZM18.26 8.72 18 9.75l-.26-1.03a3.38 3.38 0 0 0-2.46-2.46L14.25 6l1.03-.26a3.38 3.38 0 0 0 2.46-2.46L18 2.25l.26 1.03a3.38 3.38 0 0 0 2.46 2.46l1.03.26-1.03.26a3.38 3.38 0 0 0-2.46 2.46Z',
  brain: 'M12 18v-5.25m0 0a6 6 0 0 0 1.5-.19m-1.5.19a6 6 0 0 1-1.5-.19m3.75 7.48a12.06 12.06 0 0 1-4.5 0m3.75 2.38a14.4 14.4 0 0 1-3 0M14.25 18v-.19c0-.98.66-1.82 1.51-2.32a7.5 7.5 0 1 0-7.52 0c.85.5 1.51 1.34 1.51 2.32V18',
  target: 'M15.75 10.5 12 14.25 10.5 12.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  mic: 'M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z',
  bolt: 'm3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z',
  shuffle: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
  book: 'M12 6.04A8.97 8.97 0 0 0 6 3.75c-1.05 0-2.06.18-3 .51v14.25A8.99 8.99 0 0 1 6 18c2.3 0 4.4.87 6 2.29m0-14.25a8.97 8.97 0 0 1 6-2.29c1.05 0 2.06.18 3 .51v14.25A8.99 8.99 0 0 0 18 18a8.97 8.97 0 0 0-6 2.29m0-14.25v14.25',
  scale: 'M12 3v17.25m0 0c-1.47 0-2.87.3-4.13.86M12 20.25c1.47 0 2.87.3 4.13.86M3.75 6.75h16.5M6 6.75 3 15a3.75 3.75 0 0 0 6 0L6 6.75Zm12 0L15 15a3.75 3.75 0 0 0 6 0l-3-8.25Z',
  face: 'M15.18 15.18a4.5 4.5 0 0 1-6.36 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .41-.17.75-.38.75s-.37-.34-.37-.75.17-.75.38-.75.37.34.37.75Zm-.38 0h.01v.02h-.01v-.02Zm5.63 0c0 .41-.17.75-.38.75s-.37-.34-.37-.75.17-.75.38-.75.37.34.37.75Zm-.38 0h.01v.02h-.01v-.02Z',
  chart: 'M3 13.13C3 12.5 3.5 12 4.13 12h2.25c.62 0 1.12.5 1.12 1.13v6.75c0 .62-.5 1.12-1.12 1.12H4.13C3.5 21 3 20.5 3 19.88v-6.75ZM9.75 8.63c0-.63.5-1.13 1.13-1.13h2.25c.62 0 1.12.5 1.12 1.13v11.25c0 .62-.5 1.12-1.12 1.12h-2.25c-.63 0-1.13-.5-1.13-1.12V8.63ZM16.5 4.13c0-.63.5-1.13 1.13-1.13h2.25C20.5 3 21 3.5 21 4.13v15.75c0 .62-.5 1.12-1.12 1.12h-2.25c-.63 0-1.13-.5-1.13-1.12V4.13Z',
  compass: 'M9 6.75V15m6-6v8.25m.5 3.5 4.87-2.44c.38-.19.63-.58.63-1V4.82c0-.84-.88-1.38-1.63-1.01l-3.87 1.94a1.13 1.13 0 0 1-1 0L9.5 3.25a1.13 1.13 0 0 0-1 0L3.62 5.69c-.38.19-.62.58-.62 1v12.49c0 .84.88 1.38 1.63 1.01l3.87-1.94c.32-.16.69-.16 1 0l4.99 2.5c.32.16.69.16 1 0Z',
  memory: 'M16.02 9.35h4.99v-.01M2.99 19.64v-5m0 0h5m-5 0 3.18 3.18a8.25 8.25 0 0 0 13.8-3.7M4.03 9.87a8.25 8.25 0 0 1 13.8-3.7l3.18 3.18m0-4.99v4.99',
  check: 'm4.5 12.75 6 6 9-13.5',
  calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
  journal: 'M16.86 4.49 18.55 2.8a1.88 1.88 0 1 1 2.65 2.65L10.58 16.07a4.5 4.5 0 0 1-1.9 1.13L6 18l.8-2.68a4.5 4.5 0 0 1 1.13-1.9l8.94-8.93Zm0 0L19.5 7.13M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10',
  arrow: 'M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3',
  plus: 'M12 4.5v15m7.5-7.5h-15',
} as const;

export type IconName = keyof typeof ICON_PATHS;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-5 w-5 shrink-0', className)}
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

export function IconTile({ name, dark = false }: { name: IconName; dark?: boolean }) {
  return (
    <span
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
        dark ? 'bg-white/10 text-indigo-200 ring-1 ring-white/15' : 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100',
      )}
      aria-hidden="true"
    >
      <Icon name={name} />
    </span>
  );
}
