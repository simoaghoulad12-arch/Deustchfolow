import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DateTime } from 'luxon';
import { UserRole } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { getOwnTutorProfile } from '@/lib/api/tutors';
import { getOwnAvailabilityRules, getOwnAvailabilityExceptions } from '@/lib/api/tutor-availability';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import {
  createAvailabilityRuleAction,
  deleteAvailabilityRuleAction,
  createAvailabilityExceptionAction,
  deleteAvailabilityExceptionAction,
} from './actions';

export const metadata: Metadata = { title: 'Verfügbarkeit – DeutschFlow' };

const WEEKDAY_LABELS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

export default async function TutorAvailabilityPage({
  searchParams,
}: {
  searchParams: { saved?: string; ruleError?: string };
}) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== UserRole.TUTOR) redirect('/dashboard');

  const profile = await getOwnTutorProfile(session);
  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Verfügbarkeit</h1>
        <p className="text-sm text-muted-foreground">
          Lege zuerst dein Tutorprofil an, bevor du deine Verfügbarkeit festlegst.
        </p>
      </div>
    );
  }

  const [rules, exceptions] = await Promise.all([
    getOwnAvailabilityRules(session),
    getOwnAvailabilityExceptions(session),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Verfügbarkeit</h1>
        <p className="text-sm text-muted-foreground">
          Deine Zeitzone: <span className="font-medium text-foreground">{profile.timezone}</span> — alle
          Zeiten unten beziehen sich darauf.
        </p>
      </div>

      {searchParams.saved && <FormMessage type="success">Gespeichert.</FormMessage>}
      {searchParams.ruleError && <FormMessage type="error">{searchParams.ruleError}</FormMessage>}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Wöchentliche Verfügbarkeit</h2>

        {rules.length === 0 && (
          <p className="text-sm text-muted-foreground">Noch keine wiederkehrenden Zeiten hinterlegt.</p>
        )}
        <ul className="space-y-2">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 text-sm"
            >
              <span>
                {WEEKDAY_LABELS[rule.weekday]} {formatMinutes(rule.startMinute)}–
                {formatMinutes(rule.endMinute)}
              </span>
              <form action={deleteAvailabilityRuleAction}>
                <input type="hidden" name="ruleId" value={rule.id} />
                <Button type="submit" variant="outline" size="default">
                  Entfernen
                </Button>
              </form>
            </li>
          ))}
        </ul>

        <form action={createAvailabilityRuleAction} className="space-y-4 rounded-lg border border-border p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="weekday">Wochentag</Label>
              <select
                id="weekday"
                name="weekday"
                required
                className="h-11 w-full rounded-md border border-border bg-background px-3 text-base"
              >
                {WEEKDAY_LABELS.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="startTime">Von</Label>
              <Input id="startTime" name="startTime" type="time" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endTime">Bis</Label>
              <Input id="endTime" name="endTime" type="time" required />
            </div>
          </div>
          <Button type="submit">Zeit hinzufügen</Button>
        </form>
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">Blockzeiten &amp; Urlaub</h2>

        {exceptions.length === 0 && (
          <p className="text-sm text-muted-foreground">Keine Blockzeiten eingetragen.</p>
        )}
        <ul className="space-y-2">
          {exceptions.map((exception) => (
            <li
              key={exception.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 text-sm"
            >
              <span>
                {DateTime.fromISO(exception.startAt, { zone: profile.timezone }).toFormat('dd.MM.yyyy HH:mm')}
                {' – '}
                {DateTime.fromISO(exception.endAt, { zone: profile.timezone }).toFormat('dd.MM.yyyy HH:mm')}
                {exception.reason ? ` (${exception.reason})` : ''}
              </span>
              <form action={deleteAvailabilityExceptionAction}>
                <input type="hidden" name="exceptionId" value={exception.id} />
                <Button type="submit" variant="outline" size="default">
                  Entfernen
                </Button>
              </form>
            </li>
          ))}
        </ul>

        <form
          action={createAvailabilityExceptionAction}
          className="space-y-4 rounded-lg border border-border p-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="startAt">Von</Label>
              <Input id="startAt" name="startAt" type="datetime-local" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endAt">Bis</Label>
              <Input id="endAt" name="endAt" type="datetime-local" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason">Grund (optional)</Label>
            <Input id="reason" name="reason" maxLength={500} placeholder="z. B. Urlaub" />
          </div>
          <Button type="submit">Blockzeit hinzufügen</Button>
        </form>
      </section>
    </div>
  );
}
