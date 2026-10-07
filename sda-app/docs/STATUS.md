# Status

Stand: 2026-10-07

## Phase 1 – Projekt aufsetzen und Inhalte sichern ✅

**Was geändert**
- Next.js 14 (App Router), TypeScript strict, Tailwind CSS, Vitest in `sda-app/`.
  Das Projekt ist Teil des pnpm-Workspaces im Repository (`pnpm-workspace.yaml`), CI führt lint, typecheck, test und build mit aus.
  Gleiche Versionen wie `apps/web` (Next 14.2.35, React 18, Tailwind 3), damit keine doppelten Abhängigkeiten entstehen.
- Neue Bibliotheken mit Begründung:
  - `vitest` – Tests (in CLAUDE.md vorgesehen).
  - `tsx` – führt das TypeScript-Skript `scripts/extract-content.ts` ohne eigenen Build-Schritt aus.
- `scripts/extract-content.ts` (Aufruf: `pnpm --filter @sda/app extract`) führt `legacy/index.html` in einer
  abgeschotteten Node-VM aus (nur lesen) und schreibt alle Inhalte nach `content/`. Warum VM statt Text-Parsing:
  Die Checklisten werden in legacy von Funktionen erzeugt, und die Kennzeichnungen stehen im Seiten-Code.
- `content/types.ts` (Typen) und `content/index.ts` (typisierter Zugriff).
- Startseite zeigt die übernommenen Inhalte (Platzhalter bis Phase 3).

**Inhalte in `content/`**

| Datei | Quelle in legacy | Inhalt |
|---|---|---|
| `curriculum.json` | `LV` | 4 Level, 36 Module, 144 Grammatik-Themen, 36 Sprechthemen |
| `objectives.json` | `LO` | Lernziele für alle 36 Module |
| `scripts.json` | `SC` | 64 Vorlese-Skripte (A1, A2) mit Darija-Hinweis, 256 Übungen mit Lösung, Hausaufgabe |
| `speaking.json` | `SPK` | 16 Sprechdialoge mit Fragekarten |
| `probe.json` | `PROBE` | Probestunden-Skript (6 Abschnitte) |
| `platforms.json`, `standards.json`, `activities.json` | `PLAT`, `STDS`, `ACT` | Online-Leitfaden, 18 Aktivitäten |
| `templates.json` | `TPL` | 7 WhatsApp-Vorlagen |
| `emergency.json` | `FALL` | Notfallplan (10 Fälle) |
| `germany.json` | `DEGROUPS` | Germany Preparation (9 Themen, Verweise auf Stunden) |
| `lessons/A1.json` … `B2.json` | `getStart`, `getLesson` (`grammarGroups`, `speakGroups`, `testGroups`, `startGroups`) | 256 Stunden mit Checklisten: 4 Level-Starts, 144 Grammatik, 72 Sprechen, 36 Mini-Tests |
| `checklists.json` | `probeLessons`, `setupLesson`/`setupGroups`, `onbLesson`, `openLesson` | Generalprobe, Probestunde, Einrichtung, Onboarding, Offene Entscheidungen |
| `decisions.json` | `openLesson` | 21 offene Entscheidungen (Grundlage für die Tabelle `decisions` in Phase 2) |
| `lessonSystem.json` | `pageLsys` (`S9`) | Die 9 Schritte mit Minuten und Kennzeichnung |
| `statements.json` | `sb(...)` in den Seiten | 104 gekennzeichnete Aussagen (EXISTING 58, IMPROVEMENT 17, PROPOSAL 17, OFFENE ENTSCHEIDUNG 12) |
| `pages.json` | alle Seiten (V2) | Vollständiger Seitentext als Referenz, Kennzeichnungen als `[LABEL]` |
| `meta.json` | `ROLE`, `PH`, `DAYN`/`DAYA`, `NAV` | Rollen, Phasen, Wochentage, Navigation (DE + Darija) |

Checklisten-IDs sind identisch mit legacy (z. B. `A1.1.Mo#3`), damit Fortschritt aus der alten Version übernommen werden kann (Phase 7).

**Was getestet** (`pnpm --filter @sda/app test`, 22 Tests grün)
- 4 Level, 36 Module, 144 Grammatikstunden, 72 Sprechstunden, 64 vollständige Skripte, 256 Übungen, 16 Sprechdialoge,
  18 Aktivitäten, 7 Vorlagen, 21 offene Entscheidungen, Lernziele für jedes Modul, 9 Lesson-System-Schritte.
