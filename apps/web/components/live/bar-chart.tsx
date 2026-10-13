/** Dependency-free bar chart (server-renderable) for daily series. */
export function BarChart({ data, label, format = (d) => d.slice(5) }: { data: { day: string; value: number }[]; label: string; format?: (day: string) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 flex items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold">{label}</span>
        <span className="tabular-nums text-muted-foreground">{total} total</span>
      </figcaption>
      <div className="flex h-32 items-end gap-1" role="img" aria-label={`${label}: ${data.map((d) => `${format(d.day)} ${d.value}`).join(', ')}`}>
        {data.map((d) => (
          <div key={d.day} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${d.day}: ${d.value}`}>
            <div className="rounded-t bg-gradient-to-t from-indigo-500 to-violet-400" style={{ height: `${Math.max(d.value ? 4 : 0, (d.value / max) * 100)}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground" aria-hidden>
        <span>{data[0] ? format(data[0].day) : ''}</span>
        <span>{data.at(-1) ? format(data.at(-1)!.day) : ''}</span>
      </div>
    </figure>
  );
}
