'use server';

import { redirect } from 'next/navigation';
import { DateTime } from 'luxon';
import { UserRole } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { getOwnTutorProfile } from '@/lib/api/tutors';
import {
  createAvailabilityRule,
  deleteAvailabilityRule,
  createAvailabilityException,
  deleteAvailabilityException,
} from '@/lib/api/tutor-availability';

function parseMinutesOfDay(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

async function requireTutorSession() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== UserRole.TUTOR) redirect('/dashboard');
  return session;
}

export async function createAvailabilityRuleAction(formData: FormData): Promise<void> {
  const session = await requireTutorSession();

  const weekday = Number(formData.get('weekday'));
  const startMinute = parseMinutesOfDay(String(formData.get('startTime') ?? ''));
  const endMinute = parseMinutesOfDay(String(formData.get('endTime') ?? ''));

  if (Number.isNaN(weekday) || startMinute === null || endMinute === null) {
    redirect('/tutor/availability?ruleError=Ungültige%20Eingabe.');
  }

  const result = await createAvailabilityRule(session, { weekday, startMinute, endMinute });
  if (!result.ok) {
    redirect(`/tutor/availability?ruleError=${encodeURIComponent(result.error)}`);
  }

  redirect('/tutor/availability?saved=rule');
}

export async function deleteAvailabilityRuleAction(formData: FormData): Promise<void> {
  const session = await requireTutorSession();
  const ruleId = String(formData.get('ruleId') ?? '');
  await deleteAvailabilityRule(session, ruleId);
  redirect('/tutor/availability?saved=rule-deleted');
}

export async function createAvailabilityExceptionAction(formData: FormData): Promise<void> {
  const session = await requireTutorSession();
  const profile = await getOwnTutorProfile(session);
  if (!profile) redirect('/tutor/availability?ruleError=Bitte%20zuerst%20ein%20Tutorprofil%20anlegen.');

  const startLocal = String(formData.get('startAt') ?? '');
  const endLocal = String(formData.get('endAt') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();

  // Interpreted in the tutor's OWN profile timezone (not the browser's),
  // since <input type="datetime-local"> yields a naive wall-clock string.
  const startAt = DateTime.fromISO(startLocal, { zone: profile.timezone });
  const endAt = DateTime.fromISO(endLocal, { zone: profile.timezone });

  if (!startAt.isValid || !endAt.isValid) {
    redirect('/tutor/availability?ruleError=Ungültiger%20Zeitraum.');
  }

  const result = await createAvailabilityException(session, {
    startAt: startAt.toUTC().toISO() as string,
    endAt: endAt.toUTC().toISO() as string,
    reason: reason.length > 0 ? reason : undefined,
  });
  if (!result.ok) {
    redirect(`/tutor/availability?ruleError=${encodeURIComponent(result.error)}`);
  }

  redirect('/tutor/availability?saved=exception');
}

export async function deleteAvailabilityExceptionAction(formData: FormData): Promise<void> {
  const session = await requireTutorSession();
  const exceptionId = String(formData.get('exceptionId') ?? '');
  await deleteAvailabilityException(session, exceptionId);
  redirect('/tutor/availability?saved=exception-deleted');
}
