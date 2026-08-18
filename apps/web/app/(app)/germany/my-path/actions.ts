'use server';

import { redirect } from 'next/navigation';
import type { GermanyGoalType, GermanyPathStep, DocumentRequirementStatus } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import {
  setGermanyGoal,
  setGermanyStep,
  createDocumentRequirement,
  updateDocumentRequirementStatus,
  deleteDocumentRequirement,
} from '@/lib/api/germany';

export async function setGoalAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  const goalType = String(formData.get('goalType') ?? '') as GermanyGoalType;
  const result = await setGermanyGoal(session, goalType);
  if (!result.ok) {
    redirect(`/germany/my-path?error=${encodeURIComponent(result.error)}`);
  }
  redirect('/germany/my-path?saved=goal');
}

export async function setStepAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  const step = String(formData.get('step') ?? '') as GermanyPathStep;
  const result = await setGermanyStep(session, step);
  if (!result.ok) {
    redirect(`/germany/my-path?error=${encodeURIComponent(result.error)}`);
  }
  redirect('/germany/my-path?saved=step');
}

export async function addDocumentAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  const documentType = String(formData.get('documentType') ?? '').trim();
  const goal = String(formData.get('goal') ?? '') as GermanyGoalType;
  const notes = String(formData.get('notes') ?? '').trim();

  if (!documentType) {
    redirect(`/germany/my-path?error=${encodeURIComponent('Bitte gib eine Dokumentenart an.')}`);
  }

  const result = await createDocumentRequirement(session, {
    documentType,
    goal,
    notes: notes.length > 0 ? notes : undefined,
  });
  if (!result.ok) {
    redirect(`/germany/my-path?error=${encodeURIComponent(result.error)}`);
  }
  redirect('/germany/my-path?saved=document');
}

export async function updateDocumentStatusAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  const requirementId = String(formData.get('requirementId') ?? '');
  const status = String(formData.get('status') ?? '') as DocumentRequirementStatus;

  const result = await updateDocumentRequirementStatus(session, requirementId, status);
  if (!result.ok) {
    redirect(`/germany/my-path?error=${encodeURIComponent(result.error)}`);
  }
  redirect('/germany/my-path?saved=document-status');
}

export async function deleteDocumentAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  const requirementId = String(formData.get('requirementId') ?? '');
  const result = await deleteDocumentRequirement(session, requirementId);
  if (!result.ok) {
    redirect(`/germany/my-path?error=${encodeURIComponent(result.error)}`);
  }
  redirect('/germany/my-path?saved=document-deleted');
}
