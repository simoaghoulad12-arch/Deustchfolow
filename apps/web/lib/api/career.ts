import 'server-only';
import type { CEFRLevel, CareerModuleType } from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export interface CareerModule {
  id: string;
  type: CareerModuleType;
  title: string;
  description: string;
  cefrLevel: CEFRLevel | null;
}

export async function getCareerModules(
  user: SessionUser,
  query: { type?: CareerModuleType; cefrLevel?: CEFRLevel } = {},
): Promise<CareerModule[]> {
  const params = new URLSearchParams();
  if (query.type) params.set('type', query.type);
  if (query.cefrLevel) params.set('cefrLevel', query.cefrLevel);
  const qs = params.toString();

  const response = await callNestApi(`/career/modules${qs ? `?${qs}` : ''}`, user);
  if (!response.ok) return [];
  return response.json();
}
