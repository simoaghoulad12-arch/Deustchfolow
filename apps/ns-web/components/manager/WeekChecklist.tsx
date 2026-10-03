'use client';

import { isoWeekKey } from '@/lib/manager';
import { cn } from '@/lib/cn';
import { useManagerStore } from './useManagerStore';

/** A checklist that resets every ISO week. `id` keeps lists apart in storage. */
export function WeekChecklist({ id, items }: { id: string; items: readonly string[] }) {
  const { state, ready, update } = useManagerStore();
  const week = isoWeekKey(new Date());
  const done = state.checks[week] ?? [];
  const count = items.filter((_, i) => done.includes(`${id}-${i}`)).length;

  function toggle(key: string) {
    update((prev) => {
      const current = prev.checks[week] ?? [];
      const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
      return { ...prev, checks: { ...prev.checks, [week]: next } };
    });
  }

  return (
    <div>
      <p className="tech text-mist">
        {week} · {ready ? `${count}/${items.length} erledigt` : '…'}
      </p>
      <ol className="mt-4 border-t border-white/[0.07]">
        {items.map((item, i) => {
          const key = `${id}-${i}`;
          const checked = done.includes(key);
          return (
            <li key={key} className="border-b border-white/[0.07]">
              <label className="flex min-h-[52px] cursor-pointer items-start gap-4 py-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(key)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[rgb(var(--accent))]"
                />
                <span className="tech w-5 shrink-0 pt-1 text-fog">{i + 1}</span>
                <span className={cn('text-sm leading-relaxed', checked && 'text-fog line-through')}>
                  {item}
                </span>
              </label>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
