-- Phase 2: Datenbank, Rollen und Row Level Security (Supabase / Postgres)
--
-- Grundsätze (CLAUDE.md):
-- * Jede Tabelle hat RLS. Ohne Profil (= nicht eingeladen) sieht niemand etwas.
-- * admin sieht und verwaltet alles.
-- * Ob Lehrkräfte und Muttersprachler/innen alle Schüler oder nur ihre Gruppen sehen, ist eine
--   OFFENE ENTSCHEIDUNG. Umschaltbar über app_settings.staff_group_visibility, Standard: 'own_groups'.
-- * Wer Schülerdaten ändern darf, ist ebenfalls offen (decisions dec#16). Vorläufig: Team darf
--   Schülerdaten der sichtbaren Gruppen lesen und bearbeiten, Löschen nur admin.

-- ------------------------------------------------------------------ Typen

create type public.app_role as enum ('admin', 'teacher', 'native');
create type public.level_key as enum ('A1', 'A2', 'B1', 'B2');
create type public.error_category as enum
  ('Grammatik', 'Wortschatz', 'Aussprache', 'Satzbau', 'Schreiben', 'Sprechen', 'Verständnis');
create type public.error_status as enum ('offen', 'wiederholen', 'verbessert');
create type public.homework_status as enum ('Offen', 'Abgegeben', 'Korrigiert');
create type public.decision_status as enum ('offen', 'entschieden');

-- ------------------------------------------------------------------ Tabellen

-- Team-Mitglieder. Ein Profil entsteht nur durch Einladung (Admin-Seite), nie durch freie Registrierung.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role public.app_role not null,
  created_at timestamptz not null default now()
);

-- Einstellungen, die nur der Admin ändert (z. B. Sichtbarkeit der Gruppen).
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level public.level_key not null,
  start_date date,
  created_at timestamptz not null default now()
);

