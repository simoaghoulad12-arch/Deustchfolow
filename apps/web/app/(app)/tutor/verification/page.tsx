import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { UserRole } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { getOwnTutorProfile } from '@/lib/api/tutors';
import { getOwnVerificationDocuments } from '@/lib/api/tutor-verification';
import { VERIFICATION_LABELS } from '@/lib/tutor-labels';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { uploadDocumentAction, submitForReviewAction } from './actions';

export const metadata: Metadata = { title: 'Verifizierung – DeutschFlow' };

export default async function TutorVerificationPage({
  searchParams,
}: {
  searchParams: { saved?: string; uploadError?: string };
}) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== UserRole.TUTOR) redirect('/dashboard');

  const profile = await getOwnTutorProfile(session);
  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Verifizierung</h1>
        <p className="text-sm text-muted-foreground">
          Lege zuerst dein Tutorprofil an, bevor du Dokumente zur Verifizierung hochlädst.
        </p>
      </div>
    );
  }

  const documents = await getOwnVerificationDocuments(session);
  const canSubmit = (profile.verificationStatus === 'PENDING' || profile.verificationStatus === 'REJECTED') && documents.length > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Verifizierung</h1>
        <p className="text-sm text-muted-foreground">
          Status: <span className="font-medium text-foreground">{VERIFICATION_LABELS[profile.verificationStatus]}</span>
        </p>
      </div>

      {searchParams.saved === 'uploaded' && <FormMessage type="success">Dokument hochgeladen.</FormMessage>}
      {searchParams.saved === 'submitted' && (
        <FormMessage type="success">Zur Prüfung eingereicht. Wir melden uns, sobald ein Ergebnis vorliegt.</FormMessage>
      )}
      {searchParams.uploadError && <FormMessage type="error">{searchParams.uploadError}</FormMessage>}

      <p className="text-xs text-muted-foreground">
        Dokumente werden vertraulich behandelt und ausschließlich von dir und dem DeutschFlow-Team
        eingesehen — sie erscheinen nie öffentlich auf deinem Profil. Nur echte, von dir eingereichte
        Nachweise werden angezeigt; DeutschFlow behauptet keine Qualifikation, die nicht geprüft wurde.
      </p>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Hochgeladene Dokumente</h2>
        {documents.length === 0 && (
          <p className="text-sm text-muted-foreground">Noch keine Dokumente hochgeladen.</p>
        )}
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id} className="rounded-lg border border-border p-3 text-sm">
              {doc.label}{' '}
              <span className="text-xs text-muted-foreground">
                ({new Date(doc.uploadedAt).toLocaleDateString('de-DE')})
              </span>
            </li>
          ))}
        </ul>

        <form action={uploadDocumentAction} className="space-y-4 rounded-lg border border-border p-4">
          <div className="space-y-1.5">
            <Label htmlFor="label">Bezeichnung</Label>
            <Input id="label" name="label" maxLength={200} placeholder="z. B. Goethe-Zertifikat C2" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="file">Datei (PDF, PNG oder JPEG, max. 5MB)</Label>
            <input
              id="file"
              name="file"
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              required
              className="block w-full text-sm"
            />
          </div>
          <Button type="submit">Dokument hochladen</Button>
        </form>
      </section>

      {canSubmit && (
        <section className="space-y-3 border-t border-border pt-6">
          <h2 className="text-lg font-semibold">Zur Prüfung einreichen</h2>
          <p className="text-sm text-muted-foreground">
            Sobald du bereit bist, reiche deine Dokumente zur Prüfung ein. Ein Team-Mitglied schaut sie
            sich an und aktualisiert deinen Status.
          </p>
          <form action={submitForReviewAction}>
            <Button type="submit">Zur Prüfung einreichen</Button>
          </form>
        </section>
      )}
    </div>
  );
}
