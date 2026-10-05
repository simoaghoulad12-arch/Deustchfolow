'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormMessage } from '@/components/ui/form-message';
import type { VocabularyCard, VocabularyReviewResult } from '@/lib/api/vocabulary';
import { reviewVocabularyAction } from './actions';

function formatNextReview(intervalDays: number): string {
  return intervalDays === 1 ? 'morgen' : `in ${intervalDays} Tagen`;
}

export function VocabularyTrainer({ cards }: { cards: VocabularyCard[] }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<VocabularyReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<Array<{ word: string; translation: string }>>([]);

  if (cards.length === 0) {
    return (
      <div className="space-y-3 rounded-lg border border-border p-6">
        <p className="font-medium">Heute ist nichts fällig.</p>
        <p className="text-sm text-muted-foreground">Gut gemacht — schau morgen wieder vorbei.</p>
        <Link href="/vocabulary" className="inline-block">
          <Button variant="outline">Zur Vokabelübersicht</Button>
        </Link>
      </div>
    );
  }

  if (index >= cards.length) {
    return (
      <div className="space-y-4 rounded-lg border border-border p-6">
        <p className="text-lg font-semibold">Session abgeschlossen</p>
        <p className="text-sm">
          {correctCount} von {cards.length} richtig.
        </p>
        {missed.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Diese Wörter kommen morgen wieder:</p>
            <ul className="space-y-1 text-sm">
              {missed.map((entry) => (
                <li key={entry.word}>
                  <span className="font-medium">{entry.word}</span> — {entry.translation}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link href="/vocabulary" className="inline-block">
          <Button>Zur Vokabelübersicht</Button>
        </Link>
      </div>
    );
  }

  const card = cards[index]!;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = answer.trim();
    if (!trimmed || result) return;

    setError(null);
    setIsSubmitting(true);
    const response = await reviewVocabularyAction(card.id, trimmed);
    setIsSubmitting(false);

    if ('error' in response) {
      setError(response.error);
      return;
    }
    setResult(response);
    if (response.isCorrect) {
      setCorrectCount((count) => count + 1);
    } else {
      setMissed((list) => [...list, { word: card.word, translation: response.correctTranslation }]);
    }
  }

  function handleNext() {
    setIndex((value) => value + 1);
    setAnswer('');
    setResult(null);
    setError(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Karte {index + 1} von {cards.length}
        </span>
        <span>{card.status === 'NEW' ? 'Neues Wort' : 'Wiederholung'}</span>
      </div>
      <div
        className="h-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={cards.length}
        aria-valuenow={index}
        aria-label="Fortschritt der Session"
      >
        <div className="h-full bg-primary transition-all" style={{ width: `${(index / cards.length) * 100}%` }} />
      </div>

      <form key={card.id} onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border p-6">
        <div className="space-y-1">
          <p className="text-2xl font-semibold">{card.word}</p>
          <p className="text-xs text-muted-foreground">
            {card.level}
            {card.partOfSpeech && <> · {card.partOfSpeech}</>}
          </p>
          {card.exampleSentence && <p className="text-sm italic text-muted-foreground">„{card.exampleSentence}“</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vocab-answer">Übersetzung</Label>
          <Input
            id="vocab-answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            disabled={result !== null}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            autoFocus
            maxLength={200}
          />
        </div>

        {error && <FormMessage type="error">{error}</FormMessage>}

        {result ? (
          <>
            <FormMessage type={result.isCorrect ? 'success' : 'error'}>
              {result.isCorrect ? 'Richtig!' : `Nicht ganz. Richtig ist: ${result.correctTranslation}.`} Nächste
              Wiederholung {formatNextReview(result.intervalDays)}.
            </FormMessage>
            <Button type="button" onClick={handleNext} autoFocus>
              {index + 1 < cards.length ? 'Weiter' : 'Ergebnis anzeigen'}
            </Button>
          </>
        ) : (
          <Button type="submit" disabled={isSubmitting || !answer.trim()}>
            {isSubmitting ? 'Wird geprüft…' : 'Prüfen'}
          </Button>
        )}
      </form>
    </div>
  );
}
