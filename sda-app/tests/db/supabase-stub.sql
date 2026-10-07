-- Nur für Tests: bildet die Teile von Supabase nach, die unsere Migrationen brauchen
-- (Rollen anon/authenticated/service_role, auth.users, auth.uid()).
-- In Supabase existiert all das bereits; diese Datei wird dort nie ausgeführt.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;
grant usage on schema auth to anon, authenticated, service_role;
create table auth.users (
  id uuid primary key,
  email text unique,
  raw_app_meta_data jsonb not null default '{}'
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema public to anon, authenticated, service_role;
