/** CEFR (Gemeinsamer Europäischer Referenzrahmen) levels supported by the learning system. */
export const CEFRLevel = {
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
  B2: 'B2',
  C1: 'C1',
} as const;

export type CEFRLevel = (typeof CEFRLevel)[keyof typeof CEFRLevel];
