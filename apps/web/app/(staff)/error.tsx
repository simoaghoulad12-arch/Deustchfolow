'use client';

import { useEffect } from 'react';
import { EmptyState, buttonClass } from '@/components/live/ui';

export default function LiveError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <EmptyState
      icon="🌧️"
      title="Something went wrong"
      description="This part of the app hit a problem. Your progress is safe."
      action={
        <button type="button" onClick={reset} className={buttonClass('secondary')}>
          Try again
        </button>
      }
    />
  );
}