-- Welche Team-Mitglieder einer Gruppe zugeordnet sind (Grundlage für „nur eigene Gruppen“).
create table public.group_staff (
  group_id uuid not null references public.groups (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (group_id, profile_id)
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level public.level_key not null,
  group_id uuid references public.groups (id) on delete set null,
  start_date date,
  -- Modul-ID aus content/curriculum.json, z. B. 'A1.3'
  current_module text,
  -- Einschätzung pro Fertigkeit 1–5 (leer = noch nicht eingeschätzt)
  skill_grammar smallint check (skill_grammar between 1 and 5),
  skill_vocabulary smallint check (skill_vocabulary between 1 and 5),
  skill_speaking smallint check (skill_speaking between 1 and 5),
  skill_listening smallint check (skill_listening between 1 and 5),
  skill_reading smallint check (skill_reading between 1 and 5),
  skill_writing smallint check (skill_writing between 1 and 5),
  strengths text not null default '',
  weaknesses text not null default '',
  next_goals text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lesson_docs (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  teacher_id uuid references public.profiles (id) on delete set null,
  group_id uuid not null references public.groups (id) on delete cascade,
  -- Stunden-ID aus content/lessons, z. B. 'A1.1.Mo'
  lesson_id text not null,
  present uuid[] not null default '{}',
  absent uuid[] not null default '{}',
  covered text not null default '',
  can_do text not null default '',
  errors text not null default '',
  homework text not null default '',
  next_lesson text not null default '',
  material text not null default '',
  problems text not null default '',
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.errors (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  date date not null default current_date,
  error text not null,
  correction text not null default '',
  category public.error_category not null,
  status public.error_status not null default 'offen',
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.homework (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  task text not null,
  goal text not null default '',
  deadline date,
  status public.homework_status not null default 'Offen',
  feedback text not null default '',
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

-- „Im Lehrbuch (Seite/Lektion)“ pro Stunde
create table public.material_notes (
  lesson_id text primary key,
  note text not null default '',
  updated_by uuid references public.profiles (id) on delete set null default auth.uid(),
  updated_at timestamptz not null default now()
);

-- Abgehakte Checklisten-Aufgaben pro Person (item_id wie in content/, z. B. 'A1.1.Mo#3')
create table public.checklist_progress (
  user_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  item_id text not null,
  done_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- Offene Entscheidungen (Startinhalt aus legacy/index.html, siehe nächste Migration)
create table public.decisions (
  id text primary key,
  title text not null,
  title_ar text not null default '',
  status public.decision_status not null default 'offen',
  decision text not null default '',
  decided_at date,
  decided_by uuid references public.profiles (id) on delete set null,
  sort_order int not null default 0
);

create index students_group_id_idx on public.students (group_id);
create index lesson_docs_group_id_idx on public.lesson_docs (group_id);
create index errors_student_id_idx on public.errors (student_id);
create index homework_student_id_idx on public.homework (student_id);
create index group_staff_profile_id_idx on public.group_staff (profile_id);

-- Standard der OFFENEN ENTSCHEIDUNG: Team sieht nur eigene Gruppen.
insert into public.app_settings (key, value) values ('staff_group_visibility', '"own_groups"');

-- ------------------------------------------------------------------ Hilfsfunktionen für RLS
-- security definer, damit die Prüfungen selbst nicht an RLS scheitern; search_path fest gegen Missbrauch.

create function public.current_app_role() returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_app_role() = 'admin', false)
$$;

create function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select public.current_app_role() is not null
$$;

create function public.staff_sees_all_groups() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select value = '"all"'::jsonb from public.app_settings where key = 'staff_group_visibility'), false)
$$;

create function public.can_see_group(gid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin()
    or (public.is_staff() and (
      public.staff_sees_all_groups()
      or exists (select 1 from public.group_staff gs where gs.group_id = gid and gs.profile_id = auth.uid())
    ))
$$;

-- Schüler ohne Gruppe sieht das Team nur im Modus 'all' (oder admin).
create function public.can_see_student(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin()
    or (public.is_staff() and (
      public.staff_sees_all_groups()
      or exists (
        select 1 from public.students s
        join public.group_staff gs on gs.group_id = s.group_id
        where s.id = sid and gs.profile_id = auth.uid()
      )
    ))
$$;

revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated, service_role;

-- ------------------------------------------------------------------ Row Level Security

alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.groups enable row level security;
alter table public.group_staff enable row level security;
alter table public.students enable row level security;
alter table public.lesson_docs enable row level security;
alter table public.errors enable row level security;
alter table public.homework enable row level security;
alter table public.material_notes enable row level security;
alter table public.checklist_progress enable row level security;
alter table public.decisions enable row level security;

-- profiles: Team sieht das Team (Namen für Dokumentation); Rollen ändert nur admin.
create policy profiles_select on public.profiles for select to authenticated using (public.is_staff());
create policy profiles_admin_write on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- app_settings
create policy settings_select on public.app_settings for select to authenticated using (public.is_staff());
create policy settings_admin_write on public.app_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- groups / group_staff: sichtbar nach Einstellung, verwalten nur admin.
create policy groups_select on public.groups for select to authenticated using (public.can_see_group(id));
create policy groups_admin_write on public.groups for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy group_staff_select on public.group_staff for select to authenticated
  using (public.is_admin() or profile_id = auth.uid() or public.can_see_group(group_id));
create policy group_staff_admin_write on public.group_staff for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- students: lesen und bearbeiten in sichtbaren Gruppen; anlegen/löschen nur admin.
create policy students_select on public.students for select to authenticated using (public.can_see_student(id));
create policy students_update on public.students for update to authenticated
  using (public.can_see_student(id))
  with check (public.is_admin() or (group_id is not null and public.can_see_group(group_id)));
create policy students_admin_insert on public.students for insert to authenticated with check (public.is_admin());
create policy students_admin_delete on public.students for delete to authenticated using (public.is_admin());

-- lesson_docs: Team dokumentiert für sichtbare Gruppen; ändern nur eigene, löschen nur admin.
create policy lesson_docs_select on public.lesson_docs for select to authenticated using (public.can_see_group(group_id));
create policy lesson_docs_insert on public.lesson_docs for insert to authenticated
  with check (public.can_see_group(group_id) and (public.is_admin() or created_by = auth.uid()));
create policy lesson_docs_update on public.lesson_docs for update to authenticated
  using (public.is_admin() or (created_by = auth.uid() and public.can_see_group(group_id)))
  with check (public.is_admin() or (created_by = auth.uid() and public.can_see_group(group_id)));
create policy lesson_docs_admin_delete on public.lesson_docs for delete to authenticated using (public.is_admin());

-- errors / homework: über den Schüler sichtbar.
create policy errors_select on public.errors for select to authenticated using (public.can_see_student(student_id));
create policy errors_insert on public.errors for insert to authenticated with check (public.can_see_student(student_id));
create policy errors_update on public.errors for update to authenticated
  using (public.can_see_student(student_id)) with check (public.can_see_student(student_id));
create policy errors_admin_delete on public.errors for delete to authenticated using (public.is_admin());

create policy homework_select on public.homework for select to authenticated using (public.can_see_student(student_id));
create policy homework_insert on public.homework for insert to authenticated with check (public.can_see_student(student_id));
create policy homework_update on public.homework for update to authenticated
  using (public.can_see_student(student_id)) with check (public.can_see_student(student_id));
create policy homework_admin_delete on public.homework for delete to authenticated using (public.is_admin());

-- material_notes: keine Schülerdaten, ganzes Team.
create policy material_notes_select on public.material_notes for select to authenticated using (public.is_staff());
create policy material_notes_write on public.material_notes for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- checklist_progress: jede Person nur die eigenen Häkchen; admin liest alle.
create policy checklist_select on public.checklist_progress for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy checklist_write on public.checklist_progress for all to authenticated
  using (user_id = auth.uid() and public.is_staff()) with check (user_id = auth.uid() and public.is_staff());

-- decisions: Team liest, nur admin entscheidet.
create policy decisions_select on public.decisions for select to authenticated using (public.is_staff());
create policy decisions_admin_write on public.decisions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------------ Rechte
-- Anonyme Nutzer bekommen nichts. Angemeldete nur über RLS.
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
