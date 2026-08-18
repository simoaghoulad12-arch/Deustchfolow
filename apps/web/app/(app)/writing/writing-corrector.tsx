'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import type { WritingCorrectionResult } from '@/lib/api/ai-writing';
import { correctWritingAction } from './actions';

export function WritingCorrector() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<WritingCorrectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCorrect() {
    const value = text.trim();
    if (!value || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);
    const response = await correctWritingAction(value);
    setIsSubmitting(false);

    if (!response.ok) {
      setError(response.message);
      return;
    }
    setResult(response.data);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Schreiben korrigieren</h1>
        <p className="text-sm text-muted-foreground">
          Schreib einen deutschen Text — du bekommst eine Korrektur mit Erklärung.
        </p>
      </div>

      <textarea
        aria-label="Dein Text auf Deutsch"
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={6}
        placeholder="Schreib hier deinen Text auf Deutsch…"
        disabled={isSubmitting}
        className="w-full rounded-md border border-border bg-background p-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
      />

      {error && <FormMessage type="error">{error}</FormMessage>}

      <Button type="button" onClick={handleCorrect} disabled={isSubmitting || !text.trim()}>
        {isSubmitting ? 'Wird korrigiert…' : 'Korrigieren'}
      </Button>

      {result && (
        <div className="space-y-4 rounded-lg border border-border p-4 text-sm">
          {result.failed && (
            <p className="text-xs text-muted-foreground">
              (Korrektur konnte gerade nicht vollständig erstellt werden.)
            </p>
          )}

          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Korrigierter Text</p>
            <p className="mt-1">{result.correctedText}</p>
          </div>

          {result.errors.length > 0 && (
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Gefundene Fehler</p>
              {result.errors.map((item, index) => (
                <div key={index}>
                  <p>
                    <span className="text-red-600 line-through">{item.original}</span>{' '}
                    <span className="text-green-700">{item.correction}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.category} — {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}

          {result.explanation && (
            <p className="border-t border-border pt-3 text-muted-foreground">{result.explanation}</p>
          )}

          {result.improvedVersion && (
            <div className="border-t border-border pt-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Verbesserte Version</p>
              <p className="mt-1">{result.improvedVersion}</p>
            </div>
          )}

          <div className="flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
            <span>Erkanntes Level: {result.detectedLevel}</span>
            <span>Score: {result.score}/100</span>
          </div>
        </div>
      )}
    </div>
  );
}
