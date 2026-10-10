'use client';

import { useState } from 'react';

/** Text in die Zwischenablage kopieren (WhatsApp-Vorlagen). */
export function CopyButton({ text, label = 'Text kopieren' }: { text: string; label?: string }) {
  const [state, setState] = useState<'' | 'ok' | 'error'>('');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState('ok');
    } catch {
      // Ältere Browser: Textfeld-Auswahl als Rückfall (wie legacy)
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        setState(ok ? 'ok' : 'error');
      } catch {
        setState('error');
      }
    }
  };
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={copy} className="btn-secondary">
        {label}
      </button>
      <span role="status" className="text-sm text-muted">
        {state === 'ok'
          ? 'Kopiert'
          : state === 'error'
            ? 'Kopieren nicht möglich – Text bitte markieren'
            : ''}
      </span>
    </span>
  );
}
