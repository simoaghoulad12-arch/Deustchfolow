import { DateTime } from 'luxon';
import { computeFreeSlots } from '../availability-slots';

const BERLIN = 'Europe/Berlin';

/** Local (zone-aware) ISO string -> JS Date, so test intent reads as wall-clock time, not UTC. */
function local(iso: string): Date {
  return DateTime.fromISO(iso, { zone: BERLIN }).toJSDate();
}

function weekdayOf(iso: string): number {
  return DateTime.fromISO(iso, { zone: BERLIN }).weekday % 7;
}

/** Walks back from the last day of the month to the most recent Sunday — Germany's DST transitions are always "last Sunday of March/October". */
function lastSundayOf(year: number, month: number): DateTime {
  let day = DateTime.fromObject({ year, month }, { zone: BERLIN }).endOf('month').startOf('day');
  while (day.weekday !== 7) {
    day = day.minus({ days: 1 });
  }
  return day;
}

describe('computeFreeSlots', () => {
  it('generates back-to-back slots filling the whole rule window', () => {
    // 2026-08-20 is a Thursday.
    const slots = computeFreeSlots({
      timezone: BERLIN,
      rules: [{ weekday: weekdayOf('2026-08-20'), startMinute: 9 * 60, endMinute: 10 * 60 }],
      busyRanges: [],
      from: local('2026-08-20T00:00:00'),
      to: local('2026-08-21T00:00:00'),
      durationMinutes: 30,
      now: local('2026-08-01T00:00:00'),
    });

    expect(slots).toHaveLength(2);
    expect(DateTime.fromJSDate(slots[0]!.startAt).setZone(BERLIN).toFormat('HH:mm')).toBe('09:00');
    expect(DateTime.fromJSDate(slots[0]!.endAt).setZone(BERLIN).toFormat('HH:mm')).toBe('09:30');
    expect(DateTime.fromJSDate(slots[1]!.startAt).setZone(BERLIN).toFormat('HH:mm')).toBe('09:30');
    expect(DateTime.fromJSDate(slots[1]!.endAt).setZone(BERLIN).toFormat('HH:mm')).toBe('10:00');
  });

  it('never emits a partial slot that would run past the rule window', () => {
    // 50-minute window, 30-minute slots -> exactly one slot, not a 20-minute leftover.
    const slots = computeFreeSlots({
      timezone: BERLIN,
      rules: [{ weekday: weekdayOf('2026-08-20'), startMinute: 9 * 60, endMinute: 9 * 60 + 50 }],
      busyRanges: [],
      from: local('2026-08-20T00:00:00'),
      to: local('2026-08-21T00:00:00'),
      durationMinutes: 30,
      now: local('2026-08-01T00:00:00'),
    });

    expect(slots).toHaveLength(1);
  });

  it('only produces slots on the matching weekday, never adjacent days', () => {
    const mondayWeekday = weekdayOf('2026-08-17'); // Monday
    const slots = computeFreeSlots({
      timezone: BERLIN,
      rules: [{ weekday: mondayWeekday, startMinute: 9 * 60, endMinute: 10 * 60 }],
      busyRanges: [],
      from: local('2026-08-17T00:00:00'),
      to: local('2026-08-20T00:00:00'), // spans Mon, Tue, Wed
      durationMinutes: 30,
      now: local('2026-08-01T00:00:00'),
    });

    for (const slot of slots) {
      expect(DateTime.fromJSDate(slot.startAt).setZone(BERLIN).weekday % 7).toBe(mondayWeekday);
    }
    expect(slots.length).toBeGreaterThan(0);
  });

  it('excludes a slot that overlaps an existing PENDING/CONFIRMED booking', () => {
    const slots = computeFreeSlots({
      timezone: BERLIN,
      rules: [{ weekday: weekdayOf('2026-08-20'), startMinute: 9 * 60, endMinute: 10 * 60 }],
      busyRanges: [{ start: local('2026-08-20T09:00:00'), end: local('2026-08-20T09:30:00') }],
      from: local('2026-08-20T00:00:00'),
      to: local('2026-08-21T00:00:00'),
      durationMinutes: 30,
      now: local('2026-08-01T00:00:00'),
    });

    expect(slots).toHaveLength(1);
    expect(DateTime.fromJSDate(slots[0]!.startAt).setZone(BERLIN).toFormat('HH:mm')).toBe('09:30');
  });

  it('excludes a slot that overlaps a blocked availability exception (vacation)', () => {
    const slots = computeFreeSlots({
      timezone: BERLIN,
      rules: [{ weekday: weekdayOf('2026-08-20'), startMinute: 9 * 60, endMinute: 10 * 60 }],
      busyRanges: [{ start: local('2026-08-20T00:00:00'), end: local('2026-08-21T00:00:00') }],
      from: local('2026-08-20T00:00:00'),
      to: local('2026-08-21T00:00:00'),
      durationMinutes: 30,
      now: local('2026-08-01T00:00:00'),
    });

    expect(slots).toHaveLength(0);
  });

  it('never offers a slot that has already started relative to `now`', () => {
    const slots = computeFreeSlots({
      timezone: BERLIN,
      rules: [{ weekday: weekdayOf('2026-08-20'), startMinute: 9 * 60, endMinute: 10 * 60 }],
      busyRanges: [],
      from: local('2026-08-20T00:00:00'),
      to: local('2026-08-21T00:00:00'),
      durationMinutes: 30,
      now: local('2026-08-20T09:15:00'), // already past the first slot
    });

    expect(slots).toHaveLength(1);
    expect(DateTime.fromJSDate(slots[0]!.startAt).setZone(BERLIN).toFormat('HH:mm')).toBe('09:30');
  });

  it('rejects a range spanning more than 30 days', () => {
    expect(() =>
      computeFreeSlots({
        timezone: BERLIN,
        rules: [],
        busyRanges: [],
        from: local('2026-08-01T00:00:00'),
        to: local('2026-10-01T00:00:00'),
        durationMinutes: 30,
      }),
    ).toThrow(RangeError);
  });

  it('returns no slots when `to` is not after `from`', () => {
    const slots = computeFreeSlots({
      timezone: BERLIN,
      rules: [{ weekday: 0, startMinute: 0, endMinute: 60 }],
      busyRanges: [],
      from: local('2026-08-20T00:00:00'),
      to: local('2026-08-20T00:00:00'),
      durationMinutes: 30,
    });

    expect(slots).toHaveLength(0);
  });

  // --- DST correctness (spec: "Alle Zeiten müssen timezone-aware sein") ---

  it('resolves a recurring rule to a UTC offset that shifts across the spring DST transition (CET -> CEST)', () => {
    // The last Sunday of March 2026 is Germany's spring-forward date.
    // A rule for "that weekday, 09:00-10:00 local" must resolve to
    // UTC+1 the week before the transition and UTC+2 the week after —
    // a naive fixed-UTC-offset implementation would get one of these
    // two weeks wrong.
    const dstSunday = lastSundayOf(2026, 3);
    const weekBefore = dstSunday.minus({ weeks: 1 });
    const weekAfter = dstSunday.plus({ weeks: 1 });
    const sundayWeekday = 0; // Sunday, per this module's 0=Sunday convention

    const slotsBefore = computeFreeSlots({
      timezone: BERLIN,
      rules: [{ weekday: sundayWeekday, startMinute: 9 * 60, endMinute: 9 * 60 + 30 }],
      busyRanges: [],
      from: weekBefore.startOf('day').toJSDate(),
      to: weekBefore.endOf('day').toJSDate(),
      durationMinutes: 30,
      now: weekBefore.minus({ days: 1 }).toJSDate(),
    });
    const slotsAfter = computeFreeSlots({
      timezone: BERLIN,
      rules: [{ weekday: sundayWeekday, startMinute: 9 * 60, endMinute: 9 * 60 + 30 }],
      busyRanges: [],
      from: weekAfter.startOf('day').toJSDate(),
      to: weekAfter.endOf('day').toJSDate(),
      durationMinutes: 30,
      now: weekAfter.minus({ days: 1 }).toJSDate(),
    });

    expect(slotsBefore).toHaveLength(1);
    expect(slotsAfter).toHaveLength(1);

    const offsetBeforeHours = DateTime.fromJSDate(slotsBefore[0]!.startAt).setZone(BERLIN).offset / 60;
    const offsetAfterHours = DateTime.fromJSDate(slotsAfter[0]!.startAt).setZone(BERLIN).offset / 60;

    expect(offsetBeforeHours).toBe(1); // CET, UTC+1
    expect(offsetAfterHours).toBe(2); // CEST, UTC+2
    // Both represent "09:00 local" — but the UTC instant differs by an
    // hour once the fixed local time is on the other side of the offset
    // change, which is exactly the DST-correctness this module exists for.
    expect(DateTime.fromJSDate(slotsBefore[0]!.startAt).setZone(BERLIN).toFormat('HH:mm')).toBe('09:00');
    expect(DateTime.fromJSDate(slotsAfter[0]!.startAt).setZone(BERLIN).toFormat('HH:mm')).toBe('09:00');
  });

  it('resolves a recurring rule to a UTC offset that shifts across the autumn DST transition (CEST -> CET)', () => {
    const dstSunday = lastSundayOf(2026, 10);
    const weekBefore = dstSunday.minus({ weeks: 1 });
    const weekAfter = dstSunday.plus({ weeks: 1 });
    const sundayWeekday = 0;

    const slotsBefore = computeFreeSlots({
      timezone: BERLIN,
      rules: [{ weekday: sundayWeekday, startMinute: 9 * 60, endMinute: 9 * 60 + 30 }],
      busyRanges: [],
      from: weekBefore.startOf('day').toJSDate(),
      to: weekBefore.endOf('day').toJSDate(),
      durationMinutes: 30,
      now: weekBefore.minus({ days: 1 }).toJSDate(),
    });
    const slotsAfter = computeFreeSlots({
      timezone: BERLIN,
      rules: [{ weekday: sundayWeekday, startMinute: 9 * 60, endMinute: 9 * 60 + 30 }],
      busyRanges: [],
      from: weekAfter.startOf('day').toJSDate(),
      to: weekAfter.endOf('day').toJSDate(),
      durationMinutes: 30,
      now: weekAfter.minus({ days: 1 }).toJSDate(),
    });

    const offsetBeforeHours = DateTime.fromJSDate(slotsBefore[0]!.startAt).setZone(BERLIN).offset / 60;
    const offsetAfterHours = DateTime.fromJSDate(slotsAfter[0]!.startAt).setZone(BERLIN).offset / 60;

    expect(offsetBeforeHours).toBe(2); // still CEST
    expect(offsetAfterHours).toBe(1); // back to CET
  });
});
