'use client';

import { useState, useTransition } from 'react';
import { saveMaterialNote } from '@/app/actions/lesson';
import { t, type Lang } from '@/lib/i18n';

/** Feld „Im Lehrbuch (Seite / Lektion)“ – gespeichert in material_notes, für das ganze Team. */
export function MaterialNote({
  lessonId,
  initial,
  lang,
}: {
  lessonId: string;
  initial: string;
  lang: Lang;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [status, setStatus] = useState<'' | 'ok' | 'error'>('');
  const [pending, start] = useTransition();
  const save = () =>
    start(async () => {
      try {
        const r = await saveMaterialNote(lessonId, value);
        setStatus(r.ok ? 'ok' : 'error');
        if (r.ok) setSaved(value.trim());
      } catch {
        setStatus('error');
      }
    });
  return (
    <form
      className="card mb-4"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <label htmlFor={`note-${lessonId}`} className="mb-1 block font-medium">
        {t(lang, 'textbook')}
      </label>
      <div className="flex gap-2">
        <input
          id={`note-${lessonId}`}
          value={value}
          maxLength={200}
          onChange={(e) => {
            setValue(e.target.value);
            setStatus('');
          }}
          className="input"
          dir="auto"
        />
        <button
          type="submit"
          disabled={pending || value.trim() === saved}
          className="btn-secondary shrink-0"
        >
          {t(lang, 'save')}
        </button>
      </div>
      <p
        role="status"
        className={`mt-1 min-h-5 text-sm ${status === 'error' ? 'text-red' : 'text-muted'}`}
      >
        {status === 'ok' ? t(lang, 'saved') : status === 'error' ? t(lang, 'saveFailed') : ''}
      </p>
    </form>
  );
}
