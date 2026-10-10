import type { Evaluation } from '@/lib/api/live';
import { MISTAKE_CATEGORY_LABELS } from '@deutschflow/types';
import { Badge, Ring, ScoreBar } from './ui';

export function CorrectionCard({ c }: { c: Evaluation['corrections'][number] }) {
  return (
    <li className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-sm">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Badge tone="amber">{MISTAKE_CATEGORY_LABELS[c.category]}</Badge>
      </div>
      <p>
        <span className="text-slate-500 line-through decoration-rose-400">{c.original}</span>
      </p>
      <p className="font-semibold text-emerald-700">{c.better}</p>
      <p className="mt-1 text-slate-600">{c.explanation}</p>
      {c.reuseTip && <p className="mt-1 text-xs text-indigo-700">💡 {c.reuseTip}</p>}
    </li>
  );
}

export function EvaluationView({ evaluation, xpAwarded }: { evaluation: Evaluation; xpAwarded?: number }) {
  const s = evaluation.scores;
  return (
    <div className="space-y-4" aria-live="polite">
      <div className="flex items-center gap-4">
        <Ring value={evaluation.overall} size={72} label={`Score ${evaluation.overall}`} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{evaluation.overall >= 80 ? 'Excellent!' : evaluation.overall >= 60 ? 'Nice work!' : 'Good effort — keep going!'}</p>
          <p className="text-sm text-muted-foreground">{evaluation.feedback}</p>
          {xpAwarded ? <p className="mt-1 text-sm font-semibold text-indigo-600">+{xpAwarded} XP</p> : null}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ScoreBar label="Grammar" value={s.grammar} />
        <ScoreBar label="Vocabulary" value={s.vocabulary} />
        <ScoreBar label="Fluency" value={s.fluency} />
        <ScoreBar label="Naturalness" value={s.naturalness} />
        <ScoreBar label="Pronunciation" value={s.pronunciation} />
        <ScoreBar label="Coherence" value={s.coherence} />
      </div>
      {evaluation.tone && (
        <div className={evaluation.tone.matchesTarget ? 'rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800' : 'rounded-xl bg-amber-50 p-3 text-sm text-amber-900'}>
          <p className="font-semibold">Tone: {evaluation.tone.detected} {evaluation.tone.matchesTarget ? '✓' : '— not quite the target'}</p>
          <p>{evaluation.tone.explanation}</p>
        </div>
      )}
      {evaluation.corrections.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Corrections</p>
          <ul className="space-y-2">
            {evaluation.corrections.map((c, i) => (
              <CorrectionCard key={`${c.original}-${i}`} c={c} />
            ))}
          </ul>
        </div>
      )}
      {evaluation.improvedVersion && (
        <div className="rounded-xl bg-indigo-50 p-3 text-sm">
          <p className="mb-1 font-semibold text-indigo-800">A natural version</p>
          <p>{evaluation.improvedVersion}</p>
        </div>
      )}
    </div>
  );
}
