import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { WritingCorrector } from './writing-corrector';

export const metadata: Metadata = { title: 'Schreiben – DeutschFlow' };

export default async function WritingPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="mx-auto max-w-2xl">
      <WritingCorrector />
    </div>
  );
}
