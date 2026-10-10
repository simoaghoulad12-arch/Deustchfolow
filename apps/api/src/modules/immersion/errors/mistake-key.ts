/** Stable identity for "the same mistake": normalised original→correction pair. */
export function mistakeKey(original: string, corrected: string): string {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9äöüß ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  return `${norm(original)}=>${norm(corrected)}`.slice(0, 300);
}

/** Mastery transition: 3 correct uses in a row masters a mistake; a repeat resets progress. */
export function nextMastery(correctStreak: number): 'NEW' | 'PRACTICING' | 'MASTERED' {
  if (correctStreak >= 3) return 'MASTERED';
  if (correctStreak >= 1) return 'PRACTICING';
  return 'NEW';
}
