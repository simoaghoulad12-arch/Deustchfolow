-- Phase 9: Prüfungsvorbereitung bis B2.
-- Termine, Gebühren und Prüfungsformate werden NICHT gespeichert oder vorgegeben (beim Anbieter prüfen).

create type public.exam_part as enum ('Lesen', 'Hören', 'Schreiben', 'Sprechen');
create type public.exam_result as enum ('offen', 'bestanden', 'nicht bestanden');

-- Ergebnis eines Modelltests pro Prüfungsteil (vom Team eingetragen, z. B. nach einem Modelltest in der Stunde)
create table public.model_test_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  level public.level_key not null,
  date date not null default current_date,
  part public.exam_part not null,
  score numeric(6, 1) not null check (score >= 0),
  max_score numeric(6, 1) not null check (max_score > 0 and score <= max_score),
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

-- Prüfungsanmeldung: Anbieter, Datum, Ort, Ergebnis (frei eingetragen)
create table public.exam_registrations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  level public.level_key not null,
  provider text not null default '',
  exam_date date,
  place text not null default '',
  result public.exam_result not null default 'offen',
  notes text not null default '',
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index model_test_results_student_idx on public.model_test_results (student_id);
create index exam_registrations_student_idx on public.exam_registrations (student_id);

alter table public.model_test_results enable row level security;
alter table public.exam_registrations enable row level security;

-- Team: wie bei Fehlern und Hausaufgaben über die Sichtbarkeit des Schülers; Löschen nur Leitung. Schüler: nur lesen, nur eigene.
create policy model_tests_select on public.model_test_results for select to authenticated
  using (public.can_see_student(student_id) or student_id = public.current_student_id());
create policy model_tests_insert on public.model_test_results for insert to authenticated with check (public.can_see_student(student_id));
create policy model_tests_update on public.model_test_results for update to authenticated
  using (public.can_see_student(student_id)) with check (public.can_see_student(student_id));
create policy model_tests_admin_delete on public.model_test_results for delete to authenticated using (public.is_admin());

create policy exams_select on public.exam_registrations for select to authenticated
  using (public.can_see_student(student_id) or student_id = public.current_student_id());
create policy exams_insert on public.exam_registrations for insert to authenticated with check (public.can_see_student(student_id));
create policy exams_update on public.exam_registrations for update to authenticated
  using (public.can_see_student(student_id)) with check (public.can_see_student(student_id));
create policy exams_admin_delete on public.exam_registrations for delete to authenticated using (public.is_admin());

grant select, insert, update, delete on public.model_test_results, public.exam_registrations to authenticated;
grant all on public.model_test_results, public.exam_registrations to service_role;
