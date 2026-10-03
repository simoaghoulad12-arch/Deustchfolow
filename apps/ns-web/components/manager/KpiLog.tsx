'use client';

import { useState } from 'react';
import { KPIS, isoWeekKey, type KpiId } from '@/lib/manager';
import { useManagerStore } from './useManagerStore';

/** Sunday numbers: one row per ISO week, newest first. */
export function KpiLog() {
  const { state, ready, update } = useManagerStore();
  const [week, setWeek] = useState(() => isoWeekKey(new Date()));
  const entry = state.kpis[week] ?? {};
  const weeks = Object.keys(state.kpis)
    .filter((w) => Object.values(state.kpis[w] ?? {}).some((v) => v && v.trim() !== ''))
    .sort()
    .reverse();

  function set(id: KpiId, value: string) {
    update((prev) => ({
      ...prev,
      kpis: { ...prev.kpis, [week]: { ...prev.kpis[week], [id]: value } },
    }));
  }

  return (
    <div>
      <label className="flex items-center gap-3">
        <span className="label text-mist">السيمانة</span>
        <input
          value={week}
          onChange={(e) => setWeek(e.target.value)}
          pattern="\d{4}-W\d{2}"
          dir="ltr"
          className="tech h-11 w-32 border border-white/10 bg-transparent px-3 text-ivory focus:border-accent focus:outline-none"
        />
      </label>

      <div className="mt-6 grid gap-px bg-white/[0.07] sm:grid-cols-2">
        {KPIS.map((k) => (
          <label key={k.id} className="flex flex-col gap-2 bg-ink p-4">
            <span className="text-sm">{k.label}</span>
            <span className="tech text-fog">
              البداية: {k.start} · الهدف: {k.target}
            </span>
            <span className="flex items-center gap-2">
              <input
                inputMode="decimal"
                value={entry[k.id] ?? ''}
                onChange={(e) => set(k.id, e.target.value)}
                disabled={!ready}
                className="h-14 w-full border border-white/10 bg-transparent px-4 tabular-nums text-ivory focus:border-accent focus:outline-none"
              />
              {k.unit && <span className="text-mist">{k.unit}</span>}
            </span>
          </label>
        ))}
      </div>

      {weeks.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] text-start text-sm">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="label py-3 pe-4 font-medium text-mist">السيمانة</th>
                {KPIS.map((k) => (
                  <th key={k.id} className="label py-3 pe-4 font-medium text-mist">
                    {k.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((w) => (
                <tr key={w} className="border-b border-white/[0.07]">
                  <td className="tech py-3 pe-4" dir="ltr">
                    <button type="button" onClick={() => setWeek(w)} className="hover:text-accent">
                      {w}
                    </button>
                  </td>
                  {KPIS.map((k) => (
                    <td key={k.id} className="py-3 pe-4 tabular-nums">
                      {state.kpis[w]?.[k.id] || '–'}
                      {state.kpis[w]?.[k.id] && k.unit ? ` ${k.unit}` : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
