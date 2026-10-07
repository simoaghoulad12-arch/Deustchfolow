import { saveDecision } from '@/app/actions/school';
import { ActionForm } from '@/components/forms/ActionForm';
import { Field, textareaClass } from '@/components/forms/Field';
import { Label } from '@/components/Label';
import { PageHeader } from '@/components/PageHeader';
import { requireMember } from '@/lib/auth';
import { getRepo } from '@/lib/data/repo';
import { profileName } from '@/lib/data/queries';
import { getPrefs } from '@/lib/prefs';

export const dynamic = 'force-dynamic';

/** 14 Offene Entscheidungen aus der Tabelle decisions: die Leitung trägt Entscheidungen ein. */
export default async function DecisionsPage() {
  const member = await requireMember();
  const { lang } = getPrefs();
  const repo = getRepo();
  const [decisions, profiles] = await Promise.all([
    repo.list('decisions', { order: { column: 'sort_order' } }),
    repo.list('profiles'),
  ]);
  decisions.sort((a, b) => a.sort_order - b.sort_order);
  const open = decisions.filter((d) => d.status === 'offen').length;
  return (
    <>
      <PageHeader
        page="dec"
        lang={lang}
        label="OFFENE ENTSCHEIDUNG"
        intro={`Alle offenen Punkte an einer Stelle. Nichts davon ist im System entschieden, bis die Leitung es hier einträgt. Noch offen: ${open} von ${decisions.length}.`}
      />
      <ol className="space-y-3">
        {decisions.map((d) => (
          <li
            key={d.id}
            id={d.id}
            className={`card scroll-mt-20 ${d.status === 'entschieden' ? 'border-ok' : ''}`}
          >
            <p className="de-content flex flex-wrap items-baseline gap-2">
              {d.status === 'offen' ? (
                <Label kind="OFFENE ENTSCHEIDUNG" lang={lang} />
              ) : (
                <span className="rounded border border-ok bg-ok-soft px-1.5 py-0.5 text-[11px] font-semibold text-ok">
                  ENTSCHIEDEN
                </span>
              )}
              <span className="min-w-0 flex-1 font-medium">{d.title}</span>
            </p>
            {lang === 'ar' && d.title_ar && (
              <p lang="ar" dir="rtl" className="mt-1 text-sm text-muted">
                {d.title_ar}
              </p>
            )}
            {d.status === 'entschieden' && (
              <div className="mt-2 rounded-lg bg-ok-soft p-3">
                <p className="whitespace-pre-wrap">{d.decision}</p>
                <p className="mt-1 text-sm text-muted">
                  Entschieden am {d.decided_at ?? '–'} · {profileName(profiles, d.decided_by)}
                </p>
              </div>
            )}
            {member.role === 'admin' && (
              <details className="mt-2">
                <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium text-red">
                  Entscheidung eintragen
                </summary>
                <ActionForm action={saveDecision} className="mt-2 space-y-3">
                  <input type="hidden" name="id" value={d.id} />
                  <Field label="Status">
                    <select name="status" defaultValue={d.status} className="input">
                      <option value="offen">offen</option>
                      <option value="entschieden">entschieden</option>
                    </select>
                  </Field>
                  <Field label="Entscheidung">
                    <textarea name="decision" defaultValue={d.decision} className={textareaClass} />
                  </Field>
                  <Field label="Datum" hint="Leer = heute">
                    <input
                      name="decided_at"
                      type="date"
                      defaultValue={d.decided_at ?? ''}
                      className="input"
                    />
                  </Field>
                </ActionForm>
              </details>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
