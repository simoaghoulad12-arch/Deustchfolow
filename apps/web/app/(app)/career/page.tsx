import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getCareerModules } from '@/lib/api/career';
import { CAREER_MODULE_TYPE_LABELS } from '@/lib/simulation-labels';

export const metadata: Metadata = { title: 'Karriere – DeutschFlow' };

export default async function CareerPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const modules = await getCareerModules(session);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Karriere</h1>
        <p className="text-sm text-muted-foreground">
          Vorbereitung auf Bewerbung und Berufsleben in Deutschland — Lebenslauf, Anschreiben,
          Vorstellungsgespräch, Berufsdeutsch und professionelle E-Mails.
        </p>
      </div>

      {modules.length === 0 && (
        <p className="text-sm text-muted-foreground">Aktuell sind keine Karriere-Module verfügbar.</p>
      )}

      <ul className="space-y-3">
        {modules.map((module) => (
          <li key={module.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{module.title}</p>
              <span className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                {CAREER_MODULE_TYPE_LABELS[module.type]}
                {module.cefrLevel ? ` · ${module.cefrLevel}` : ''}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{module.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
