/** Static accent classes per world environment (Tailwind needs literal class names). */
const ACCENTS: Record<string, { bg: string; text: string; ring: string; soft: string }> = {
  amber: { bg: 'bg-amber-500', text: 'text-amber-700', ring: 'ring-amber-200', soft: 'bg-amber-50' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-700', ring: 'ring-rose-200', soft: 'bg-rose-50' },
  sky: { bg: 'bg-sky-500', text: 'text-sky-700', ring: 'ring-sky-200', soft: 'bg-sky-50' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-700', ring: 'ring-orange-200', soft: 'bg-orange-50' },
  lime: { bg: 'bg-lime-500', text: 'text-lime-700', ring: 'ring-lime-200', soft: 'bg-lime-50' },
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-700', ring: 'ring-indigo-200', soft: 'bg-indigo-50' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-700', ring: 'ring-violet-200', soft: 'bg-violet-50' },
  red: { bg: 'bg-red-500', text: 'text-red-700', ring: 'ring-red-200', soft: 'bg-red-50' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-700', ring: 'ring-cyan-200', soft: 'bg-cyan-50' },
  slate: { bg: 'bg-slate-500', text: 'text-slate-700', ring: 'ring-slate-200', soft: 'bg-slate-100' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-700', ring: 'ring-blue-200', soft: 'bg-blue-50' },
  stone: { bg: 'bg-stone-500', text: 'text-stone-700', ring: 'ring-stone-200', soft: 'bg-stone-100' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-700', ring: 'ring-pink-200', soft: 'bg-pink-50' },
  teal: { bg: 'bg-teal-500', text: 'text-teal-700', ring: 'ring-teal-200', soft: 'bg-teal-50' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-700', ring: 'ring-emerald-200', soft: 'bg-emerald-50' },
};

export function accent(key: string | null | undefined) {
  return ACCENTS[key ?? 'indigo'] ?? ACCENTS.indigo!;
}
