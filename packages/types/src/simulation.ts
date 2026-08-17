export const SimulationCategory = {
  HOUSING: 'HOUSING',
  DOCTOR: 'DOCTOR',
  BANK: 'BANK',
  GOVERNMENT_OFFICE: 'GOVERNMENT_OFFICE',
  TRANSPORT: 'TRANSPORT',
  SHOPPING: 'SHOPPING',
  PHONE_CALL: 'PHONE_CALL',
  WORK: 'WORK',
  STUDY: 'STUDY',
  PACKAGE: 'PACKAGE',
  NEIGHBORS: 'NEIGHBORS',
} as const;

export type SimulationCategory = (typeof SimulationCategory)[keyof typeof SimulationCategory];
