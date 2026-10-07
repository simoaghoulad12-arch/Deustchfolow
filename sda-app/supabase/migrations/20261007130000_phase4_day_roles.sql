-- Phase 4: Rollen pro Wochentag (PROPOSAL aus legacy/index.html), von der Leitung änderbar.
-- H = Hauptlehrkraft, A = Assistenz, Z = Zuhören und Fehler notieren.
insert into public.app_settings (key, value) values (
  'day_roles',
  '{"Mo":{"L1":"H","L2":"A"},"Di":{"L1":"A","L2":"H"},"Mi":{"L1":"H","L2":"A"},"Do":{"L1":"A","L2":"H"},"Fr":{"L1":"A","L2":"Z"},"Sa":{"L1":"Z","L2":"A"},"So":{"L1":"H","L2":"A"}}'
) on conflict (key) do nothing;
