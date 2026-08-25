'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { createBooking } from '@/lib/api/bookings';

export async function createBookingAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  const tutorId = String(formData.get('tutorId') ?? '');
  const offeringId = String(formData.get('offeringId') ?? '');
  const startAt = String(formData.get('startAt') ?? '');
  const studentTimezone = String(formData.get('studentTimezone') ?? '');
  const notes = String(formData.get('notes') ?? '').trim();

  if (!startAt) {
    redirect(
      `/tutors/${encodeURIComponent(tutorId)}/book?offeringId=${encodeURIComponent(offeringId)}&bookingError=${encodeURIComponent('Bitte wähle einen Termin aus.')}`,
    );
  }

  const result = await createBooking(session, {
    offeringId,
    startAt,
    studentTimezone: studentTimezone || 'Europe/Berlin',
    notes: notes.length > 0 ? notes : undefined,
  });

  if (!result.ok) {
    redirect(
      `/tutors/${encodeURIComponent(tutorId)}/book?offeringId=${encodeURIComponent(offeringId)}&bookingError=${encodeURIComponent(result.error)}`,
    );
  }

  // The booking exists but is still PENDING — /bookings/[bookingId]/pay
  // starts the actual payment (or, for a PRO/MAX student, tries the
  // weekly live-lesson quota first and confirms immediately if it
  // covers this booking).
  redirect(`/bookings/${encodeURIComponent(result.booking.id)}/pay`);
}
