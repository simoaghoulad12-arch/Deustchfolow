import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getMyProgress } from '@/lib/api/learning';
import { TutorChat } from './tutor-chat';

export const metadata: Metadata = { title: 'KI-Tutor – DeutschFlow' };

export default async function AiTutorPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const progress = await getMyProgress(session);

  return (
    <div className="mx-auto max-w-2xl">
      <TutorChat initialLevel={progress?.currentLevel ?? null} />
    </div>
  );
}
