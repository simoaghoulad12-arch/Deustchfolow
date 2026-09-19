const PILLARS = [
  { label: 'Premium Quality', icon: DiamondIcon },
  { label: 'Performance Wear', icon: DumbbellIcon },
  { label: 'Minimal Design', icon: TriangleIcon },
  { label: 'Global Mindset', icon: GlobeIcon },
];

export function BrandPillars() {
  return (
    <section className="border-y border-stone/20 bg-void px-5 py-10 sm:px-8">
      <ul className="grid grid-cols-2 gap-y-8 sm:flex sm:items-center sm:justify-between">
        {PILLARS.map(({ label, icon: Icon }) => (
          <li key={label} className="flex items-center gap-3">
            <Icon className="h-5 w-5 flex-shrink-0 text-gold" />
            <span className="text-xs uppercase tracking-widest2 text-smoke">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DiamondIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden="true">
      <path d="M6 4h12l4 6-10 10L2 10z" />
      <path d="M2 10h20M9 4l-2 6 5 10 5-10-2-6" />
    </svg>
  );
}

function DumbbellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden="true">
      <path d="M4 9v6M2 10v4M20 9v6M22 10v4M7 12h10" />
      <rect x="5" y="7" width="3" height="10" rx="1" />
      <rect x="16" y="7" width="3" height="10" rx="1" />
    </svg>
  );
}

function TriangleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden="true">
      <path d="M12 3l10 18H2z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </svg>
  );
}