- Alle Checklisten-IDs eindeutig; Germany Preparation und Skripte verweisen nur auf bestehende Stunden.
- Alle vier Kennzeichnungen vorhanden; jede Kennzeichnung im Seitentext ist als Aussage erfasst.
- `content/` ist identisch mit einer frischen Extraktion aus `legacy/index.html` (nichts verloren, nichts von Hand verändert).
- `legacy/index.html` ist unverändert (SHA-256).
- typecheck, lint und build laufen durch.

**Was offen / Hinweise**
- Die Kennzeichnungen stehen in legacy fast nur im Seiten-Code, nicht bei den Daten. Sie sind in `statements.json`
  (pro Aussage) und `pages.json` (pro Seite) erhalten. Beim Bau der Seiten (Phase 3–6) von dort übernehmen.
- In legacy steht ein Preis im Probestunden-Skript und im Academy Standard (1000 DH/Monat, gekennzeichnet als EXISTING).
  Er wurde unverändert übernommen, nicht erfunden.
- B1/B2: keine Skripte, Übungen und Sprechdialoge in legacy (siehe `docs/CONTENT-STATUS.md`).
- Technik-Entscheidung (Supabase, Vercel) wird in Phase 2 bestätigt.

## Phase 2 – Datenbank, Login und Rollen ✅ (Code fertig, Supabase-Projekt noch anzulegen)

