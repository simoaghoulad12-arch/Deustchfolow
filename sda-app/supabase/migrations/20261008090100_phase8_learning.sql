-- Phase 8: Lern-App für Schüler.
-- Grundsatz: Ein Schüler sieht nur die eigenen Daten, nie Daten anderer Schüler und keine internen Team-Inhalte
-- (Dokumentation, Notizen, Häkchen, Entscheidungen, Team). Ergebnisse von Übungen und Tests schreibt nur der Server
-- nach der Auswertung (Service-Role), damit niemand eigene Punkte fälschen kann.

-- ------------------------------------------------------------------ Team vs. Schüler

-- WICHTIG: is_staff() darf Schüler nicht einschließen (bisher: jede Rolle).
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_app_role() in ('admin', 'teacher', 'native'), false)
$$;

create or replace function public.is_student() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_app_role() = 'student', false)
$$;

-- Verknüpfung Schüler ↔ Login
alter table public.students add column profile_id uuid unique references public.profiles (id) on delete set null;

create function public.current_student_id() returns uuid
language sql stable security definer set search_path = public as $$
  select s.id from public.students s where s.profile_id = auth.uid() and public.is_student()
$$;

-- Jede Person sieht das eigene Profil (für die Anmeldung), das Team sieht weiterhin das Team.
create policy profiles_self_select on public.profiles for select to authenticated using (id = auth.uid());
-- Das Team sieht keine Schüler-Profile (nur über die Schülerdaten)
drop policy profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (public.is_staff() and role <> 'student');

-- Schüler: eigener Datensatz lesen (nicht ändern)
create policy students_self_select on public.students for select to authenticated using (profile_id = auth.uid() and public.is_student());
-- Eigene Fehler und Hausaufgaben lesen (Status setzt nur das Team)
create policy errors_self_select on public.errors for select to authenticated using (student_id = public.current_student_id());
create policy homework_self_select on public.homework for select to authenticated using (student_id = public.current_student_id());

-- Fortschritts-Formel lesen dürfen auch Schüler (nur dieser Schlüssel)
create policy settings_student_select on public.app_settings for select to authenticated
  using (public.is_student() and key = 'progress_formula');

-- ------------------------------------------------------------------ Neue Tabellen

-- Antwort auf eine Übung (exercise_id z. B. 'A1.1.Di#2' oder 'error:<id>' für Fehler-Wiederholung)
create table public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  exercise_id text not null,
  answer text not null,
  correct boolean not null,
  created_at timestamptz not null default now()
);

-- Wochen-Mini-Test pro Modul
create table public.test_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  module_id text not null,
  score int not null check (score >= 0),
  max_score int not null check (max_score > 0 and score <= max_score),
  created_at timestamptz not null default now()
);

-- Abgabe einer Hausaufgabe als Text
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  homework_id uuid not null references public.homework (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  text text not null check (length(text) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index exercise_attempts_student_idx on public.exercise_attempts (student_id);
create index test_results_student_idx on public.test_results (student_id);
create index submissions_homework_idx on public.submissions (homework_id);

alter table public.exercise_attempts enable row level security;
alter table public.test_results enable row level security;
alter table public.submissions enable row level security;

-- Lesen: Schüler nur eigene, Team über die Sichtbarkeit des Schülers. Schreiben: nur Server (Service-Role) bzw. Funktion.
create policy attempts_select on public.exercise_attempts for select to authenticated
  using (student_id = public.current_student_id() or public.can_see_student(student_id));
create policy tests_select on public.test_results for select to authenticated
  using (student_id = public.current_student_id() or public.can_see_student(student_id));
create policy submissions_select on public.submissions for select to authenticated
  using (student_id = public.current_student_id() or public.can_see_student(student_id));
create policy attempts_admin_delete on public.exercise_attempts for delete to authenticated using (public.is_admin());
create policy tests_admin_delete on public.test_results for delete to authenticated using (public.is_admin());
create policy submissions_admin_delete on public.submissions for delete to authenticated using (public.is_admin());

grant select, insert, update, delete on public.exercise_attempts, public.test_results, public.submissions to authenticated;
grant all on public.exercise_attempts, public.test_results, public.submissions to service_role;

-- ------------------------------------------------------------------ Funktionen für Schüler

-- Hausaufgabe abgeben: legt die Abgabe an und setzt „Offen“ auf „Abgegeben“ – nur für eigene Hausaufgaben.
create function public.submit_homework(hw uuid, body text) returns void
language plpgsql security definer set search_path = public as $$
declare sid uuid := public.current_student_id();
begin
  if sid is null then raise exception 'nur für Schüler' using errcode = '42501'; end if;
  if not exists (select 1 from public.homework h where h.id = hw and h.student_id = sid) then
    raise exception 'keine eigene Hausaufgabe' using errcode = '42501';
  end if;
  if length(trim(body)) = 0 then raise exception 'leer' using errcode = '22023'; end if;
  insert into public.submissions (homework_id, student_id, text) values (hw, sid, left(trim(body), 5000));
  update public.homework set status = 'Abgegeben' where id = hw and status = 'Offen';
end;
$$;

-- Eigene Anwesenheit aus der Dokumentation – ohne Einblick in die Dokumentation selbst (Fehler, Probleme, andere Schüler).
create function public.my_attendance() returns table (lesson_id text, date date, present boolean)
language sql stable security definer set search_path = public as $$
  select d.lesson_id, d.date, (sid = any (d.present))
  from public.lesson_docs d, (select public.current_student_id() as sid) me
  where me.sid is not null and (me.sid = any (d.present) or me.sid = any (d.absent))
$$;

revoke execute on function public.submit_homework(uuid, text), public.my_attendance(), public.current_student_id(), public.is_student()
  from public, anon;
grant execute on function public.submit_homework(uuid, text), public.my_attendance(), public.current_student_id(), public.is_student()
  to authenticated, service_role;
