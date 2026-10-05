import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@deutschflow/ui';

/**
 * Immersion design system primitives. Server-safe (no hooks) so pages can
 * compose them freely; interactive pieces live in their own client files.
 */

export function Card({ className, children, as: Tag = 'div' }: { className?: string; children: ReactNode; as?: 'div' | 'section' | 'article' | 'li' }) {
  return <Tag className={cn('rounded-2xl border border-border bg-white p-5 shadow-sm', className)}>{children}</Tag>;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">{eyebrow}</p>}
        <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

const badgeTones = {
  neutral: 'bg-slate-100 text-slate-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-800',
  rose: 'bg-rose-50 text-rose-700',
  violet: 'bg-violet-50 text-violet-700',
} as const;

export function Badge({ tone = 'neutral', children, className }: { tone?: keyof typeof badgeTones; children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', badgeTones[tone], className)}>{children}</span>;
}

export function ProgressBar({ value, className, tone = 'indigo', label }: { value: number; className?: string; tone?: 'indigo' | 'green' | 'amber'; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const color = tone === 'green' ? 'bg-emerald-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500';
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Ring({ value, size = 64, label, children }: { value: number; size?: number; label?: string; children?: ReactNode }) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={label ?? `${Math.round(pct)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={6} className="stroke-slate-100" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={6}
          strokeLinecap="round"
          className="stroke-indigo-500 transition-all duration-700"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
        />
      </svg>
      <span className="absolute text-sm font-semibold">{children ?? `${Math.round(pct)}%`}</span>
    </div>
  );
}

export function Stat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: string; icon?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon && <span aria-hidden>{icon}</span>}
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function EmptyState({ icon = '✨', title, description, action }: { icon?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-white/60 px-6 py-12 text-center">
      <span className="mb-3 text-4xl" aria-hidden>
        {icon}
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'This page could not load', description = 'Something went wrong on our side. Please try again in a moment.', retryHref }: { title?: string; description?: string; retryHref?: string }) {
  return (
    <EmptyState
      icon="🌧️"
      title={title}
      description={description}
      action={retryHref ? <ButtonLink href={retryHref} variant="secondary">Try again</ButtonLink> : undefined}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-slate-100', className)} aria-hidden />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

const buttonStyles = {
  primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700',
  secondary: 'border border-border bg-white text-foreground hover:bg-slate-50',
  ghost: 'text-foreground hover:bg-slate-100',
  dark: 'bg-slate-900 text-white hover:bg-slate-800',
} as const;

export const buttonClass = (variant: keyof typeof buttonStyles = 'primary', size: 'sm' | 'md' | 'lg' = 'md') =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
    size === 'sm' ? 'h-9 px-3.5 text-sm' : size === 'lg' ? 'h-12 px-6 text-base' : 'h-11 px-5 text-sm',
    buttonStyles[variant],
  );

export function ButtonLink({ href, children, variant = 'primary', size = 'md', className }: { href: string; children: ReactNode; variant?: keyof typeof buttonStyles; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <Link href={href} className={cn(buttonClass(variant, size), className)}>
      {children}
    </Link>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold tracking-tight sm:text-lg">{children}</h2>
      {action}
    </div>
  );
}

export function LevelBadge({ level }: { level: string }) {
  return <Badge tone="indigo">{level}</Badge>;
}

export function ScoreBar({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{Math.round(value)}</span>
      </div>
      <ProgressBar value={value} tone={value >= 75 ? 'green' : value >= 50 ? 'indigo' : 'amber'} label={label} />
    </div>
  );
}
