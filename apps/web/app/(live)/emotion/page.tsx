import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type Me } from '@/lib/api/live';
import { ErrorState, PageHeader } from '@/components/live/ui';
import { PracticeRunner, type PracticeItem } from '@/components/live/practice-runner';

export const metadata = { title: 'Emotion mode · DeutschFlow' };

export default async function Page() {
  const session = await getSession();
  if (!session) redirect('/login');
  const [prompts, me] = await Promise.all([
    liveGet<{ items: PracticeItem[]; timeLimitMs?: number; level: string }>(session, '/practice/prompts?mode=emotion'),
    liveGet<Me>(session, '/me'),
  ]);
  if (!prompts) return <ErrorState retryHref="/emotion" />;
  return (
    <div>
      <PageHeader eyebrow={`Tone & register · ${prompts.level}`} title="Emotion mode" description="Same words, different feelings. Respond in the requested tone and learn how polite, firm or warm sounds." />
      <PracticeRunner mode="emotion" items={prompts.items} timeLimitMs={prompts.timeLimitMs} languageCode={me?.targetLanguage?.code ?? 'de'} />
    </div>
  );
}
