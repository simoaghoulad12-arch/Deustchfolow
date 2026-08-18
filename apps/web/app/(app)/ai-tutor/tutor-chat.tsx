'use client';

import { useState } from 'react';
import { cn } from '@deutschflow/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormMessage } from '@/components/ui/form-message';
import type { AiSuggestedExercisePublic, CEFRLevel, CorrectionItem } from '@deutschflow/types';
import { sendTutorMessageAction, answerAiExerciseAction } from './actions';

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
  messageId?: string;
  failed?: boolean;
  corrections?: CorrectionItem[];
  explanation?: string | null;
  suggestedExercise?: AiSuggestedExercisePublic | null;
  exerciseAnswer?: { answer: string; isCorrect: boolean } | null;
}

const SEVERITY_LABEL: Record<string, string> = { LOW: 'gering', MEDIUM: 'mittel', HIGH: 'hoch' };

export function TutorChat({
  initialLevel,
  simulation,
}: {
  initialLevel: CEFRLevel | null;
  /** When set, the first message starts a Real-Life Simulation run (spec section 15) instead of a general tutor chat. */
  simulation?: { id: string; title: string; situation: string; goal: string };
}) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<CEFRLevel | null>(initialLevel);

  async function handleSend() {
    const message = input.trim();
    if (!message || isSubmitting) return;

    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    setIsSubmitting(true);

    // simulationId only matters for starting a NEW session — once sessionId
    // is set, the API keeps whatever the session was started with.
    const result = await sendTutorMessageAction(
      message,
      sessionId ?? undefined,
      sessionId ? undefined : simulation?.id,
    );
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSessionId(result.data.sessionId);
    setLevel(result.data.level);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: result.data.response,
        messageId: result.data.messageId,
        failed: result.data.failed,
        corrections: result.data.corrections,
        explanation: result.data.explanation,
        suggestedExercise: result.data.suggestedExercise,
        exerciseAnswer: null,
      },
    ]);
  }

  async function handleAnswerExercise(index: number, answer: string) {
    const turn = messages[index];
    if (!sessionId || !turn?.messageId) return;

    const result = await answerAiExerciseAction(sessionId, turn.messageId, answer);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setMessages((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, exerciseAnswer: { answer, isCorrect: result.data.isCorrect } } : m,
      ),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{simulation ? simulation.title : 'KI-Tutor'}</h1>
        {level && (
          <span className="rounded-full border border-border px-3 py-1 text-xs uppercase text-muted-foreground">
            Level {level}
          </span>
        )}
      </div>

      {simulation && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <p>{simulation.situation}</p>
          <p className="mt-1 text-xs text-muted-foreground">Ziel: {simulation.goal}</p>
        </div>
      )}

      {messages.length === 0 && !simulation && (
        <p className="text-sm text-muted-foreground">
          Stell eine Frage auf Deutsch oder schreib einen Satz — der Tutor antwortet und korrigiert bei
          Bedarf.
        </p>
      )}
      {messages.length === 0 && simulation && (
        <p className="text-sm text-muted-foreground">
          Schreib deine erste Nachricht, um die Simulation zu starten.
        </p>
      )}

      <div className="space-y-4">
        {messages.map((turn, index) => (
          <div
            key={index}
            className={cn(
              'rounded-lg border p-4 text-sm',
              turn.role === 'user' ? 'border-border bg-muted/40' : 'border-primary/20 bg-primary/5',
            )}
          >
            <p className="mb-1 text-xs uppercase text-muted-foreground">
              {turn.role === 'user' ? 'Du' : 'Tutor'}
            </p>
            <p>{turn.content}</p>

            {turn.failed && (
              <p className="mt-2 text-xs text-muted-foreground">
                (Antwort konnte gerade nicht vollständig erstellt werden.)
              </p>
            )}

            {turn.corrections && turn.corrections.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">Korrekturen</p>
                {turn.corrections.map((correction, correctionIndex) => (
                  <div key={correctionIndex}>
                    <p>
                      <span className="text-red-600 line-through">{correction.original}</span>{' '}
                      <span className="text-green-700">{correction.correction}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {correction.category} · Schweregrad{' '}
                      {SEVERITY_LABEL[correction.severity] ?? correction.severity} —{' '}
                      {correction.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {turn.explanation && (
              <p className="mt-3 border-t border-border pt-3 text-muted-foreground">{turn.explanation}</p>
            )}

            {turn.suggestedExercise && (
              <ExercisePractice
                exercise={turn.suggestedExercise}
                answer={turn.exerciseAnswer}
                onAnswer={(answer) => handleAnswerExercise(index, answer)}
              />
            )}
          </div>
        ))}
      </div>

      {error && <FormMessage type="error">{error}</FormMessage>}

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder="Schreib etwas auf Deutsch…"
          disabled={isSubmitting}
        />
        <Button type="button" onClick={handleSend} disabled={isSubmitting || !input.trim()}>
          {isSubmitting ? 'Sendet…' : 'Senden'}
        </Button>
      </div>
    </div>
  );
}

function ExercisePractice({
  exercise,
  answer,
  onAnswer,
}: {
  exercise: AiSuggestedExercisePublic;
  answer: { answer: string; isCorrect: boolean } | null | undefined;
  onAnswer: (answer: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const isOptionBased = exercise.options && exercise.options.length > 0;

  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">Übung</p>
      <p>{exercise.prompt}</p>

      {answer ? (
        <FormMessage type={answer.isCorrect ? 'success' : 'error'}>
          {answer.isCorrect ? 'Richtig!' : `Nicht ganz. Deine Antwort: „${answer.answer}"`}
        </FormMessage>
      ) : isOptionBased ? (
        <div className="space-y-2">
          {exercise.options!.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-2 hover:bg-muted/50"
            >
              <input
                type="radio"
                name={`ai-exercise-${exercise.prompt}`}
                checked={selected === option.text}
                onChange={() => setSelected(option.text)}
                className="h-4 w-4"
              />
              {option.text}
            </label>
          ))}
          <Button
            type="button"
            variant="outline"
            disabled={!selected}
            onClick={() => selected && onAnswer(selected)}
          >
            Antworten
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={textAnswer}
            onChange={(event) => setTextAnswer(event.target.value)}
            placeholder="Deine Antwort"
          />
          <Button
            type="button"
            variant="outline"
            disabled={!textAnswer.trim()}
            onClick={() => onAnswer(textAnswer.trim())}
          >
            Antworten
          </Button>
        </div>
      )}
    </div>
  );
}
