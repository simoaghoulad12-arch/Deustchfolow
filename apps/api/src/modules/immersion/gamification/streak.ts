import { dayKey, previousDayKey } from '../common/dates';

/** Pure streak transition: same day keeps it, consecutive day extends it, a gap resets to 1. */
export function nextStreak(lastActiveDate: string | null, currentStreak: number, today: string = dayKey()): number {
  if (lastActiveDate === today) return Math.max(currentStreak, 1);
  if (lastActiveDate && lastActiveDate === previousDayKey(today)) return currentStreak + 1;
  return 1;
}
