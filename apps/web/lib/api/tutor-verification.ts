import 'server-only';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export interface VerificationDocument {
  id: string;
  label: string;
  contentType: string;
  uploadedAt: string;
}

export type VerificationActionResult = { ok: true } | { ok: false; error: string };

export async function getOwnVerificationDocuments(user: SessionUser): Promise<VerificationDocument[]> {
  const response = await callNestApi('/tutors/me/verification/documents', user);
  if (!response.ok) return [];
  return response.json();
}

export async function uploadVerificationDocument(
  user: SessionUser,
  input: { label: string; contentType: string; dataBase64: string },
): Promise<VerificationActionResult> {
  const response = await callNestApi('/tutors/me/verification/documents', user, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { ok: false, error: body?.message ?? 'Upload fehlgeschlagen.' };
  }
  return { ok: true };
}

export async function submitVerificationForReview(user: SessionUser): Promise<VerificationActionResult> {
  const response = await callNestApi('/tutors/me/verification/submit', user, { method: 'POST' });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { ok: false, error: body?.message ?? 'Einreichung fehlgeschlagen.' };
  }
  return { ok: true };
}
