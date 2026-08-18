import 'server-only';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export interface Review {
  id: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  student: { id: string; profile: { displayName: string | null; avatarUrl: string | null } | null };
}

export type ReviewActionResult = { ok: true } | { ok: false; error: string };

export async function createReview(
  user: SessionUser,
  bookingId: string,
  input: { rating: number; comment?: string },
): Promise<ReviewActionResult> {
  const response = await callNestApi(`/bookings/${encodeURIComponent(bookingId)}/review`, user, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { ok: false, error: body?.message ?? 'Bewertung fehlgeschlagen.' };
  }
  return { ok: true };
}

export async function getTutorReviews(user: SessionUser, tutorId: string): Promise<Review[]> {
  const response = await callNestApi(`/tutors/${encodeURIComponent(tutorId)}/reviews`, user);
  if (!response.ok) return [];
  return response.json();
}
