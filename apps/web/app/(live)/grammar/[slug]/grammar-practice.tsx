'use client';

import { useState, useTransition } from 'react';
import type { Evaluation, GrammarTopicDetail } from '@/lib/api/live';
import { Card } from '@/components/live/ui';
import { ExerciseInput } from '@/components/live/exercise-input';
import { AnswerBox } from '@/components/live/answer-box';
import { EvaluationView } from '@/components/live/evaluation-view';
import { answerExerciseAction, grammarPracticeAction } from '../../actions';

type Feedback = { correct: boolean; expected: string; explanation: string | null };

export function GrammarPractice({ topic, languageCode }: { topic: GrammarTopicDetail; languageCode: string }) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [correctCount, setCorrect] = useState(0);
  const [aiResult, setAiResult] = useState<{ evaluation: Evaluation; xp: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const exercise = topic.exercises[index];
  const done = index >= topic.exercises.length;

  return (
    <>
      <Card>
        <h2 className="mb-4 font-semibold">3 · Guided practice</h2>
        {done ? (
          <p className="text-sm">
            🎉 {correctCount} of {topic.exercises.length} correct. Now use it freely below.
          </p>
        ) : exercise ? (
          <>
            <p className="mb-3 text-xs text-muted-foreground">
              Exercise {index + 1} of {topic.exercises.length}
            </p>
            <ExerciseInput
              exercise={exercise}
              languageCode={languageCode}
              busy={pending}
              disabled={feedback !== null}
              onSubmit={(answer) =>
                start(async () => {
                  setError(null);
                  const res = await answerExerciseAction(exercise.id, answer);
                  if (!res.ok) return setError(res.message);
                  setFeedback(res.data);
                  if (res.data.correct) setCorrect((c) => c + 1);
                })
              }
            />
            {feedback && (
              <div className={`mt-4 rounded-xl p-4 text-sm ${feedback.correct ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`} role="status">
                <p className="font-semibold">{feedback.correct ? '✓ Correct!' : `Not quite. Correct answer: ${feedback.expected}`}</p>
                {feedback.explanation && <p className="mt-1">{feedback.explanation}</p>}
                <button
                  type="button"
                  className="mt-3 font-semibold text-indigo-700"
                  onClick={() => {
                    setFeedback(null);
                    setIndex((i) => i + 1);
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No exercises for this topic yet.</p>
        )}
        {error && (
          <p className="mt-3 text-sm text-rose-600" role="alert">
            {error}
          </p>
        )}
      </Card>
      <Card>
        <h2 className="mb-1 font-semibold">4 · Use it with the AI</h2>
        <p className="mb-4 text-sm text-muted-foreground">{topic.practicePrompt}</p>
        {aiResult ? (
          <EvaluationView evaluation={aiResult.evaluation} xpAwarded={aiResult.xp} />
        ) : (
          <AnswerBox
            languageCode={languageCode}
            busy={pending}
            rows={3}
            minLength={3}
            submitLabel="Check"
            onSubmit={(text) =>
              start(async () => {
                setError(null);
                const res = await grammarPracticeAction(topic.slug, text);
                if (!res.ok) return setError(res.message);
                setAiResult({ evaluation: res.data.evaluation, xp: res.data.xpAwarded });
              })
            }
          />
        )}
      </Card>
    </>
  );
}
