import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getSimulation } from '@/lib/api/simulations';
import { getMyProgress } from '@/lib/api/learning';
import { SIMULATION_CATEGORY_LABELS } from '@/lib/simulation-labels';
import { TutorChat } from '../../../ai-tutor/tutor-chat';

interface SimulationPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: SimulationPageProps): Promise<Metadata> {
  const session = await getSession();
  if (!session) return { title: 'Simulation – DeutschFlow' };
  const simulation = await getSimulation(session, params.id);
  return { title: simulation ? `${simulation.title} – DeutschFlow` : 'Simulation – DeutschFlow' };
}

export default async function RealLifeSimulationPage({ params }: SimulationPageProps) {
  const session = await getSession();
  if (!session) redirect('/login');

  const simulation = await getSimulation(session, params.id);
  if (!simulation) notFound();

  const progress = await getMyProgress(session);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">
          {SIMULATION_CATEGORY_LABELS[simulation.category]} · Level {simulation.cefrLevel}
        </span>
      </div>

      <TutorChat
        initialLevel={progress?.currentLevel ?? null}
        simulation={{
          id: simulation.id,
          title: simulation.title,
          situation: simulation.situation,
          goal: simulation.goal,
        }}
      />
    </div>
  );
}
