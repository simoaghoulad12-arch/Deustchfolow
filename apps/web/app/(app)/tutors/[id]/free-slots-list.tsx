'use client';

/**
 * Formats slot instants in the viewer's own browser timezone (Intl's
 * default resolvedOptions().timeZone) — the server only ever knows the
 * tutor's timezone, not the visiting student's, so this conversion has to
 * happen client-side.
 */
export function FreeSlotsList({ slots }: { slots: { startAt: string; endAt: string }[] }) {
  if (slots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        In den nächsten 7 Tagen sind aktuell keine freien Termine sichtbar.
      </p>
    );
  }

  const formatter = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ul className="flex flex-wrap gap-2">
      {slots.map((slot) => (
        <li
          key={slot.startAt}
          className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
        >
          {formatter.format(new Date(slot.startAt))}
        </li>
      ))}
    </ul>
  );
}
