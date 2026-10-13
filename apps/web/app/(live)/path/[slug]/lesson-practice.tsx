'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Evaluation, PathLesson } from '@/lib/api/live';
import { Card, buttonClass } from '@/components/live/ui';
import { ExerciseInput } from '@/components/live/exercise-input';
import { AnswerBox } from '@/components/live/answer-box';
import { EvaluationView } from '@/components/live/evaluation-view';
import { speak } from '@/components/live/use-speech';
import { answerExerciseAction, completeLessonAction, submitPracticeAction } from '../../actions';

export function ListenButton({ text, languageCode, label, withLabel }: { text: string; languageCode: string; label: string; withLabel?: boolean }) {
  return (
    <button type="button" onClick={() => speak(text, languageCode, 0.9)} aria-label={label} className={withLabel ? buttonClass('secondary', 'sm') : 'shrink-0 rounded-lg p-1 text-lg hover:bg-white'}>
      <span aria-hidden>🔊</span>
      {withLabel && <span>Listen</span>}
    </button>
  );
}

type Feedback = { correct: boolean; expected: string; explanation: string | null };

/** Assessment (exercises), speaking & writing tasks and lesson completion. */
export function LessonPractice({ lesson, languageCode }: { lesson: PathLesson; languageCode: string }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [done, setDone] = useState<{ xp: number; levelCompleted: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const c = lesson.content ?? {};
  const task = lesson.skill === 'WRITING' || lesson.skill === 'READING' ? c.writingPrompt ?? c.speakingPrompt : c.speakingPrompt ?? c.writingPrompt;
  const spoken = !(lesson.skill === 'WRITING' || lesson.skill === 'READING') && Boolean(c.speakingPrompt);

  return (
    <>
      {lesson.exercises.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold">Check yourself</h2>
          <ol className="space-y-6">
            {lesson.exercises.map((exercise, i) => {
              const f = feedback[exercise.id];
              return (
                <li key={exercise.id}>
                  <p className="mb-1 text-xs text-muted-foreground">
                    {i + 1} / {lesson.exercises.length}
                  </p>
                  <ExerciseInput
                    exercise={exercise}
                    languageCode={languageCode}
                    busy={pending}
                    disabled={Boolean(f)}
                    onSubmit={(answer) =>
                      start(async () => {
                        setError(null);
                        const res = await answerExerciseAction(exercise.id, answer);
                        if (!res.ok) return setError(res.message);
                        setFeedback((all) => ({ ...all, [exercise.id]: res.data }));
                      })
                    }
                  />
                  {f && (
                    <p role="status" className={`mt-3 rounded-xl p-3 text-sm ${f.correct ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}>
                      {f.correct ? '✓ Correct!' : `Not quite. Correct answer: ${f.expected}`}
                      {f.explanation ? ` ${f.explanation}` : ''}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </Card>
      )}

      {task && (
        <Card>
          <h2 className="mb-1 font-semibold">{spoken ? 'Speaking' : 'Writing'}</h2>
          <p className="mb-4 text-sm text-muted-foreground">{task}</p>
          {evaluation ? (
            <EvaluationView evaluation={evaluation} />
          ) : (
            <AnswerBox
              languageCode={languageCode}
              busy={pending}
              rows={3}
              variant={spoken ? 'speak' : 'default'}
              submitLabel="Get feedback"
              onSubmit={(text, meta) =>
                start(async () => {
                  setError(null);
                  const res = await submitPracticeAction({ mode: 'speaking', prompt: task, response: text, responseMs: meta.responseMs, spoken: meta.spoken, speechConfidence: meta.speechConfidence });
                  if (!res.ok) return setError(res.message);
                  setEvaluation(res.data.evaluation);
                })
              }
            />
          )}
        </Card>
      )}

      {error && (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {lesson.completed || done ? (
          <p className="font-semibold text-emerald-700" role="status">
            ✓ Lesson complete{done && done.xp > 0 ? ` · +${done.xp} XP` : ''}
            {done?.levelCompleted ? ` · 🏆 ${lesson.level} completed!` : ''}
          </p>
        ) : (
          <button
            type="button"
            disabled={pending}
            className={buttonClass('primary')}
            onClick={() =>
              start(async () => {
                setError(null);
                const res = await completeLessonAction(lesson.slug);
                if (!res.ok) return setError(res.message);
                setDone({ xp: res.data.xpAwarded, levelCompleted: res.data.levelCompleted });
                router.refresh();
              })
            }
          >
            Complete lesson
          </button>
        )}
        {(lesson.completed || done) && lesson.next && (
          <button type="button" className={buttonClass('secondary')} onClick={() => router.push(`/path/${lesson.next}`)}>
            Next lesson →
          </button>
        )}
      </div>
    </>
  );
}
