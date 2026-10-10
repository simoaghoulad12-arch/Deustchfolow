import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { StatementSections } from '@/components/StatementSections';
import { findLesson } from '@/content';
import { requireMember } from '@/lib/auth';
import { getStore } from '@/lib/data/store';
import { getPrefs } from '@/lib/prefs';

export const dynamic = 'force-dynamic';

/** 13 Materialien (legacy: pageMat). */
export default async function MaterialsPage() {
  await requireMember();
  const { lang } = getPrefs();
  const notes = (await getStore().materialNotes()).sort((a, b) =>
    a.lessonId.localeCompare(b.lessonId, 'de', { numeric: true }),
  );
  return (
    <>
      <PageHeader page="mat" lang={lang} />
      <StatementSections page="mat" lang={lang}>
        {{
          // Unmarkierte Liste aus legacy (Abschnitt Lehrbücher)
          Lehrbücher: (
            <ul className="de-content mt-2 list-disc ps-5 text-sm">
              <li>Hueber: Menschen, Menschen hier, Schritte plus Neu, Miteinander!, Momente.</li>
              <li>Klett: Netzwerk neu (A1 bis B1).</li>
            </ul>
          ),
          'Lektion und Seiten je Stunde': (
            <>
              <p className="mb-2 text-sm text-muted">
                Eintrag im Feld „Im Lehrbuch“ jeder Stunde. Für das ganze Team sichtbar.
              </p>
              {notes.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="py-1 text-start">Stunde</th>
                        <th className="py-1 text-start">Lehrbuch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notes.map((n) => (
                        <tr key={n.lessonId} className="border-t border-line">
                          <td className="py-2 pe-3">
                            <Link href={`/stunde/${n.lessonId}`} className="de-content underline">
                              {n.lessonId} · {findLesson(n.lessonId)?.title}
                            </Link>
                          </td>
                          <td className="py-2">{n.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">Noch keine Einträge.</p>
              )}
            </>
          ),
        }}
      </StatementSections>
    </>
  );
}
