'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@deutschflow/ui';
import { buttonClass } from './ui';
import { useSpeechRecognition } from './use-speech';

export interface AnswerMeta {
  spoken: boolean;
  speechConfidence?: number;
  responseMs: number;
  /** Time until the learner first typed or started recording. */
  firstInputMs?: number;
}

/**
 * Text + voice answer input used across missions, challenges and practice
 * modes. Measures response time from mount (or the last reset) so Brain
 * mode and Language DNA "response speed" get real data.
 */
export function AnswerBox({
  languageCode,
  onSubmit,
  busy = false,
  placeholder = 'Type your answer…',
  submitLabel = 'Send',
  rows = 2,
  autoFocus = false,
  resetKey,
  minLength = 1,
  variant = 'default',
  onFirstInput,
}: {
  languageCode: string;
  onSubmit: (text: string, meta: AnswerMeta) => void | Promise<void>;
  busy?: boolean;
  placeholder?: string;
  submitLabel?: string;
  rows?: number;
  autoFocus?: boolean;
  resetKey?: string | number;
  minLength?: number;
  /** "speak": a large microphone button with "Speak naturally." (Speaking mode). */
  variant?: 'default' | 'speak';
  onFirstInput?: () => void;
}) {
  const [text, setText] = useState('');
  const [spoken, setSpoken] = useState(false);
  const startedAt = useRef(Date.now());
  const firstInputAt = useRef<number | null>(null);
  const speech = useSpeechRecognition(languageCode);
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText('');
    setSpoken(false);
    startedAt.current = Date.now();
    firstInputAt.current = null;
    if (autoFocus) textarea.current?.focus();
  }, [resetKey, autoFocus]);

  useEffect(() => {
    if (speech.transcript) {
      setText(speech.transcript);
      setSpoken(true);
    }
  }, [speech.transcript]);

  const markInput = () => {
    if (firstInputAt.current !== null) return;
    firstInputAt.current = Date.now();
    onFirstInput?.();
  };

  const toggleMic = () => {
    if (speech.listening) return speech.stop();
    markInput();
    speech.start();
  };

  const submit = async () => {
    const value = text.trim();
    if (value.length < minLength || busy) return;
    await onSubmit(value, {
      spoken,
      speechConfidence: spoken ? speech.confidence : undefined,
      responseMs: Date.now() - startedAt.current,
      firstInputMs: firstInputAt.current !== null ? firstInputAt.current - startedAt.current : undefined,
    });
  };

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      {variant === 'speak' && (
        <div className="mb-4 flex flex-col items-center gap-3 text-center">
          <p className="text-lg font-semibold text-slate-800">Speak naturally.</p>
          {speech.supported ? (
            <>
              <button
                type="button"
                onClick={toggleMic}
                disabled={busy}
                aria-pressed={speech.listening}
                aria-label={speech.listening ? 'Stop recording' : 'Start recording your answer'}
                className={cn(
                  'flex h-28 w-28 items-center justify-center rounded-full text-5xl shadow-lg transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 sm:h-32 sm:w-32',
                  speech.listening ? 'animate-pulse bg-rose-500 text-white shadow-rose-200' : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-200 hover:scale-105',
                )}
              >
                <span aria-hidden>🎙️</span>
              </button>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {speech.listening ? 'Listening… tap again when you are done.' : text ? 'Check the transcript, then submit.' : 'Tap the microphone and answer out loud.'}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Voice input is not available in this browser. Type your answer below instead.</p>
          )}
        </div>
      )}
      <div
        className={cn(
          'flex flex-wrap items-end gap-2 rounded-2xl border border-border bg-white p-2 shadow-sm focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100',
          busy && 'opacity-70',
        )}
      >
        <label className="sr-only" htmlFor="answer-input">
          Your answer
        </label>
        <textarea
          id="answer-input"
          ref={textarea}
          value={text}
          rows={rows}
          disabled={busy}
          onChange={(e) => {
            markInput();
            setText(e.target.value);
            if (!e.target.value) setSpoken(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          placeholder={speech.listening ? 'Listening…' : placeholder}
          className="max-h-40 min-h-[44px] w-full min-w-0 resize-none bg-transparent px-2 py-2 text-base outline-none placeholder:text-slate-400 focus-visible:outline-none sm:w-auto sm:flex-1"
          lang={languageCode}
          maxLength={2000}
        />
        <div className="ml-auto flex shrink-0 gap-2">
          {speech.supported && variant === 'default' && (
            <button
              type="button"
              onClick={toggleMic}
              disabled={busy}
              aria-pressed={speech.listening}
              aria-label={speech.listening ? 'Stop recording' : 'Answer with your voice'}
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg transition',
                speech.listening
                  ? 'animate-pulse bg-rose-500 text-white'
                  : 'bg-slate-100 hover:bg-slate-200',
              )}
            >
              <span aria-hidden>🎙️</span>
            </button>
          )}
          <button
            type="submit"
            disabled={busy || text.trim().length < minLength}
            className={cn(buttonClass('primary'), 'h-11 shrink-0')}
          >
            {busy ? (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-label="Sending"
              />
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </div>
      {speech.error && (
        <p className="mt-2 text-xs text-rose-600" role="alert">
          {speech.error}
        </p>
      )}
    </form>
  );
}
