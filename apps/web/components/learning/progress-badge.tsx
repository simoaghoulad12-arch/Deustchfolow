import type { ProgressStatus } from '@deutschflow/types';
import { cn } from '@deutschflow/ui';

const LABELS: Record<ProgressStatus, string> = {
  NOT_STARTED: 'Nicht begonnen',
  IN_PROGRESS: 'In Bearbeitung',
  COMPLETED: 'Abgeschlossen',
};

export function ProgressBadge({
  status,
  progress,
}: {
  status: ProgressStatus | null | undefined;
  progress?: number;
}) {
  const effectiveStatus = status ?? 'NOT_STARTED';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        effectiveStatus === 'COMPLETED' && 'border-green-200 bg-green-50 text-green-700',
        effectiveStatus === 'IN_PROGRESS' && 'border-amber-200 bg-amber-50 text-amber-700',
        effectiveStatus === 'NOT_STARTED' && 'border-border bg-background text-muted-foreground',
      )}
    >
      {LABELS[effectiveStatus]}
      {typeof progress === 'number' && progress > 0 && effectiveStatus !== 'COMPLETED' && (
        <span>· {progress}%</span>
      )}
    </span>
  );
}
