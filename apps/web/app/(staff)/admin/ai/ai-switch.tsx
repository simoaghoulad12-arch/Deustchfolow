'use client';

import { useState, useTransition } from 'react';
import { buttonClass } from '@/components/live/ui';
import { setAiEnabledAction } from '../actions';

export function AiSwitch({ enabled }: { enabled: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={pending}
        className={buttonClass(enabled ? 'secondary' : 'primary')}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = await setAiEnabledAction(!enabled);
            if (!res.ok) setError(res.message);
          })
        }
      >
        {enabled ? 'Switch to offline coach' : 'Turn real AI back on'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
