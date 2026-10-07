/** Minutenbereich "20–55" → [20, 55], sonst null (legacy: rng). Ohne Abhängigkeiten, auch im Browser nutzbar. */
export function minuteRange(zeit: string): [number, number] | null {
  const m = /^(\d+)[–-](\d+)$/.exec(zeit);
  return m ? [Number(m[1]), Number(m[2])] : null;
}
