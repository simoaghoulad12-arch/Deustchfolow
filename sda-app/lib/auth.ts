import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import type { AppRole } from './roles';

export interface CurrentMember {
  id: string;
  email: string;
  fullName: string;
  role: AppRole;
}

/** Angemeldete Person mit Profil, sonst null (nicht angemeldet oder nicht eingeladen). */
export async function getCurrentMember(): Promise<CurrentMember | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .maybeSingle();
  if (!data) return null;
  return { id: data.id, email: data.email, fullName: data.full_name, role: data.role };
}

export async function requireMember(): Promise<CurrentMember> {
  const member = await getCurrentMember();
  // Angemeldet, aber ohne Profil = nicht eingeladen: kein Zugang.
  if (!member) redirect('/login?fehler=zugang');
  return member;
}

export async function requireAdmin(): Promise<CurrentMember> {
  const member = await requireMember();
  if (member.role !== 'admin') redirect('/');
  return member;
}