**Was geändert**
- `supabase/migrations/20261007120000_phase2_schema.sql`: Tabellen profiles, app_settings, groups, group_staff,
  students, lesson_docs, errors, homework, material_notes, checklist_progress, decisions – jede mit Row Level Security.
  - `group_staff` (zusätzlich zur Liste im Bauplan) ordnet Team-Mitglieder Gruppen zu. Ohne sie lässt sich
    „nur eigene Gruppen“ nicht abbilden.
  - `app_settings.staff_group_visibility`: OFFENE ENTSCHEIDUNG, ob das Team alle oder nur eigene Gruppen sieht.
    Standard `own_groups`, umschaltbar durch admin.
  - Wer Schülerdaten ändern darf, ist noch offen (Entscheidung dec#16). Vorläufig: Team liest und bearbeitet
    Schülerdaten der sichtbaren Gruppen, löschen und anlegen von Schülern nur admin.
  - Rolle `student` kommt erst in Phase 8 dazu.
- `supabase/migrations/20261007120100_seed_decisions.sql`: die 21 offenen Entscheidungen aus legacy
  (erzeugt aus `content/decisions.json` mit `pnpm --filter @sda/app gen:decisions`).
- Anmeldung per **Magic Link** (E-Mail, ohne Passwort). Begründung: Das Team muss sich kein Passwort merken,
  es gibt keine Passwörter, die geteilt oder vergessen werden; Zugang hängt allein an der E-Mail-Adresse.
  `shouldCreateUser: false` und `enable_signup = false`: nur eingeladene Personen kommen hinein. Die Login-Seite
  verrät nicht, ob eine Adresse eingeladen ist.
- Admin-Seite **Team und Zugänge** (`/admin/team`): Personen einladen (Name, E-Mail, Rolle), Rollen ändern
  (nicht die eigene), Sichtbarkeit der Gruppen umschalten.
- Middleware schickt nicht angemeldete Personen zum Login; angemeldet ohne Profil = kein Zugang.
- `.env.example`, `supabase/config.toml`, E-Mail-Vorlagen, Anleitung `docs/SUPABASE.md`.
- Neue Bibliotheken mit Begründung:
  - `@supabase/supabase-js`, `@supabase/ssr` – offizielle Supabase-Clients, Sitzung per Cookie im App Router.
  - `server-only` – verhindert, dass der Service-Role-Schlüssel je in den Browser-Code gelangt.
  - `@electric-sql/pglite` (nur Tests) – echtes Postgres im Testprozess, damit die Zugriffsregeln auch in der CI
    (ohne Datenbank-Dienst) gegen die echten Migrationen getestet werden.

**Was getestet** (41 Tests grün, dazu typecheck, lint, build)
- 17 Tests für die Zugriffsregeln gegen die echten Migrationen: anonym und ohne Einladung kein Zugriff;
  admin sieht alles und vergibt Rollen; Lehrkraft und Muttersprachler/in sehen bei Standard-Einstellung keine
  fremden Gruppen, Schüler, Fehler, Hausaufgaben oder Dokumentationen und können dort nichts anlegen;
  eigene Gruppe bearbeiten geht; keine Löschrechte, keine Rollen- oder Einstellungsänderung; mit Einstellung
  „alle Gruppen“ sieht das Team alles; Häkchen nur eigene; 21 Entscheidungen angelegt, nur admin entscheidet.
- Gegenprobe: Eine absichtlich geöffnete Regel lässt 3 Tests fehlschlagen.
- Prüfung des Einladungsformulars.
- App gestartet: ohne Supabase-Konfiguration leiten `/` und `/admin/team` zum Login, der einen Hinweis zeigt.

**Was offen**
- Supabase-Projekt anlegen und Zugangsdaten setzen (Anleitung `docs/SUPABASE.md`), erste Leitung anlegen.
- Der Ablauf mit echten E-Mails (Einladung, Magic Link) ist erst mit einem Supabase-Projekt testbar.
- Datenbank-Typen mit `supabase gen types` erzeugen, sobald das Projekt existiert.

## Phase 3 – App-Rahmen, Design und Sprachen ✅

**Was geändert**
- App-Rahmen wie legacy: Kopfzeile mit Suche, Seitenleiste auf dem Desktop (ab 1024 px), Menü und untere Leiste
  (Dashboard, Heute, Curriculum, Doku) auf dem Handy. „Zum Inhalt springen“, Menü schließt mit Escape.
- Navigation mit allen 18 Seiten in den Gruppen aus legacy (Übersicht, Lehren, Dokumentieren & Messen, Akademie),
  Beschriftungen DE + Darija aus legacy. Arabische Gruppennamen neu ergänzt.
- Design-Tokens aus legacy (Anthrazit, Weiß, Rot, Gold sparsam), Hell/Dunkel nach Gerät oder fest in den Einstellungen.
  Abweichung: Gold im hellen Modus dunkler (#8a6d27 statt #b08d3c), weil Text in #b08d3c auf Weiß zu wenig Kontrast hat.
- Schriften wie legacy (IBM Plex Sans, IBM Plex Sans Arabic, Bricolage Grotesque), jetzt über `next/font` selbst
  ausgeliefert: die Browser schicken keine Anfragen an Google (Datenschutz).
- Sprachen: Deutsch und Arabisch/Darija mit RTL, Auswahl in den Einstellungen (Cookie). Unterrichtsinhalte bleiben
  Deutsch und links nach rechts (`.de-content`).
- Kennzeichnung: `Label`, `Statement`, `LabelLegend` (Farben wie legacy), Erklärung in den Einstellungen.
- Seiten mit Inhalt: Dashboard (Lernweg, Umfang der Inhalte), Lesson System (9 Schritte), Offene Entscheidungen
  (21, nur lesen), Einstellungen, Suche (Module, Stunden, Lernziele, Aktivitäten, Vorlagen).
  Alle anderen Seiten zeigen, in welcher Phase sie gebaut werden.
- Testzugang für Entwicklung und Playwright ohne Supabase: `SDA_DEV_MEMBER_ROLE=admin pnpm dev`.
  Wirkt nur bei `NODE_ENV=development`, in Produktions-Builds nie.
- Neue Bibliothek: `@playwright/test` (in CLAUDE.md vorgesehen). CI: neuer Job `sda-app-e2e`.

**Was getestet**
- Playwright (12 Tests, je Handy 390 px und Desktop): alle Seiten über die Navigation erreichbar, aktive Seite
  markiert, kein seitliches Scrollen; untere Leiste nur auf dem Handy, Tippflächen ≥ 44 px; Suche in der Kopfzeile;
  Arabisch schaltet auf RTL, Unterrichtsinhalt bleibt LTR; Hell/Dunkel; Kennzeichnungen sichtbar.
- Vitest 41 Tests, typecheck, lint, build.

**Was offen**
- Barrierefreiheit und Kontraste werden in Phase 7 systematisch geprüft.

## Nächste Phase
Phase 4 – Curriculum und Stunden-Ansicht (`docs/PROMPTS.md`).
