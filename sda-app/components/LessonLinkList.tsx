import Link from 'next/link';
import { findLesson } from '@/content';

/** Liste von Stunden mit Link zur Stunden-Ansicht. */
export function LessonLinkList({ ids }: { ids: string[] }) {
  return (
    <ul className="divide-y divide-line">
      {ids.map((id) => {
        const l = findLesson(id);
        if (!l) return null;
        return (
          <li key={id}>
            <Link
              href={`/stunde/${id}`}
              className="flex min-h-11 items-center gap-3 py-2 hover:text-red"
            >
              <span className="w-28 shrink-0 text-sm text-muted">
                {l.level} · Modul {l.moduleId?.split('.')[1]}
              </span>
              <span className="de-content min-w-0 flex-1">{l.title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
