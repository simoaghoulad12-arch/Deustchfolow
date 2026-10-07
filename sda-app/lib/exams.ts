import 'server-only';
import type { LevelKey } from '@/content/types';

/**
 * Bestandene Prüfungen eines Schülers (Phase 9: Tabelle exam_registrations).
 * passed = Level mit bestandener Prüfung (zählen als 100 %), next = dadurch freigeschaltete Level.
 */
export async function passedLevelsOf(
  _studentId: string,
): Promise<{ passed: Set<LevelKey>; next: LevelKey[] }> {
  return { passed: new Set(), next: [] };
}
