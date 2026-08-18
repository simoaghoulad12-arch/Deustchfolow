import 'server-only';
import type { CEFRLevel, LearningSkill, SimulationCategory } from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export interface Simulation {
  id: string;
  title: string;
  category: SimulationCategory;
  cefrLevel: CEFRLevel;
  situation: string;
  goal: string;
  roles: string[];
  expectedSkills: LearningSkill[];
}

export async function getSimulations(
  user: SessionUser,
  query: { category?: SimulationCategory; cefrLevel?: CEFRLevel },
): Promise<Simulation[]> {
  const params = new URLSearchParams();
  if (query.category) params.set('category', query.category);
  if (query.cefrLevel) params.set('cefrLevel', query.cefrLevel);
  const qs = params.toString();

  const response = await callNestApi(`/simulations${qs ? `?${qs}` : ''}`, user);
  if (!response.ok) return [];
  return response.json();
}

export async function getSimulation(user: SessionUser, simulationId: string): Promise<Simulation | null> {
  const response = await callNestApi(`/simulations/${encodeURIComponent(simulationId)}`, user);
  if (!response.ok) return null;
  return response.json();
}
