import 'server-only';
import type { LevelKey } from '@/content/types';
import { getRepo } from './data/repo';
import { passedFromRegistrations } from './examPrep';

/**
 * Bestandene Prüfungen eines Schülers (Tabelle exam_registrations, Ergebnis „bestanden“).
 * passed = Level mit bestandener Prüfung (zählen als 100 %), next = dadurch freigeschaltete Level.
 * Den Stufenwechsel selbst (Level des Schülers ändern) entscheidet weiterhin das Team.
 */
export async function passedLevelsOf(
  studentId: string,
): Promise<{ passed: Set<LevelKey>; next: LevelKey[] }> {
  const regs = await getRepo().list('exam_registrations', { eq: { student_id: studentId } });
  return passedFromRegistrations(regs);
}
