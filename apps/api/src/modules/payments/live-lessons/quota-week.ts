import { DateTime } from 'luxon';

/**
 * Monday 00:00 UTC of the ISO week containing `date` — the accounting
 * boundary for the PRO/MAX weekly live-lesson quota (Phase 7).
 *
 * Deliberately computed entirely in UTC, unlike
 * `availability-slots.ts`'s tutor-local-timezone slot generation: there
 * is no single "local" timezone a shared weekly quota could be anchored
 * to (student and tutor timezones can differ, and a plan's quota is a
 * property of the subscription, not of either party's clock). Staying
 * in UTC throughout means there is no wall-clock/DST arithmetic at all
 * here — the exact hazard `availability-slots.ts` documents for
 * `.plus()` on a zone-aware DateTime simply doesn't apply when the zone
 * never changes. `startOf('week')` is Luxon's ISO week definition
 * (Monday), applied to the booking's already-UTC `startAt`.
 */
export function getQuotaWeekStart(date: Date): Date {
  return DateTime.fromJSDate(date, { zone: 'utc' }).startOf('week').toJSDate();
}
