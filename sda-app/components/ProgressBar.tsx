import { percent, type Progress } from '@/lib/progress';

export function ProgressBar({ progress, label }: { progress: Progress; label: string }) {
  const p = percent(progress);
  return (
    <div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={p}
        className="h-2 overflow-hidden rounded-full bg-line"
      >
        <div
          className={`h-full rounded-full ${p === 100 ? 'bg-ok' : 'bg-red'}`}
          style={{ width: `${p}%` }}
        />
      </div>
      <p className="mt-1 text-sm text-muted">
        {progress.done} / {progress.total} · {p} %
      </p>
    </div>
  );
}
