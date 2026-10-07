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

## Phase 4 – Curriculum und Stunden-Ansicht ✅

**Was geändert**
- Extraktion erweitert: Vorlese-Skripte für alle 252 Stunden + Probestunde (`content/readouts/`) direkt aus dem
  Original-Code (grammarScript, speakScript, testScript, probeScript), als Abschnitte mit Minuten, Vorlesetext,
  Darija-Hinweis, Übungen mit Lösung und Tafelbild. Bereiche pro Stunde (legacy: areasOf) in `lessons/*.json`.
- **Curriculum** (`/curriculum`): Level A1–B2, Fortschritt pro Level und Modul, Lernziele pro Modul
  („Am Ende dieser Einheit kann der Schüler …“), Filter nach Bereich (Grammatik, Sprechen, Schreiben, Hören, Lesen,
  Deutschland, Bewerbung) und Status (Offen, In Arbeit, Abgeschlossen), Kennzeichnung wie legacy.
- **Lernziele** (`/lernziele`): pro Modul Lernziele, Grammatik, Wortschatz, Kommunikation, Praxis.
- **Stunden-Ansicht** (`/stunde/[id]`): drei Modi wie legacy – Skript (Vorlesen, Darija-Hinweis, Lösungen zum
  Aufklappen), Schritte (eine Aufgabe nach der anderen, „Danach“-Vorschau, „Stunde abgeschlossen“ mit nächster
  Stunde) und Liste. Stunden-Timer zeigt, was laut Minute dran ist, und markiert es in der Liste.
- **Rollen pro Wochentag** (PROPOSAL): Lehrkraft 1 Haupt Mo und Mi, Lehrkraft 2 Di und Do, Sprechstunden Fr und Sa.
  Gespeichert in `app_settings.day_roles` (Migration `20261007130000_phase4_day_roles.sql`), von der Leitung in den
  Einstellungen änderbar. Jede Person wählt in den Einstellungen „Meine Rolle im Team-Plan“ (pro Gerät, wie legacy)
  und sieht nur ihre Aufgaben.
- **Checklisten-Fortschritt** pro Person in `checklist_progress`; Stunde zurücksetzen.
- **„Im Lehrbuch (Seite / Lektion)“** pro Stunde in `material_notes`, für das ganze Team.
- Lesson System (9 Schritte mit Minuten) war bereits in Phase 3 fertig.

**Was getestet**
- Vitest 52 Tests, u. a.: Rollenplan und sichtbare Aufgaben je Person entsprechen genau legacy (dayRole, steps);
  Skript-Text identisch mit dem HTML aus legacy; jede Stunde hat ein Skript; A1/A2-Skripte enthalten die 4 Übungen.
- Playwright 26 Tests (je Handy 390 px und Desktop), neu: Curriculum mit Level und Filtern, Lernziele, Skript mit
  Lösungen, Schritte und Liste speichern Häkchen (auch nach Neuladen), Timer, Lehrbuch-Feld, Rollen pro Wochentag
  inkl. Änderung durch die Leitung; kein seitliches Scrollen.
- typecheck, lint, build.

**Was offen**
- Speichern in Supabase (Häkchen, Notizen, Rollenplan) ist erst mit einem Supabase-Projekt testbar; die
  Zugriffsregeln dafür sind bereits getestet (Phase 2).
- „Meine Rolle im Team-Plan“ gilt pro Gerät. Ob die Leitung das fest pro Person zuordnen soll, kann später entschieden werden.

## Phase 5 – Lehren, Dokumentieren, Messen ✅

**Was geändert**
- Datenzugriff: `lib/data/repo.ts` (Supabase mit RLS; nur mit Testzugang in der Entwicklung im Arbeitsspeicher,
  inkl. „on delete cascade“ wie in der Datenbank), Zeilentypen in `lib/data/types.ts`, Prüfung aller Formulare in
  `lib/validation.ts`, Logik in `lib/school.ts`.
- **Gruppen** (`/fortschritt/gruppen`, nur Leitung): anlegen, bearbeiten, löschen mit Bestätigung, Startdatum,
  Team der Gruppe (Grundlage für „nur eigene Gruppen“).
- **Schüler** (`/fortschritt`): anlegen und löschen (Leitung), bearbeiten (Team), Fertigkeiten 1–5, Stärken,
  Schwächen, nächste Lernziele.
- **Teacher Playbook „Heute“** (`/playbook`): pro Gruppe die Stunde laut Startdatum (legacy: lessonAt), sonst die
  nächste offene Stunde; Schüler, zuletzt gemacht, offene Hausaufgaben, Probleme und offene Fehler, Lernziel heute,
  gekennzeichnete Regeln „Während der Stunde“.
- **Stunde dokumentieren** (`/dokumentation/neu`, Button in jeder Stunde und im Playbook): vorausgefüllt aus dem
  Skript (legacy: docPrefill), Anwesenheit per Häkchen (nicht angehakt = abwesend), Option „Hausaufgabe für alle
  Anwesenden anlegen“, Material wird als Lehrbuch-Notiz der Stunde übernommen. Liste und Bearbeiten.
