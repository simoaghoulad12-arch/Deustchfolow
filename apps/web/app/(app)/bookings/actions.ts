'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { cancelBooking } from '@/lib/api/bookings';
import { createReview } from '@/lib/api/reviews';

export async function cancelBookingAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  const bookingId = String(formData.get('bookingId') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();

  const result = await cancelBooking(session, bookingId, reason.length > 0 ? reason : undefined);
  if (!result.ok) {
    redirect(`/bookings?cancelError=${encodeURIComponent(result.error)}`);
  }

  redirect('/bookings?cancelled=1');
}

export async function createReviewAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  const bookingId = String(formData.get('bookingId') ?? '');
  const rating = Number(formData.get('rating'));
  const comment = String(formData.get('comment') ?? '').trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect(`/bookings?reviewError=${encodeURIComponent('Bitte wähle eine Bewertung von 1 bis 5 Sternen.')}`);
  }

  const result = await createReview(session, bookingId, {
    rating,
    comment: comment.length > 0 ? comment : undefined,
  });
  if (!result.ok) {
    redirect(`/bookings?reviewError=${encodeURIComponent(result.error)}`);
  }

  redirect('/bookings?reviewed=1');
}
