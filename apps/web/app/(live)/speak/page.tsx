import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type Me } from '@/lib/api/live';
import { ErrorState, PageHeader } from '@/components/live/ui';
import { PracticeRunner, type PracticeItem } from '@/components/live/practice-runner';

export const metadata = { title: 'Speaking practice · DeutschFlow' };

export default async function Page() {
  const session = await getSession();
  if (!session) redirect('/login');
  const [prompts, me] = await Promise.all([
    liveGet<{ items: PracticeItem[]; timeLimitMs?: number; level: string }>(session, '/practice/prompts?mode=speaking'),
    liveGet<Me>(session, '/me'),
  ]);
  if (!prompts) return <ErrorState retryHref="/speak" />;
  return (
    <div>
      <PageHeader eyebrow={`Speaking · ${prompts.level}`} title="Speaking practice" description="Answer out loud. You get feedback on pronunciation, grammar, fluency and naturalness." />
      <PracticeRunner mode="speaking" items={prompts.items} timeLimitMs={prompts.timeLimitMs} languageCode={me?.targetLanguage?.code ?? 'de'} />
    </div>
  );
}
