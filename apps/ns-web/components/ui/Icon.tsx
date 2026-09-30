import { cn } from '@/lib/cn';

const PATHS = {
  menu: <path d="M3 8h18M3 16h12" />,
  close: <path d="M5 5l14 14M19 5L5 19" />,
  bag: <path d="M5 8h14l-1 12H6L5 8zm4 0V6a3 3 0 016 0v2" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />,
  user: <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" />,
  grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
  crown: <path d="M4 17h16M5 17l-1-9 4.5 4L12 5l3.5 7L20 8l-1 9" />,
  arrow: <path d="M4 12h16m-6-6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
    </>
  ),
  chevron: <path d="M9 6l6 6-6 6" />,
  search: <path d="M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13zm4.6-1.9L20 20" />,
  ruler: <path d="M3 15l12-12 6 6-12 12-6-6zm4-4l2 2m1-5l2 2m1-5l2 2" />,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  className,
  filled,
}: {
  name: IconName;
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn('h-[20px] w-[20px]', className)}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}
