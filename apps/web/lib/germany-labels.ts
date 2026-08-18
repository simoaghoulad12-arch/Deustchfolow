import type {
  GermanyGoalType,
  GermanyPathStep,
  OfficialSourceTopic,
  DocumentRequirementStatus,
} from '@deutschflow/types';

export const GOAL_TYPE_LABELS: Record<GermanyGoalType, string> = {
  WORK: 'Arbeiten',
  STUDY: 'Studieren',
  APPRENTICESHIP: 'Ausbildung',
  FAMILY: 'Familienzusammenführung',
  LANGUAGE: 'Deutsch lernen',
  JOB_SEARCH: 'Arbeitssuche',
  OTHER: 'Sonstiges',
};

export const PATH_STEP_LABELS: Record<GermanyPathStep, string> = {
  ORIENTATION: 'Orientierung',
  GERMAN_LEVEL: 'Deutschlevel',
  QUALIFICATION_CHECK: 'Qualifikation prüfen',
  JOB_OR_APPRENTICESHIP: 'Job/Ausbildung',
  DOCUMENTS: 'Dokumente',
  VISA_RESIDENCE_CHECK: 'Aufenthalt/Visum prüfen',
  ENTRY: 'Einreise',
  FIRST_STEPS: 'Erste Schritte',
  GERMANY_EVERYDAY_LIFE: 'Deutschland-Alltag',
};

export const OFFICIAL_SOURCE_TOPIC_LABELS: Record<OfficialSourceTopic, string> = {
  VISA: 'Visum',
  WORK_PERMIT: 'Arbeitserlaubnis',
  RECOGNITION_OF_QUALIFICATIONS: 'Anerkennung von Qualifikationen',
  JOB_SEARCH: 'Jobsuche',
  HOUSING: 'Wohnen',
  HEALTH_INSURANCE: 'Krankenversicherung',
  LANGUAGE: 'Sprache',
  GENERAL: 'Allgemein',
};

export const DOCUMENT_REQUIREMENT_STATUS_LABELS: Record<DocumentRequirementStatus, string> = {
  MISSING: 'Fehlt',
  UPLOADED: 'Hochgeladen',
  UNDER_REVIEW: 'Wird geprüft',
  VERIFIED: 'Geprüft',
  EXPIRED: 'Abgelaufen',
  NOT_REQUIRED: 'Nicht erforderlich',
};
