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

## Phase 7 – Handy-App, Tests und Veröffentlichung ✅

**Was geändert**
- **PWA**: Manifest „Smart Deutsch Akademie“ (eigenständiges Fenster, Farben wie legacy), Icons 192/512, maskierbares
  Icon, iPhone-Icon und App-Modus (Startbildschirm). Icons werden mit `scripts/make-icons.ts` erzeugt.
  Service Worker bewusst minimal: speichert keine Seiten oder Daten (Schülerdaten), zeigt ohne Internet nur eine
  Hinweisseite (`public/offline.html`).
- **Barrierefreiheit**: automatische Prüfung (axe, WCAG 2.1 A/AA) von 18 Seiten in hell und dunkel, auf Handy und
  Desktop. Gefundene Kontrastprobleme behoben: Gold im hellen Modus dunkler, Rot als Schriftfarbe im Dunkelmodus
  heller, Knöpfe immer in kräftigem Rot mit weißer Schrift; Fortschrittstext erbt die Farbe des Hintergrunds.
  Tastatur: „Zum Inhalt springen“ als erster Tab, Menü mit Enter/Escape, Fokus kehrt zurück.
- **Geschwindigkeit**: höchstens 102 kB JavaScript beim ersten Laden einer Seite; Unterrichtsinhalte bleiben auf
  dem Server.
- **Import aus der alten Version** (Einstellungen, nur Leitung): Export-Text einfügen, „Prüfen“ zeigt, was übernommen
  wird (mit Hinweisen zu übersprungenen Einträgen), dann „Importieren“. Pro Level eine Gruppe „Übernommen …“, weil
  die alte Version keine Gruppen kannte; Lehrkraft-Namen (freier Text) bleiben im Feld „Probleme“ erhalten.
- Anleitungen: `docs/DEPLOY.md` (GitHub, Vercel, Umgebungsvariablen, Supabase-URLs, eigene Domain) und
  `docs/BACKUP.md` (automatische und eigene Sicherung, verschlüsselt aufbewahren, Wiederherstellen).
- Neue Bibliothek: `@axe-core/playwright` (nur Tests) – automatische Barrierefreiheits-Prüfung.

**Was getestet**
- Vitest 96 Tests, neu: Import mit einem Export, den die alte Version selbst erzeugt.
- Playwright 56 Tests (je 390 px und Desktop), neu: Barrierefreiheit hell/dunkel, PWA (Manifest, Icons, Offline,
  iPhone), Login-Seite, Tastatur, Import über die Oberfläche. Die wichtigsten Abläufe (Stunde öffnen, Skript lesen,
  Stunde dokumentieren, Fortschritt prüfen) sind seit Phase 4/5 abgedeckt.
- typecheck, lint, build.

**Was offen**
- Login mit echten E-Mails ist erst mit einem Supabase-Projekt testbar (in den Tests: Testzugang).
- Lighthouse-Messung auf dem echten Server nach dem Veröffentlichen.

## Phase 8 – Lern-App für Schüler ✅

**Was geändert**
- Datenbank (`20261008090000_phase8_student_role.sql`, `20261008090100_phase8_learning.sql`): Rolle `student`,
  Verknüpfung `students.profile_id` ↔ Login, neue Tabellen `exercise_attempts`, `test_results`, `submissions`.
  **Wichtig:** `is_staff()` schließt Schüler jetzt ausdrücklich aus (vorher: jede Rolle). Schüler lesen nur eigene
  Daten; Ergebnisse von Übungen und Tests schreibt nur der Server nach der Auswertung (Service-Role), damit niemand
  Punkte fälschen kann; Hausaufgaben über die Funktion `submit_homework`; Anwesenheit über `my_attendance()` ohne
  Einblick in die Dokumentation.
- **Einladung** zur Lern-App durch Leitung oder Lehrkraft auf der Seite des Schülers (Magic Link per E-Mail).
- **Lern-App** (`/lernen`, eigener Rahmen): „Mein Weg“ A1 → A2 → B1 → B2 → Prüfung bestanden mit Prozent pro Level,
  Modul und gesamt; Module mit Lernzielen, Regeln (Kernpunkte), Beispielsätzen, Wortfeldern, Sprechthema und
  Übungen mit automatischer Prüfung; Wochen-Mini-Test pro Modul (2 Fragen pro Grammatikstunde wie legacy);
  Hausaufgaben mit Abgabe als Text, Status und Feedback; persönliche Fehlerliste mit Wiederholungsübung;
  Fertigkeiten als Balken; Deutschland-Bereich aus `content/germany`.
- Ein Schüler sieht nur sein Level und die darunter; Team-Seiten (Skripte, Notizen, Dokumentation) leiten zur Lern-App.
- **Fortschritts-Formel** als PROPOSAL (`lib/learn.ts`, dokumentiert): Anwesenheit, Übungen, Mini-Test. Gewichtung
  und Bestehensgrenze sind OFFENE ENTSCHEIDUNG und in den Einstellungen der Leitung einstellbar (Standard: gleiche
  Gewichte, keine Bestehensgrenze).
- Team sieht in der Lern-App-Karte des Schülers Mini-Tests, gelöste Übungen und Abgaben; Abgaben auch bei den Hausaufgaben.
- Keine neuen Inhalte erfunden: B1/B2 haben noch keine Übungen, Wortlisten fehlen noch – die App sagt das
  (siehe `docs/CONTENT-STATUS.md`).

