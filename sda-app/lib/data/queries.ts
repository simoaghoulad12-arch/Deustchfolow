import 'server-only';
import { getRepo } from './repo';
import type {
  ErrorRow,
  GroupRow,
  HomeworkRow,
  LessonDocRow,
  ProfileRow,
  StudentRow,
} from './types';

export interface SchoolData {
  groups: GroupRow[];
  students: StudentRow[];
  docs: LessonDocRow[];
  errors: ErrorRow[];
  homework: HomeworkRow[];
  profiles: ProfileRow[];
}

/** Alles, was die angemeldete Person sehen darf (Row Level Security filtert in der Datenbank). */
export async function loadSchool(): Promise<SchoolData> {
  const repo = getRepo();
  const [groups, students, docs, errors, homework, profiles] = await Promise.all([
    repo.list('groups', { order: { column: 'name' } }),
    repo.list('students', { order: { column: 'name' } }),
    repo.list('lesson_docs', { order: { column: 'date', ascending: false } }),
    repo.list('errors', { order: { column: 'date', ascending: false } }),
    repo.list('homework', { order: { column: 'created_at', ascending: false } }),
    repo.list('profiles', { order: { column: 'full_name' } }),
  ]);
  return { groups, students, docs, errors, homework, profiles };
}

export const nameOf = (list: { id: string; name: string }[], id: string | null | undefined) =>
  list.find((x) => x.id === id)?.name ?? '–';

export const profileName = (profiles: ProfileRow[], id: string | null) => {
  const p = profiles.find((x) => x.id === id);
  return p ? p.full_name || p.email : '–';
};
