import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { GermanyGoalType, DocumentRequirementStatus } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { getMyPathOverview } from '@/lib/api/germany';
import {
  GOAL_TYPE_LABELS,
  PATH_STEP_LABELS,
  OFFICIAL_SOURCE_TOPIC_LABELS,
  DOCUMENT_REQUIREMENT_STATUS_LABELS,
} from '@/lib/germany-labels';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import {
  setGoalAction,
  setStepAction,
  addDocumentAction,
  updateDocumentStatusAction,
  deleteDocumentAction,
} from './actions';

export const metadata: Metadata = { title: 'Mein Weg nach Deutschland – DeutschFlow' };

const STEP_ICON = { DONE: '✓', CURRENT: '→', UPCOMING: '○' } as const;

export default async function GermanyMyPathPage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string };
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { path, relevantSources, documents } = await getMyPathOverview(session);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Mein Weg nach Deutschland</h1>
        <p className="text-sm text-muted-foreground">
          Ein Überblick über deinen Weg — kein rechtsverbindlicher Rat, sondern eine Orientierungshilfe.
        </p>
      </div>

      {searchParams.saved && <FormMessage type="success">Gespeichert.</FormMessage>}
      {searchParams.error && <FormMessage type="error">{searchParams.error}</FormMessage>}

      {!path && (
        <section className="space-y-4 rounded-lg border border-border p-4">
          <h2 className="text-lg font-semibold">Was ist dein Ziel?</h2>
          <form action={setGoalAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="goalType">Ziel</Label>
              <select
                id="goalType"
                name="goalType"
                required
                className="h-11 w-full rounded-md border border-border bg-background px-3 text-base"
              >
                {Object.values(GermanyGoalType).map((goal) => (
                  <option key={goal} value={goal}>
                    {GOAL_TYPE_LABELS[goal]}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Weg starten</Button>
          </form>
        </section>
      )}

      {path && (
        <>
          <section className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Mein Weg nach Deutschland</h2>
              <span className="text-xs text-muted-foreground">Ziel: {GOAL_TYPE_LABELS[path.goalType]}</span>
            </div>
            <ul className="space-y-1 text-sm">
              {path.steps.map((entry) => (
                <li
                  key={entry.step}
                  className={entry.status === 'CURRENT' ? 'font-medium text-foreground' : 'text-muted-foreground'}
                >
                  {STEP_ICON[entry.status]} {PATH_STEP_LABELS[entry.step]}
                </li>
              ))}
            </ul>

            {path.nextStep && (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                <p className="text-xs uppercase text-muted-foreground">Dein nächster Schritt</p>
                <p className="font-medium">{PATH_STEP_LABELS[path.nextStep]}</p>
                <form action={setStepAction} className="mt-2">
                  <input type="hidden" name="step" value={path.nextStep} />
                  <Button type="submit" size="default">
                    Als aktuellen Schritt markieren
                  </Button>
                </form>
              </div>
            )}
          </section>

          {relevantSources.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-medium uppercase text-muted-foreground">
                Passende offizielle Quellen
              </h2>
              <ul className="space-y-2">
                {relevantSources.map((source) => (
                  <li key={source.id} className="rounded-lg border border-border p-3 text-sm">
                    <a href={source.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                      {source.title}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {source.authority} · {OFFICIAL_SOURCE_TOPIC_LABELS[source.topic]}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="space-y-4 border-t border-border pt-6">
            <h2 className="text-lg font-semibold">Meine Dokumente</h2>
            <p className="text-xs text-muted-foreground">
              Trage Dokumente ein, die du für deinen Weg benötigst, und verfolge ihren Status selbst — dies
              ist eine persönliche Checkliste, keine rechtsverbindliche Anforderungsliste.
            </p>

            {documents.length === 0 && (
              <p className="text-sm text-muted-foreground">Noch keine Dokumente eingetragen.</p>
            )}
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li key={doc.id} className="space-y-2 rounded-lg border border-border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{doc.documentType}</span>
                    <span className="whitespace-nowrap rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      {DOCUMENT_REQUIREMENT_STATUS_LABELS[doc.status]}
                    </span>
                  </div>
                  {doc.notes && <p className="text-xs text-muted-foreground">{doc.notes}</p>}
                  <div className="flex flex-wrap gap-2">
                    <form action={updateDocumentStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="requirementId" value={doc.id} />
                      <select
                        name="status"
                        defaultValue={doc.status}
                        className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                      >
                        {Object.values(DocumentRequirementStatus).map((status) => (
                          <option key={status} value={status}>
                            {DOCUMENT_REQUIREMENT_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" variant="outline" size="default">
                        Status ändern
                      </Button>
                    </form>
                    <form action={deleteDocumentAction}>
                      <input type="hidden" name="requirementId" value={doc.id} />
                      <Button type="submit" variant="outline" size="default">
                        Entfernen
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>

            <form action={addDocumentAction} className="space-y-4 rounded-lg border border-border p-4">
              <div className="space-y-1.5">
                <Label htmlFor="documentType">Dokumentenart</Label>
                <Input id="documentType" name="documentType" maxLength={200} placeholder="z. B. Reisepass" required />
              </div>
              <input type="hidden" name="goal" value={path.goalType} />
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notiz (optional)</Label>
                <Input id="notes" name="notes" maxLength={2000} />
              </div>
              <Button type="submit">Dokument hinzufügen</Button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
