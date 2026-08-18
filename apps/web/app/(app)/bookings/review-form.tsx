'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createReviewAction } from './actions';

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [rating, setRating] = useState(0);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" variant="outline" size="default" onClick={() => setOpen(true)}>
        Bewerten
      </Button>
    );
  }

  return (
    <form action={createReviewAction} className="space-y-3 rounded-md border border-border p-3">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="rating" value={rating} />

      <div className="flex gap-1" role="radiogroup" aria-label="Bewertung in Sternen">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            onClick={() => setRating(value)}
            className={`text-2xl leading-none ${value <= rating ? 'text-yellow-500' : 'text-muted-foreground'}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        name="comment"
        maxLength={2000}
        rows={2}
        placeholder="Wie war die Session? (optional)"
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />

      <Button type="submit" size="default" disabled={rating === 0}>
        Bewertung abschicken
      </Button>
    </form>
  );
}
