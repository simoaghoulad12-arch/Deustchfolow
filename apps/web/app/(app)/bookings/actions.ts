'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { cancelBooking } from '@/lib/api/bookings';

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
