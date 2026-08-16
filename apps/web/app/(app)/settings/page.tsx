import type { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { getMyProfile } from '@/lib/api/profile';
import { getMyLearningProfile } from '@/lib/api/learning-profile';
import { getMySubscription, getMyEntitlements } from '@/lib/api/subscription';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { updateProfileAction, updateLearningProfileAction, deleteAccountAction } from './actions';

export const metadata: Metadata = { title: 'Einstellungen – DeutschFlow' };

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { updated?: string; verified?: string; deleteError?: string };
}) {
  const session = await getSession();
  if (!session) return null; // (app)/layout.tsx already redirects — this satisfies TypeScript.

  const [profile, learningProfile, subscription, entitlements] = await Promise.all([
    getMyProfile(session),
    getMyLearningProfile(session),
    getMySubscription(session),
    getMyEntitlements(session),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Einstellungen</h1>
        <p className="text-sm text-muted-foreground">{session.email}</p>
      </div>

      {searchParams.verified && (
        <FormMessage type="success">Deine E-Mail-Adresse wurde bestätigt.</FormMessage>
      )}
      {searchParams.updated && <FormMessage type="success">Änderungen gespeichert.</FormMessage>}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Profil</h2>
        <form action={updateProfileAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Anzeigename</Label>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={profile?.displayName ?? ''}
              maxLength={80}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avatarUrl">Avatar-URL</Label>
            <Input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              defaultValue={profile?.avatarUrl ?? ''}
            />
          </div>
          <Button type="submit">Profil speichern</Button>
        </form>
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">Lernprofil</h2>
        <form action={updateLearningProfileAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nativeLanguage">Muttersprache</Label>
              <Input
                id="nativeLanguage"
                name="nativeLanguage"
                defaultValue={learningProfile?.nativeLanguage ?? ''}
                maxLength={50}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="explanationLanguage">Sprache für Erklärungen</Label>
              <Input
                id="explanationLanguage"
                name="explanationLanguage"
                defaultValue={learningProfile?.explanationLanguage ?? ''}
                maxLength={50}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Zeitzone</Label>
              <Input
                id="timezone"
                name="timezone"
                defaultValue={learningProfile?.timezone ?? ''}
                placeholder="Europe/Berlin"
                maxLength={50}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="learningGoal">Lernziel</Label>
              <Input
                id="learningGoal"
                name="learningGoal"
                defaultValue={learningProfile?.learningGoal ?? ''}
                maxLength={500}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currentLevel">Aktuelles Niveau</Label>
              <select
                id="currentLevel"
                name="currentLevel"
                defaultValue={learningProfile?.currentLevel ?? ''}
                className="h-11 w-full rounded-md border border-border bg-background px-3 text-base"
              >
                <option value="">Nicht angegeben</option>
                {CEFR_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetLevel">Zielniveau</Label>
              <select
                id="targetLevel"
                name="targetLevel"
                defaultValue={learningProfile?.targetLevel ?? ''}
                className="h-11 w-full rounded-md border border-border bg-background px-3 text-base"
              >
                <option value="">Nicht angegeben</option>
                {CEFR_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit">Lernprofil speichern</Button>
        </form>
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">Plan</h2>
        <p className="text-sm text-muted-foreground">
          Aktueller Plan: <span className="font-medium text-foreground">{subscription?.plan ?? 'FREE'}</span>
        </p>
        {entitlements.length > 0 && (
          <ul className="flex flex-wrap gap-2 text-xs">
            {entitlements.map((entitlement) => (
              <li
                key={entitlement}
                className="rounded-full border border-border px-3 py-1 text-muted-foreground"
              >
                {entitlement}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">
          Premium-Upgrades sind noch nicht verkäuflich — diese Ansicht zeigt nur den aktuellen
          Stand.
        </p>
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">Sicherheit</h2>
        <p className="text-sm text-muted-foreground">
          E-Mail-Status: {session.emailVerified ? 'bestätigt' : 'noch nicht bestätigt'}
        </p>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
          <p className="text-sm font-medium text-red-700">Konto löschen</p>
          <p className="text-xs text-red-700/80">
            Dein Konto wird deaktiviert. Zur Bestätigung gib dein aktuelles Passwort ein.
          </p>
          <form action={deleteAccountAction} className="space-y-3">
            <Input
              name="password"
              type="password"
              placeholder="Aktuelles Passwort"
              autoComplete="current-password"
              required
            />
            {searchParams.deleteError && (
              <FormMessage type="error">{searchParams.deleteError}</FormMessage>
            )}
            <Button type="submit" variant="outline">
              Konto endgültig löschen
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
