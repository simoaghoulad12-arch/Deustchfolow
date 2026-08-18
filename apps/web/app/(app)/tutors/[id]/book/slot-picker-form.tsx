'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormMessage } from '@/components/ui/form-message';
import { createBookingAction } from './actions';

interface FreeSlot {
  startAt: string;
  endAt: string;
}

/**
 * Slot selection has to happen client-side: the server only knows the
 * tutor's timezone, not the visiting student's — so slots are formatted
 * here in the browser's own local timezone (same approach as
 * FreeSlotsList on the profile page), and that same timezone is sent
 * along with the booking so the API can store studentTimezone for
 * display purposes.
 */
export function SlotPickerForm({
  tutorId,
  offeringId,
  slots,
  errorMessage,
}: {
  tutorId: string;
  offeringId: string;
  slots: FreeSlot[];
  errorMessage?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const studentTimezone =
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Europe/Berlin';

  const formatter = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (slots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        In den nächsten 14 Tagen sind aktuell keine freien Termine für dieses Angebot verfügbar.
      </p>
    );
  }

  return (
    <form action={createBookingAction} className="space-y-4">
      <input type="hidden" name="tutorId" value={tutorId} />
      <input type="hidden" name="offeringId" value={offeringId} />
      <input type="hidden" name="studentTimezone" value={studentTimezone} />
      <input type="hidden" name="startAt" value={selected ?? ''} />

      {errorMessage && <FormMessage type="error">{errorMessage}</FormMessage>}

      <div className="space-y-2">
        <Label>Verfügbare Termine (deine Zeitzone: {studentTimezone})</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {slots.map((slot) => (
            <button
              key={slot.startAt}
              type="button"
              onClick={() => setSelected(slot.startAt)}
              className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                selected === slot.startAt
                  ? 'border-primary bg-primary/10 font-medium'
                  : 'border-border hover:border-primary/40'
              }`}
              aria-pressed={selected === slot.startAt}
            >
              {formatter.format(new Date(slot.startAt))}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Nachricht an den Tutor (optional)</Label>
        <textarea
          id="notes"
          name="notes"
          maxLength={2000}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      <Button type="submit" disabled={!selected}>
        Termin anfragen
      </Button>
    </form>
  );
}
