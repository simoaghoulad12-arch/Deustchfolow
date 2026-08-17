import 'server-only';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export interface AvailabilityRule {
  id: string;
  tutorId: string;
  weekday: number;
  startMinute: number;
  endMinute: number;
}

export interface AvailabilityException {
  id: string;
  tutorId: string;
  startAt: string;
  endAt: string;
  isBlocked: boolean;
  reason: string | null;
}

export interface FreeSlot {
  startAt: string;
  endAt: string;
}

export async function getOwnAvailabilityRules(user: SessionUser): Promise<AvailabilityRule[]> {
  const response = await callNestApi('/tutors/me/availability/rules', user);
  if (!response.ok) return [];
  return response.json();
}

export async function createAvailabilityRule(
  user: SessionUser,
  input: { weekday: number; startMinute: number; endMinute: number },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await callNestApi('/tutors/me/availability/rules', user, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { ok: false, error: body?.message ?? 'Regel konnte nicht gespeichert werden.' };
  }
  return { ok: true };
}

export async function deleteAvailabilityRule(user: SessionUser, ruleId: string): Promise<void> {
  await callNestApi(`/tutors/me/availability/rules/${encodeURIComponent(ruleId)}`, user, {
    method: 'DELETE',
  });
}

export async function getOwnAvailabilityExceptions(user: SessionUser): Promise<AvailabilityException[]> {
  const response = await callNestApi('/tutors/me/availability/exceptions', user);
  if (!response.ok) return [];
  return response.json();
}

export async function createAvailabilityException(
  user: SessionUser,
  input: { startAt: string; endAt: string; reason?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await callNestApi('/tutors/me/availability/exceptions', user, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { ok: false, error: body?.message ?? 'Blockzeit konnte nicht gespeichert werden.' };
  }
  return { ok: true };
}

export async function deleteAvailabilityException(user: SessionUser, exceptionId: string): Promise<void> {
  await callNestApi(`/tutors/me/availability/exceptions/${encodeURIComponent(exceptionId)}`, user, {
    method: 'DELETE',
  });
}

export async function getFreeSlots(
  user: SessionUser,
  tutorId: string,
  query: { from: string; to: string; durationMinutes?: number },
): Promise<FreeSlot[]> {
  const params = new URLSearchParams({ from: query.from, to: query.to });
  if (query.durationMinutes) params.set('durationMinutes', String(query.durationMinutes));

  const response = await callNestApi(
    `/tutors/${encodeURIComponent(tutorId)}/availability?${params.toString()}`,
    user,
  );
  if (!response.ok) return [];
  return response.json();
}
