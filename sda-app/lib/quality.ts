import type { SchoolData } from './data/queries';
import type { StudentRow } from './data/types';
import { attendance, daysBetween, homeworkStats, lastDocFor, openErrors } from './school';
import type { QcThresholds } from './validation';

export interface StudentQuality {
  student: StudentRow;
  attendance: number | null;
  homeworkDone: number | null;
  openErrors: number;
  daysWithoutDoc: number | null;
  /** Nur gefüllt, wenn die Leitung Schwellen festgelegt hat */
  warnings: string[];
}

/** Kennzahlen pro Schüler (legacy: pageQC). Warnungen nur bei festgelegten Schwellen – nichts erfunden. */
export function studentQuality(data: SchoolData, today: string, t: QcThresholds): StudentQuality[] {
  return data.students.map((s) => {
    const at = attendance(s.id, data.docs).rate;
    const hw = homeworkStats(data.homework.filter((h) => h.student_id === s.id));
    const homeworkDone = hw.total
      ? Math.round((100 * (hw.Abgegeben + hw.Korrigiert)) / hw.total)
      : null;
    const last = lastDocFor(s.id, data.docs);
    const days = last ? daysBetween(last.date, today) : null;
    const warnings: string[] = [];
    if (t.attendanceMin !== null && at !== null && at < t.attendanceMin)
      warnings.push(`Anwesenheit unter ${t.attendanceMin} %`);
    if (t.homeworkDoneMin !== null && homeworkDone !== null && homeworkDone < t.homeworkDoneMin)
      warnings.push(`Hausaufgaben unter ${t.homeworkDoneMin} %`);
    if (t.daysWithoutDocMax !== null && (days === null || days > t.daysWithoutDocMax))
      warnings.push(
        days === null ? 'noch nie dokumentiert' : `seit ${days} Tagen ohne Dokumentation`,
      );
    return {
      student: s,
      attendance: at,
      homeworkDone,
      openErrors: openErrors(data.errors.filter((e) => e.student_id === s.id)).length,
      daysWithoutDoc: days,
      warnings,
    };
  });
}

export interface QualitySummary {
  students: number;
  avgAttendance: number | null;
  homeworkDone: number | null;
  homeworkDoneCount: number;
  homeworkTotal: number;
  errorsOpen: number;
  errorsImproved: number;
  docs: number;
  docsLast7: number;
}

export function qualitySummary(data: SchoolData, today: string): QualitySummary {
  const rates = data.students
    .map((s) => attendance(s.id, data.docs).rate)
    .filter((x): x is number => x !== null);
  const hw = homeworkStats(data.homework);
  const doneCount = hw.Abgegeben + hw.Korrigiert;
  return {
    students: data.students.length,
    avgAttendance: rates.length
      ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
      : null,
    homeworkDone: hw.total ? Math.round((100 * doneCount) / hw.total) : null,
    homeworkDoneCount: doneCount,
    homeworkTotal: hw.total,
    errorsOpen: openErrors(data.errors).length,
    errorsImproved: data.errors.filter((e) => e.status === 'verbessert').length,
    docs: data.docs.length,
    docsLast7: data.docs.filter((d) => {
      const n = daysBetween(d.date, today);
      return n >= 0 && n <= 7;
    }).length,
  };
}
