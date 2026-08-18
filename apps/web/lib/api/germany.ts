import 'server-only';
import type {
  GermanyGoalType,
  GermanyPathStep,
  OfficialSourceTopic,
  DocumentRequirementStatus,
} from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export interface GermanyPathStepEntry {
  step: GermanyPathStep;
  status: 'DONE' | 'CURRENT' | 'UPCOMING';
}

export interface GermanyPath {
  userId: string;
  goalType: GermanyGoalType;
  currentStep: GermanyPathStep;
  steps: GermanyPathStepEntry[];
  nextStep: GermanyPathStep | null;
}

export interface OfficialSource {
  id: string;
  title: string;
  url: string;
  authority: string;
  topic: OfficialSourceTopic;
  language: string;
}

export interface DocumentRequirement {
  id: string;
  documentType: string;
  goal: GermanyGoalType;
  context: string | null;
  status: DocumentRequirementStatus;
  notes: string | null;
  source: OfficialSource | null;
}

export interface GermanyPathOverview {
  path: GermanyPath | null;
  relevantSources: OfficialSource[];
  documents: DocumentRequirement[];
}

export type GermanyActionResult = { ok: true } | { ok: false; error: string };

export async function getMyPathOverview(user: SessionUser): Promise<GermanyPathOverview> {
  const response = await callNestApi('/germany/my-path', user);
  if (!response.ok) return { path: null, relevantSources: [], documents: [] };
  return response.json();
}

export async function setGermanyGoal(user: SessionUser, goalType: GermanyGoalType): Promise<GermanyActionResult> {
  const response = await callNestApi('/germany/my-path/goal', user, {
    method: 'PUT',
    body: JSON.stringify({ goalType }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { ok: false, error: body?.message ?? 'Ziel konnte nicht gespeichert werden.' };
  }
  return { ok: true };
}

export async function setGermanyStep(user: SessionUser, step: GermanyPathStep): Promise<GermanyActionResult> {
  const response = await callNestApi('/germany/my-path/step', user, {
    method: 'PATCH',
    body: JSON.stringify({ step }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { ok: false, error: body?.message ?? 'Schritt konnte nicht gespeichert werden.' };
  }
  return { ok: true };
}

export async function createDocumentRequirement(
  user: SessionUser,
  input: { documentType: string; goal: GermanyGoalType; context?: string; notes?: string },
): Promise<GermanyActionResult> {
  const response = await callNestApi('/germany/documents', user, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { ok: false, error: body?.message ?? 'Dokument konnte nicht hinzugefügt werden.' };
  }
  return { ok: true };
}

export async function updateDocumentRequirementStatus(
  user: SessionUser,
  requirementId: string,
  status: DocumentRequirementStatus,
): Promise<GermanyActionResult> {
  const response = await callNestApi(`/germany/documents/${encodeURIComponent(requirementId)}`, user, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { ok: false, error: body?.message ?? 'Status konnte nicht aktualisiert werden.' };
  }
  return { ok: true };
}

export async function deleteDocumentRequirement(
  user: SessionUser,
  requirementId: string,
): Promise<GermanyActionResult> {
  const response = await callNestApi(`/germany/documents/${encodeURIComponent(requirementId)}`, user, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { ok: false, error: body?.message ?? 'Löschen fehlgeschlagen.' };
  }
  return { ok: true };
}
