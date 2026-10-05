import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet } from '@/lib/api/live';
import { ErrorState, PageHeader, Stat } from '@/components/live/ui';

export const metadata = { title: 'Admin · DeutschFlow' };

type Dashboard = {
  users: number;
  activeLearners: number;
  runsCompleted: number;
  runsThisWeek: number;
  aiRequests24h: number;
  averageMissionScore: number | null;
  content: { missions: number; words: number; topics: number; exercises: number; lessons: number };
};

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const d = await liveGet<Dashboard>(session, '/admin/dashboard');
  if (!d) return <ErrorState retryHref="/admin" />;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Content management" title="Admin" description="Edit every mission, word, grammar topic, exercise and setting. Changes are live immediately." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat icon="👥" label="Users" value={d.users} />
        <Stat icon="🔥" label="Active learners (7d)" value={d.activeLearners} />
        <Stat icon="🎯" label="Missions completed" value={d.runsCompleted} hint={`${d.runsThisWeek} this week`} />
        <Stat icon="🤖" label="AI requests (24h)" value={d.aiRequests24h} />
        <Stat icon="📊" label="Avg. mission score" value={d.averageMissionScore ?? '–'} />
      </div>
      <h2 className="text-lg font-semibold">Content</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Missions" value={d.content.missions} />
        <Stat label="Words" value={d.content.words} />
        <Stat label="Grammar topics" value={d.content.topics} />
        <Stat label="Exercises" value={d.content.exercises} />
        <Stat label="Lessons" value={d.content.lessons} />
      </div>
    </div>
  );
}
