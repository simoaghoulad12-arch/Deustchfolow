const ENTRIES = [
  {
    title: 'Why NS doesn’t show your reflection',
    excerpt: 'The clothes carry the identity. Not a face, not a name — the work itself.',
  },
  {
    title: 'Building the essential line',
    excerpt: 'Every piece starts with removing something, not adding it.',
  },
];

export function Journal() {
  return (
    <section id="journal" className="border-t border-stone/20 bg-ink px-5 py-24 sm:px-8 sm:py-32">
      <h2 className="mb-12 font-display text-3xl sm:text-5xl">Journal</h2>
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-16">
        {ENTRIES.map((entry) => (
          <article key={entry.title}>
            <h3 className="font-display text-xl sm:text-2xl">{entry.title}</h3>
            <p className="mt-3 max-w-md text-sm text-smoke">{entry.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
