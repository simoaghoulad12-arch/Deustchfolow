import 'server-only';
import type { BookingStatus, TutorSpecialty } from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export interface BookingOffering {
  id: string;
  title: string;
  category: TutorSpecialty;
  durationMinutes: number;
  priceCents: number;
  currency: string;
}

export interface BookingParty {
  id: string;
  profile: { displayName: string | null; avatarUrl: string | null } | null;
}

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  offeringId: string;
  startAt: string;
  endAt: string;
  studentTimezone: string;
  status: BookingStatus;
  notes: string | null;
  cancellationReason: string | null;
  offering: BookingOffering;
  tutor: { user: BookingParty };
  student: BookingParty;
  review: { id: string } | null;
}

export interface CreateBookingInput {
  offeringId: string;
  startAt: string;
  studentTimezone: string;
  notes?: string;
}

export type BookingActionResult = { ok: true; booking: Booking } | { ok: false; error: string };

export async function createBooking(user: SessionUser, input: CreateBookingInput): Promise<BookingActionResult> {
  const response = await callNestApi('/bookings', user, { method: 'POST', body: JSON.stringify(input) });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    return { ok: false, error: errorBody?.message ?? 'Buchung fehlgeschlagen.' };
  }
  return { ok: true, booking: await response.json() };
}

export async function getMyBookingsAsStudent(user: SessionUser): Promise<Booking[]> {
  const response = await callNestApi('/bookings/me', user);
  if (!response.ok) return [];
  return response.json();
}

export async function getMyBookingsAsTutor(user: SessionUser): Promise<Booking[]> {
  const response = await callNestApi('/bookings/tutor/me', user);
  if (!response.ok) return [];
  return response.json();
}

export async function confirmBooking(user: SessionUser, bookingId: string): Promise<BookingActionResult> {
  return patchBookingAction(user, `/bookings/${encodeURIComponent(bookingId)}/confirm`);
}

export async function cancelBooking(
  user: SessionUser,
  bookingId: string,
  reason?: string,
): Promise<BookingActionResult> {
  return patchBookingAction(user, `/bookings/${encodeURIComponent(bookingId)}/cancel`, { reason });
}

export async function completeBooking(user: SessionUser, bookingId: string): Promise<BookingActionResult> {
  return patchBookingAction(user, `/bookings/${encodeURIComponent(bookingId)}/complete`);
}

export async function markBookingNoShow(user: SessionUser, bookingId: string): Promise<BookingActionResult> {
  return patchBookingAction(user, `/bookings/${encodeURIComponent(bookingId)}/no-show`);
}

async function patchBookingAction(
  user: SessionUser,
  path: string,
  body?: Record<string, unknown>,
): Promise<BookingActionResult> {
  const response = await callNestApi(path, user, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : JSON.stringify({}),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    return { ok: false, error: errorBody?.message ?? 'Aktion fehlgeschlagen.' };
  }
  return { ok: true, booking: await response.json() };
}
