import 'server-only';
import type { CEFRLevel, TutorSpecialty, TutorVerificationStatus } from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export interface OfferingSummary {
  id: string;
  title: string;
  category: TutorSpecialty;
  durationMinutes: number;
  priceCents: number;
  currency: string;
}

export interface OfferingDetail extends OfferingSummary {
  description: string | null;
  cefrLevels: CEFRLevel[];
}

export interface TutorMarketplaceCard {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  headline: string | null;
  languages: string[];
  teachingLevels: CEFRLevel[];
  specialties: TutorSpecialty[];
  verificationStatus: TutorVerificationStatus;
  averageRating: number | null;
  reviewCount: number;
  completedSessions: number;
  offerings: OfferingSummary[];
}

export interface TutorPublicProfile extends Omit<TutorMarketplaceCard, 'offerings'> {
  aboutMe: string | null;
  yearsExperience: number | null;
  offerings: OfferingDetail[];
}

export interface TutorMarketplaceQuery {
  level?: CEFRLevel;
  language?: string;
  specialty?: TutorSpecialty;
  maxPriceCents?: number;
  minRating?: number;
}

export async function getTutors(
  user: SessionUser,
  query: TutorMarketplaceQuery,
): Promise<TutorMarketplaceCard[]> {
  const params = new URLSearchParams();
  if (query.level) params.set('level', query.level);
  if (query.language) params.set('language', query.language);
  if (query.specialty) params.set('specialty', query.specialty);
  if (query.maxPriceCents !== undefined) params.set('maxPriceCents', String(query.maxPriceCents));
  if (query.minRating !== undefined) params.set('minRating', String(query.minRating));

  const qs = params.toString();
  const response = await callNestApi(`/tutors${qs ? `?${qs}` : ''}`, user);
  if (!response.ok) return [];
  return response.json();
}

export async function getTutorProfile(
  user: SessionUser,
  tutorId: string,
): Promise<TutorPublicProfile | null> {
  const response = await callNestApi(`/tutors/${encodeURIComponent(tutorId)}`, user);
  if (!response.ok) return null;
  return response.json();
}
