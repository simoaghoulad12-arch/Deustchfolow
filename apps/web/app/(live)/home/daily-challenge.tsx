'use client';

import { useState, useTransition } from 'react';
import type { DailyChallenge, Evaluation } from '@/lib/api/live';
import { Badge, Card, SectionTitle } from '@/components/live/ui';
import { AnswerBox } from '@/components/live/answer-box';
import { EvaluationView } from '@/components/live/evaluation-view';
import { submitChallengeAction } from '../actions';

export function DailyChallengeCard({ challenge, languageCode = 'de' }: { challenge: DailyChallenge; languageCode?: string }) {
  const [result, setResult] = useState<{ evaluation: Evaluation; xp: number } | null>(
    challenge.completed && challenge.feedback ? { evaluation: challenge.feedback, xp: challenge.xpAwarded } : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Card className="border-indigo-100">
      <SectionTitle action={<Badge tone={result ? 'green' : 'indigo'}>{result ? 'Completed' : `+100 XP`}</Badge>}>Daily challenge</SectionTitle>
      <p className="text-base font-medium">{challenge.prompt}</p>
      <p className="mt-1 text-xs text-muted-foreground">{challenge.reason}</p>
      <div className="mt-4">
        {result ? (
          <EvaluationView evaluation={result.evaluation} xpAwarded={result.xp} />
        ) : (
          <>
            <AnswerBox
              languageCode={languageCode}
              busy={pending}
              rows={3}
              submitLabel="Submit"
              placeholder="Write or say your answer…"
              onSubmit={(text, meta) =>
                startTransition(async () => {
                  setError(null);
                  const res = await submitChallengeAction({ response: text, spoken: meta.spoken, speechConfidence: meta.speechConfidence });
                  if (res.ok) setResult({ evaluation: res.data.evaluation, xp: res.data.xpAwarded });
                  else setError(res.message);
                })
              }
            />
            {error && (
              <p className="mt-2 text-sm text-rose-600" role="alert">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
