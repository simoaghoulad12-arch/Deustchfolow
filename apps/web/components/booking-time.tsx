'use client';

/** Formats a booking's UTC instant range in the viewer's own browser timezone. */
export function BookingTime({ startAt, endAt }: { startAt: string; endAt: string }) {
  const formatter = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const endFormatter = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

  return (
    <span>
      {formatter.format(new Date(startAt))} – {endFormatter.format(new Date(endAt))}
    </span>
  );
}
