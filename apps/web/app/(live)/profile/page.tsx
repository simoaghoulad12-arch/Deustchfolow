import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { liveGet, type Language, type Me } from '@/lib/api/live';
import { ErrorState, PageHeader } from '@/components/live/ui';
import { ProfileForm } from './profile-form';

export const metadata = { title: 'Profile · DeutschFlow' };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const [me, languages] = await Promise.all([liveGet<Me>(session, '/me'), liveGet<(Language & { isTarget: boolean })[]>(session, '/languages')]);
  if (!me) return <ErrorState retryHref="/profile" />;
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Profile" description={`${me.email ?? ''}${me.memberSince ? ` · member since ${new Date(me.memberSince).toLocaleDateString('en', { month: 'long', year: 'numeric' })}` : ''}`} />
      <ProfileForm me={me} languages={(languages ?? []).filter((l) => l.isTarget)} />
    </div>
  );
}
