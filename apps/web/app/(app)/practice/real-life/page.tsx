import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SimulationCategory } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { getSimulations } from '@/lib/api/simulations';
import { SIMULATION_CATEGORY_LABELS } from '@/lib/simulation-labels';

export const metadata: Metadata = { title: 'Alltagssimulationen – DeutschFlow' };

export default async function RealLifePracticePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const category =
    searchParams.category && searchParams.category in SimulationCategory
      ? (searchParams.category as SimulationCategory)
      : undefined;

  const simulations = await getSimulations(session, { category });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Alltagssimulationen</h1>
        <p className="text-sm text-muted-foreground">
          Übe echte Alltagssituationen auf Deutsch — der KI-Tutor spielt die Gegenrolle.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/practice/real-life"
          className={`rounded-full border px-3 py-1 text-xs ${!category ? 'border-primary bg-primary/10 font-medium' : 'border-border text-muted-foreground'}`}
        >
          Alle
        </Link>
        {Object.values(SimulationCategory).map((value) => (
          <Link
            key={value}
            href={`/practice/real-life?category=${value}`}
            className={`rounded-full border px-3 py-1 text-xs ${category === value ? 'border-primary bg-primary/10 font-medium' : 'border-border text-muted-foreground'}`}
          >
            {SIMULATION_CATEGORY_LABELS[value]}
          </Link>
        ))}
      </div>

      {simulations.length === 0 && (
        <p className="text-sm text-muted-foreground">Keine Simulationen in dieser Kategorie gefunden.</p>
      )}

      <ul className="space-y-2">
        {simulations.map((simulation) => (
          <li key={simulation.id}>
            <Link
              href={`/practice/real-life/${simulation.id}`}
              className="block rounded-lg border border-border p-4 transition-colors hover:border-primary/40"
            >
              <p className="font-medium">{simulation.title}</p>
              <p className="text-xs text-muted-foreground">
                {SIMULATION_CATEGORY_LABELS[simulation.category]} · Level {simulation.cefrLevel}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{simulation.situation}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
