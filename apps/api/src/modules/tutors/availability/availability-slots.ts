import { DateTime } from 'luxon';

export interface AvailabilityRule {
  /** 0 = Sunday .. 6 = Saturday, local to `timezone` below. */
  weekday: number;
  startMinute: number;
  endMinute: number;
}

export interface BusyRange {
  start: Date;
  end: Date;
}

export interface FreeSlot {
  startAt: Date;
  endAt: Date;
}

const MAX_RANGE_DAYS = 30;

/**
 * Pure function, no I/O — the entire timezone-aware free-slot algorithm
 * lives here specifically so it can be unit-tested with real DST-crossing
 * dates without mocking Prisma (see architecture decision record).
 *
 * Recurring rules are defined in the tutor's local wall-clock time
 * (weekday + minute-of-day); this function is what actually resolves a
 * rule to concrete UTC instants for a specific calendar date, which is
 * the one place DST correctness matters — the same rule (e.g. "9:00-17:00
 * Europe/Berlin") maps to a different UTC offset before/after a DST
 * transition, and `luxon`'s zone-aware arithmetic (not manual UTC-offset
 * math) is what gets that right automatically.
 */
export function computeFreeSlots(params: {
  timezone: string;
  rules: AvailabilityRule[];
  busyRanges: BusyRange[];
  from: Date;
  to: Date;
  durationMinutes: number;
  now?: Date;
}): FreeSlot[] {
  const { timezone, rules, busyRanges, durationMinutes } = params;
  const now = params.now ?? new Date();

  const from = DateTime.fromJSDate(params.from, { zone: timezone });
  const to = DateTime.fromJSDate(params.to, { zone: timezone });

  if (!from.isValid || !to.isValid) {
    throw new RangeError('Invalid from/to date.');
  }
  if (to <= from) {
    return [];
  }
  if (to.diff(from, 'days').days > MAX_RANGE_DAYS) {
    throw new RangeError(`Requested range too large — max ${MAX_RANGE_DAYS} days.`);
  }
  if (durationMinutes <= 0) {
    throw new RangeError('durationMinutes must be positive.');
  }

  const busy = busyRanges.map((b) => ({
    start: DateTime.fromJSDate(b.start),
    end: DateTime.fromJSDate(b.end),
  }));

  const slots: FreeSlot[] = [];
  let day = from.startOf('day');
  const lastDay = to.startOf('day');

  while (day <= lastDay) {
    // luxon's `.weekday` is ISO (1=Monday..7=Sunday); `% 7` maps it to
    // the 0=Sunday..6=Saturday convention TutorAvailabilityRule uses.
    const weekday = day.weekday % 7;
    const todaysRules = rules.filter((rule) => rule.weekday === weekday);

    for (const rule of todaysRules) {
      const windowStart = day.plus({ minutes: rule.startMinute });
      const windowEnd = day.plus({ minutes: rule.endMinute });

      let slotStart = windowStart;
      while (slotStart.plus({ minutes: durationMinutes }) <= windowEnd) {
        const slotEnd = slotStart.plus({ minutes: durationMinutes });
        const slotStartJs = slotStart.toJSDate();
        const slotEndJs = slotEnd.toJSDate();

        const withinRequestedRange = slotStart >= from && slotEnd <= to;
        const isFuture = slotStartJs > now;
        const overlapsBusy = busy.some(
          (b) => slotStartJs < b.end.toJSDate() && slotEndJs > b.start.toJSDate(),
        );

        if (withinRequestedRange && isFuture && !overlapsBusy) {
          slots.push({ startAt: slotStart.toUTC().toJSDate(), endAt: slotEnd.toUTC().toJSDate() });
        }

        slotStart = slotStart.plus({ minutes: durationMinutes });
      }
    }

    day = day.plus({ days: 1 });
  }

  return slots.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}
