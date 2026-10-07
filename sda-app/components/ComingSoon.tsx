import { t, type Lang } from '@/lib/i18n';

/** Hinweis auf Seiten, deren Inhalt in einer späteren Phase (docs/PROMPTS.md) gebaut wird. */
export function ComingSoon({
  phase,
  lang,
  children,
}: {
  phase: number;
  lang: Lang;
  children?: React.ReactNode;
}) {
  return (
    <section className="card">
      <p className="font-medium">{t(lang, 'comingInPhase', { n: phase })}</p>
      {children && <div className="de-content mt-2 text-sm text-muted">{children}</div>}
    </section>
  );
}