- **Student Progress**: Anwesenheit aus der Dokumentation, Hausaufgaben-Status, offene Fehler, Fertigkeiten als
  Balken, letzte und nächste Stunde.
- **Error Tracking** (`/fehler`): Kategorien und Status wie im Bauplan, Filter, Status direkt in der Liste änderbar.
- **Hausaufgaben** (`/hausaufgaben`): Ziel, Deadline, Status, Feedback; auch für alle Schüler einer Gruppe.
- **Dashboard**: Lernweg A1 → A2 → B1 → B2 → Deutschland mit Fortschritt, Kennzahlen aus den Daten.
- Barrierefreiheit: Formularbeschriftungen über for/id statt Verschachtelung (sonst liest ein Screenreader alle
  Optionen einer Auswahlliste mit vor); Formulare zeigen Fehlermeldungen als Hinweis.
- „Heute“ wird in der Zeitzone Europe/Berlin bestimmt (nur kurz vor Mitternacht relevant; die Uhrzeiten der
  Stunden sind eine OFFENE ENTSCHEIDUNG).

**Was getestet**
- Vitest 74 Tests, neu: Stunde von heute (lessonAt) und Vorausfüllung der Dokumentation identisch mit legacy,
  Anwesenheit, Hausaufgaben-Kennzahlen, alle Formularprüfungen.
- Playwright 32 Tests (je Handy 390 px und Desktop), neu: kompletter Ablauf Gruppe → Schüler → Playbook mit der
  Stunde von heute → Stunde dokumentieren (vorausgefüllt, Abwesenheit, Hausaufgabe für Anwesende) → Hausaufgabe
  und Fehler bearbeiten und filtern → Fortschritt (Anwesenheit 100 % / 0 %, Fertigkeiten) → Schüler löschen;
  Dokumentieren aus der Stunden-Ansicht; Dashboard.
- typecheck, lint, build.

**Was offen**
- Speichern in Supabase erst mit einem Supabase-Projekt testbar (Zugriffsregeln sind getestet).
- Wer Schülerdaten ändern darf, bleibt OFFENE ENTSCHEIDUNG (vorläufige Regel siehe Phase 2).

## Phase 6 – Qualität, Deutschland, Material, Suche ✅

**Was geändert**
- **Quality Control** (`/qualitaet`): Kennzahlen (Schüler, Ø Anwesenheit, Hausaufgaben erledigt, Fehler offen /
  verbessert, Dokumentationen, davon letzte 7 Tage) und Listen (niedrigste Anwesenheit, meiste offene Fehler, am
  längsten ohne Dokumentation). Warnschwellen sind eine OFFENE ENTSCHEIDUNG: ohne Festlegung keine Warnungen; nur
  die Leitung kann sie setzen (`app_settings.qc_thresholds`). Bestehende Kontrollpunkte mit Kennzeichnung.
- **Academy Standard, Germany Preparation, Materialien, Onboarding**: Regeln und Hinweise direkt aus den
  gekennzeichneten Aussagen der bestehenden Version (`StatementSections`); Germany Preparation mit Links auf die
  Stunden; Materialien mit der Tabelle aller Lehrbuch-Einträge; Onboarding mit Checkliste zum Abhaken.
- **Betrieb & Plattformen**: Abläufe (Einrichtung, Generalprobe, Probestunde mit Vorlese-Skript),
  Online-Profi-Leitfaden (Plattformen, Standards, 18 Aktivitäten mit Niveau-Filter, Wochenroutine des Teams),
  WhatsApp-Vorlagen mit Kopier-Button, Notfallplan, Zeitunterschied, bisheriger Sheets-Plan.
- Extraktion ergänzt: Online-Profi-Leitfaden als Seitentext und die Wochenroutine (`weeklyRoutine.json`) – sie
  hatte in legacy keine eigene Daten-Variable. Ein Test prüft, dass alle fest im Seiten-Code stehenden Texte
  wörtlich aus legacy stammen.
- **Offene Entscheidungen** aus der Tabelle `decisions`: die Leitung trägt Entscheidung, Status und Datum ein;
  „entschieden“ braucht einen Text. Dashboard zählt die noch offenen.
- **Suche** über Stunden, Module, Lernziele, Aktivitäten, Vorlagen, Schüler und Dokumentationen, mit Filter nach
  Level und Bereich; Groß/klein und Akzente egal.
- Formularfelder haben eindeutige IDs (mehrere gleiche Formulare auf einer Seite).

**Was getestet**
- Vitest 91 Tests, neu: Suche (Filter, Schüler, Dokumentationen), Kennzahlen und Warnschwellen, feste Texte aus legacy.
- Playwright 44 Tests (je 390 px und Desktop), neu: Standard, Deutschland, Materialien, Onboarding, Betrieb inkl.
  Kopieren einer Vorlage, Probestunde, Entscheidung eintragen und zurücksetzen, Warnschwellen, Suche mit Filtern.
- typecheck, lint, build.

## Nächste Phase
Phase 7 – Handy-App, Tests und Veröffentlichung (`docs/PROMPTS.md`).
