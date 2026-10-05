import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type Me } from '@/lib/api/live';
import { ErrorState, PageHeader } from '@/components/live/ui';
import { PracticeRunner, type PracticeItem } from '@/components/live/practice-runner';

export const metadata = { title: 'Brain mode · DeutschFlow' };

export default async function Page() {
  const session = await getSession();
  if (!session) redirect('/login');
  const [prompts, me] = await Promise.all([
    liveGet<{ items: PracticeItem[]; timeLimitMs?: number; level: string }>(session, '/practice/prompts?mode=brain'),
    liveGet<Me>(session, '/me'),
  ]);
  if (!prompts) return <ErrorState retryHref="/brain" />;
  return (
    <div>
      <PageHeader eyebrow={`Think in the language · ${prompts.level}`} title="Brain mode" description="Questions come fast and in the language you’re learning. Answer before the timer runs out — no time to translate." />
      <PracticeRunner mode="brain" items={prompts.items} timeLimitMs={prompts.timeLimitMs} languageCode={me?.targetLanguage?.code ?? 'de'} />
    </div>
  );
}
