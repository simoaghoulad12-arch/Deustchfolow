'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@deutschflow/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormMessage } from '@/components/ui/form-message';
import type { ExerciseListItem } from '@/lib/api/learning';
import { submitExerciseAttemptAction } from './actions';

const OPTION_BASED_TYPES = new Set(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'ORDER_WORDS']);

interface AttemptFeedback {
  isCorrect: boolean;
  explanation: string | null;
}

export function ExerciseWidget({ exercise, index }: { exercise: ExerciseListItem; index: number }) {
  const question = exercise.questions[0];
  const isOptionBased = OPTION_BASED_TYPES.has(exercise.type);
  const isOrderWords = exercise.type === 'ORDER_WORDS';

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [feedback, setFeedback] = useState<AttemptFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const router = useRouter();

  if (!question) return null;

  async function handleSubmit() {
    const answer = isOptionBased && !isOrderWords ? selectedOptionId : textAnswer.trim();
    if (!answer) return;

    setError(null);
    setIsSubmitting(true);
    const result = await submitExerciseAttemptAction(exercise.id, answer, Date.now() - startedAt);
    setIsSubmitting(false);

    if ('error' in result) {
      setError(result.error);
      return;
    }
    setFeedback(result);
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-5">
      <p className="font-medium">
        {index + 1}. {exercise.prompt}
      </p>

      {isOrderWords && (
        <p className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {question.options.map((option) => (
            <span key={option.id} className="rounded-md border border-border px-2 py-0.5">
              {option.text}
            </span>
          ))}
        </p>
      )}

      {isOptionBased && !isOrderWords ? (
        <div className="space-y-2">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 text-sm transition-colors hover:bg-muted/50',
                selectedOptionId === option.id && 'border-primary bg-primary/5',
              )}
            >
              <input
                type="radio"
                name={`exercise-${exercise.id}`}
                value={option.id}
                checked={selectedOptionId === option.id}
                onChange={() => setSelectedOptionId(option.id)}
                disabled={feedback !== null}
                className="h-4 w-4"
              />
              {option.text}
            </label>
          ))}
        </div>
      ) : (
        <Input
          value={textAnswer}
          onChange={(event) => setTextAnswer(event.target.value)}
          disabled={feedback !== null}
          placeholder="Deine Antwort"
        />
      )}

      {error && <FormMessage type="error">{error}</FormMessage>}

      {feedback ? (
        <FormMessage type={feedback.isCorrect ? 'success' : 'error'}>
          {feedback.isCorrect ? 'Richtig!' : 'Nicht ganz richtig.'}
          {feedback.explanation && <> {feedback.explanation}</>}
        </FormMessage>
      ) : (
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Wird geprüft…' : 'Antworten'}
        </Button>
      )}
    </div>
  );
}
