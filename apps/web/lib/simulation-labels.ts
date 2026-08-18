import type { SimulationCategory, CareerModuleType } from '@deutschflow/types';

/** Emoji + label per category, exactly matching spec section 15's list. */
export const SIMULATION_CATEGORY_LABELS: Record<SimulationCategory, string> = {
  HOUSING: '🏠 Wohnung',
  DOCTOR: '🏥 Arzt',
  BANK: '🏦 Bank',
  GOVERNMENT_OFFICE: '🏢 Behörde',
  TRANSPORT: '🚆 Verkehr',
  SHOPPING: '🛒 Einkaufen',
  PHONE_CALL: '📞 Telefonieren',
  WORK: '💼 Arbeit',
  STUDY: '🎓 Studium',
  PACKAGE: '📦 Paket',
  NEIGHBORS: '👥 Nachbarn',
};

export const CAREER_MODULE_TYPE_LABELS: Record<CareerModuleType, string> = {
  CV: 'Lebenslauf',
  COVER_LETTER: 'Anschreiben',
  INTERVIEW: 'Vorstellungsgespräch',
  WORKPLACE_GERMAN: 'Deutsch am Arbeitsplatz',
  PROFESSIONAL_EMAIL: 'Professionelle E-Mails',
};
