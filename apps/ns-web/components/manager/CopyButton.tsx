'use client';

import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the text stays selectable */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="tech shrink-0 border border-white/10 px-3 py-2 text-mist transition-colors hover:border-accent hover:text-accent"
      aria-label={`Kopieren: ${text}`}
    >
      {copied ? 'Kopiert' : 'Kopieren'}
    </button>
  );
}
