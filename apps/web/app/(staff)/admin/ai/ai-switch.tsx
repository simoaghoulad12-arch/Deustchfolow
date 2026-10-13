'use client';

import { useState, useTransition } from 'react';
import { ConfirmDialog } from '@/components/live/dialog';
import { buttonClass } from '@/components/live/ui';
import { setAiEnabledAction } from '../actions';

export function AiSwitch({ enabled }: { enabled: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const toggle = () =>
    start(async () => {
      setError(null);
      const res = await setAiEnabledAction(!enabled);
      if (!res.ok) setError(res.message);
    });
  return (
    <div className="mt-4">
      <button type="button" disabled={pending} className={buttonClass(enabled ? 'secondary' : 'primary')} onClick={() => (enabled ? setConfirming(true) : toggle())}>
        {enabled ? 'Switch to offline coach' : 'Turn real AI back on'}
      </button>
      <ConfirmDialog
        open={confirming}
        title="Switch every learner to the offline coach?"
        confirmLabel="Switch to offline coach"
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          toggle();
        }}
      >
        Conversations and feedback keep working, but they come from built-in rules instead of the AI model until you turn it back on.
      </ConfirmDialog>
      {error && (
        <p className="mt-2 text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
