import { DNA_DIMENSIONS, DNA_LABELS, type DnaDimension } from '@deutschflow/types';

/** Language DNA radar chart (pure SVG, accessible via the data table fallback). */
export function DnaRadar({ dna, size = 280 }: { dna: Record<DnaDimension, number>; size?: number }) {
  const center = size / 2;
  const radius = size / 2 - 42;
  const n = DNA_DIMENSIONS.length;
  const point = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (Math.max(0, Math.min(100, value)) / 100) * radius;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)] as const;
  };
  const polygon = DNA_DIMENSIONS.map((d, i) => point(i, dna[d] ?? 0).join(',')).join(' ');
  const empty = DNA_DIMENSIONS.every((d) => !dna[d]);

  return (
    <figure className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[320px]" role="img" aria-label="Language DNA radar chart">
        {[25, 50, 75, 100].map((ring) => (
          <polygon
            key={ring}
            points={DNA_DIMENSIONS.map((_, i) => point(i, ring).join(',')).join(' ')}
            className="fill-none stroke-slate-200"
            strokeWidth={1}
          />
        ))}
        {DNA_DIMENSIONS.map((d, i) => {
          const [x, y] = point(i, 100);
          const [lx, ly] = point(i, 122);
          return (
            <g key={d}>
              <line x1={center} y1={center} x2={x} y2={y} className="stroke-slate-200" strokeWidth={1} />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-slate-500 text-[9px] font-medium">
                {DNA_LABELS[d]}
              </text>
            </g>
          );
        })}
        {!empty && <polygon points={polygon} className="fill-indigo-500/20 stroke-indigo-500" strokeWidth={2} strokeLinejoin="round" />}
      </svg>
      <figcaption className="sr-only">
        <table>
          <tbody>
            {DNA_DIMENSIONS.map((d) => (
              <tr key={d}>
                <th>{DNA_LABELS[d]}</th>
                <td>{dna[d] ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
      {empty && <p className="-mt-2 text-center text-xs text-muted-foreground">Complete your first mission to calibrate your Language DNA.</p>}
    </figure>
  );
}
