'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Browser speech layer (SpeechService abstraction on the client): speech
 * recognition for answers and synthesis for listening. Uses the Web
 * Speech API where available and degrades to typing everywhere else —
 * audio never leaves the browser.
 */

const LOCALES: Record<string, string> = { de: 'de-DE', en: 'en-GB', es: 'es-ES', fr: 'fr-FR', it: 'it-IT' };

interface RecognitionResultEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string; confidence: number } }>;
}

interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition(languageCode: string) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const recognition = useRef<Recognition | null>(null);

  useEffect(() => {
    setSupported(getCtor() !== null);
    return () => recognition.current?.abort();
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    setError(null);
    setTranscript('');
    setConfidence(undefined);
    const r = new Ctor();
    r.lang = LOCALES[languageCode] ?? languageCode;
    r.interimResults = true;
    r.continuous = false;
    r.onresult = (event) => {
      let text = '';
      let conf: number | undefined;
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i]!;
        text += res[0].transcript;
        if (res.isFinal) conf = res[0].confidence;
      }
      setTranscript(text.trim());
      if (conf !== undefined) setConfidence(conf);
    };
    r.onerror = (e) => {
      setError(e.error === 'not-allowed' ? 'Microphone access was blocked. You can type your answer instead.' : 'We could not hear you clearly. Try again or type your answer.');
      setListening(false);
    };
    r.onend = () => setListening(false);
    recognition.current = r;
    r.start();
    setListening(true);
  }, [languageCode]);

  const stop = useCallback(() => {
    recognition.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, transcript, confidence, error, start, stop, setTranscript };
}

export function speak(text: string, languageCode: string, rate = 0.95) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LOCALES[languageCode] ?? languageCode;
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
  return true;
}
