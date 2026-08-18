'use server';

import { redirect } from 'next/navigation';
import { UserRole } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { confirmBooking, cancelBooking, completeBooking, markBookingNoShow } from '@/lib/api/bookings';

async function requireTutorSession() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== UserRole.TUTOR) redirect('/dashboard');
  return session;
}

export async function confirmBookingAction(formData: FormData): Promise<void> {
  const session = await requireTutorSession();
  const bookingId = String(formData.get('bookingId') ?? '');

  const result = await confirmBooking(session, bookingId);
  if (!result.ok) {
    redirect(`/tutor/bookings?actionError=${encodeURIComponent(result.error)}`);
  }
  redirect('/tutor/bookings?saved=confirmed');
}

export async function cancelBookingAction(formData: FormData): Promise<void> {
  const session = await requireTutorSession();
  const bookingId = String(formData.get('bookingId') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();

  const result = await cancelBooking(session, bookingId, reason.length > 0 ? reason : undefined);
  if (!result.ok) {
    redirect(`/tutor/bookings?actionError=${encodeURIComponent(result.error)}`);
  }
  redirect('/tutor/bookings?saved=cancelled');
}

export async function completeBookingAction(formData: FormData): Promise<void> {
  const session = await requireTutorSession();
  const bookingId = String(formData.get('bookingId') ?? '');

  const result = await completeBooking(session, bookingId);
  if (!result.ok) {
    redirect(`/tutor/bookings?actionError=${encodeURIComponent(result.error)}`);
  }
  redirect('/tutor/bookings?saved=completed');
}

export async function noShowAction(formData: FormData): Promise<void> {
  const session = await requireTutorSession();
  const bookingId = String(formData.get('bookingId') ?? '');

  const result = await markBookingNoShow(session, bookingId);
  if (!result.ok) {
    redirect(`/tutor/bookings?actionError=${encodeURIComponent(result.error)}`);
  }
  redirect('/tutor/bookings?saved=no-show');
}