**Was getestet**
- Vitest 112 Tests, neu: 8 Zugriffsregel-Tests für Schüler (nur eigene Daten, keine Team-Inhalte, nichts selbst
  schreibbar, Abgabe nur eigener Hausaufgaben, Anwesenheit ohne Dokumentation, Team sieht nur eigene Gruppen) mit
  Gegenprobe; Übungen, Mini-Test identisch mit legacy, Antwortprüfung, Fortschritts-Formel.
- Playwright: Einladung → Mein Weg → Übung falsch/richtig → Mini-Test 8/8 → Hausaufgabe abgeben → Fehler wiederholen
  → Team-Seiten gesperrt, B1 gesperrt → Team sieht Ergebnis und Abgabe; Barrierefreiheit der Lern-App hell/dunkel.

## Phase 9 – Prüfungsvorbereitung bis B2 ✅

**Was geändert**
- Datenbank (`20261008120000_phase9_exams.sql`): `model_test_results` (Punkte pro Prüfungsteil Lesen, Hören,
  Schreiben, Sprechen) und `exam_registrations` (Anbieter, Datum, Ort, Ergebnis offen/bestanden/nicht bestanden,
  Notiz). Team trägt für sichtbare Schüler ein, Löschen nur Leitung, Schüler lesen nur eigene.
- **Termine, Gebühren und Formate werden nicht eingetragen oder vorgegeben** – überall der Hinweis „beim
  Prüfungsanbieter prüfen“.
- **Prüfungsbereich pro Level** (Lern-App `/lernen/pruefung`): Aufbau mit den vier Teilen, die Prüfungsstunden des
  Kurses (z. B. „Modelltest Hören“ in B2), „Bereit für die Prüfung?“, eigene Anmeldungen.
- **Eigene Modelltests** gibt es laut `docs/CONTENT-STATUS.md` noch nicht – nichts erfunden. Stattdessen trägt das
  Team nach einem Modelltest die Punkte pro Teil ein; die App wertet pro Teil aus.
- **„Bereit für die Prüfung?“**: letztes Ergebnis pro Teil, schwächster Teil, Empfehlung zum Wiederholen (Stunden des
  Levels im passenden Bereich). Keine erfundene Bestehensgrenze.
- **Ergebnis „bestanden“** setzt das Level in der Lern-App auf 100 % und schaltet das nächste Level frei. Den
  Stufenwechsel selbst (Level des Schülers) entscheidet weiterhin das Team (wie in legacy).
- **Übersicht** (`/pruefungen`, neu in der Navigation): Schüler pro Level, Anmeldungen, bestanden/nicht bestanden,
  Prüfungsstunden im Kurs. Prüfungen pro Schüler auf der Seite des Schülers.
- Gefunden und behoben: Formularfelder mit Umlaut im Namen (`score-Hören`) kamen beim Absenden nicht an – jetzt
  ASCII-Namen; ein Test prüft alle Feldnamen der App.

**Was getestet**
- Vitest 121 Tests, neu: Zugriffsregeln Prüfungen (inkl. Punkte ≤ Maximum), „Bereit?“-Auswertung, Freischaltung,
  Prüfungsstunden, ASCII-Feldnamen.
- Playwright: Modelltest eintragen (mit Fehlerprüfung) → schwächster Teil → Anmeldung „bestanden“ → Übersicht →
  Schüler: Level 100 %, nächstes Level offen, Prüfungsbereich mit Hinweis.

## Probelauf mit echtem Supabase ✅ (2026-10-07)

Die nächsten Schritte (Supabase einrichten, App starten, Daten importieren, Entscheidungen) als Probe durchgespielt:
lokales Supabase (Postgres 15, Auth, REST, Mailpit) per `supabase start`, alle 6 Migrationen, erste Leitung genau wie in
`docs/SUPABASE.md`, Produktions-Build der App ohne Testzugang. Automatisiert in `e2e-supabase/` (10 Schritte, siehe README).

**Ergebnis:** alle 10 Schritte bestanden – Einladungen und Magic Link, keine offene Registrierung, Import, Gruppe
mit Team, Lehrkraft sieht nur ihre Gruppe, Dokumentation, Entscheidung nur durch die Leitung, Schüler-Einladung,
Lern-App mit Mini-Test und Abgabe, Team sieht Ergebnis, Abgabe und Anwesenheit.

**Dabei gefunden und behoben:**
- Handy: Das Menü lag in der Ebene der Kopfzeile; die untere Leiste verdeckte „Abmelden“ und die letzten Einträge.
  Jetzt per Portal über allem; neuer Test prüft, dass die Knöpfe antippbar sind (schlägt ohne Fix fehl).
- `supabase/config.toml`: `[auth.email] enable_signup = false` schaltete den E-Mail-Anbieter ganz ab – kein Magic
  Link möglich. Jetzt `true`; offene Registrierung bleibt über `[auth] enable_signup = false` aus. Hinweis in
  `docs/SUPABASE.md` ergänzt.
- Login-Seite: Dieser Einrichtungsfehler wurde verschluckt (neutrale Meldung, aber keine E-Mail). Jetzt klare Meldung.
- Lokal: E-Mail-Limit für Tests erhöht (`[auth.rate_limit] email_sent`).

## Alle Phasen abgeschlossen
Siehe `docs/ABSCHLUSSBERICHT.md`. Inhalte, die laut `docs/CONTENT-STATUS.md` noch fehlen (B1/B2-Skripte und Übungen,
Wortlisten, Regel-Zusammenfassungen, Modelltests, Hörtexte), werden im gleichen Format ergänzt und vor der Freigabe
geprüft (Status `entwurf` → `geprüft`).
