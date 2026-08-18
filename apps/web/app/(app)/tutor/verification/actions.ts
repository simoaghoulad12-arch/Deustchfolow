'use server';

import { redirect } from 'next/navigation';
import { UserRole } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { uploadVerificationDocument, submitVerificationForReview } from '@/lib/api/tutor-verification';

const ALLOWED_CONTENT_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);

async function requireTutorSession() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== UserRole.TUTOR) redirect('/dashboard');
  return session;
}

export async function uploadDocumentAction(formData: FormData): Promise<void> {
  const session = await requireTutorSession();

  const label = String(formData.get('label') ?? '').trim();
  const file = formData.get('file') as File | null;

  if (!label) {
    redirect('/tutor/verification?uploadError=Bitte%20gib%20eine%20Bezeichnung%20an.');
  }
  if (!file || file.size === 0) {
    redirect('/tutor/verification?uploadError=Bitte%20wähle%20eine%20Datei%20aus.');
  }
  if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
    redirect('/tutor/verification?uploadError=Nur%20PDF%2C%20PNG%20oder%20JPEG%20werden%20unterstützt.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const dataBase64 = Buffer.from(arrayBuffer).toString('base64');

  const result = await uploadVerificationDocument(session, { label, contentType: file.type, dataBase64 });
  if (!result.ok) {
    redirect(`/tutor/verification?uploadError=${encodeURIComponent(result.error)}`);
  }

  redirect('/tutor/verification?saved=uploaded');
}

export async function submitForReviewAction(): Promise<void> {
  const session = await requireTutorSession();

  const result = await submitVerificationForReview(session);
  if (!result.ok) {
    redirect(`/tutor/verification?uploadError=${encodeURIComponent(result.error)}`);
  }

  redirect('/tutor/verification?saved=submitted');
}
