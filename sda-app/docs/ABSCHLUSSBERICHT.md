# Abschlussbericht – Smart Deutsch Akademie App

Stand: nach Phase 7 (Team-App fertig). Phasen 8 und 9 (Lern-App, Prüfungen) siehe `docs/STATUS.md`.

## 1. Analyse der bestehenden Version
`legacy/index.html` (V2) war eine einzelne HTML-Datei mit allen Inhalten und Logik im Browser:
- Inhalte als gepackte Texte (`LV`, `SC`, `SPK`, `PROBE`, `LO`, `PLAT`, `STDS`, `ACT`, `TPL`, `FALL`, `DEGROUPS`).
- Checklisten, Vorlese-Skripte, Lernziele und „heutige Stunde“ wurden zur Laufzeit von Funktionen erzeugt.
- Kennzeichnungen (EXISTING, IMPROVEMENT, PROPOSAL, OFFENE ENTSCHEIDUNG) standen im Seiten-Code, nicht bei den Daten.
- Daten (Schüler, Dokumentation …) lagen im Browser eines Geräts; Teilen nur über Export/Import von Text.

## 2. Verbesserungen
- **Ein gemeinsames System** statt Daten pro Gerät: Supabase mit Anmeldung nur auf Einladung und Zugriffsregeln
  (Row Level Security) für jede Tabelle.
- **Gruppen** mit Startdatum und Team: das Playbook zeigt pro Gruppe die Stunde von heute.
- **Stunde dokumentieren in 2 Minuten**: vorausgefüllt aus dem Skript, Anwesenheit per Häkchen, Hausaufgabe für
  alle Anwesenden auf einen Klick.
- **Offene Entscheidungen** werden in der App entschieden und mit Datum gespeichert.
- **Warnschwellen** der Qualitätskontrolle nur, wenn die Leitung sie festlegt.
- **Suche** über Inhalte, Schüler und Dokumentation mit Filtern.
- **Barrierefreiheit**: geprüft nach WCAG 2.1 AA, Kontraste verbessert, Tastatur, Screenreader-taugliche Formulare.
- **Datenschutz**: Schriften selbst ausgeliefert (keine Anfragen an Google), Service Worker ohne Datenspeicherung,
  keine Schülerdaten in URLs außer zufälligen IDs, Service-Role-Schlüssel nur auf dem Server.
- **Speicherstatus sichtbar** („Wird gespeichert …“ / „Gespeichert“) beim Abhaken.

## 3. Struktur
```
sda-app/
  legacy/            unverändert (Prüfsumme im Test)
  content/           Inhalte als JSON, erzeugt aus legacy (pnpm extract) + Typen
  scripts/           Extraktion, Migration der Entscheidungen, Icons
  supabase/          Migrationen (Schema + RLS), E-Mail-Vorlagen, config.toml
  app/(app)/         alle Seiten im App-Rahmen
  components/        Rahmen, Stunden-Ansicht, Formulare, Kennzeichnung
  lib/               Logik (Rollenplan, Fortschritt, Schule, Suche, Qualität, Import, Datenzugriff)
  tests/             Vitest (Logik, Zugriffsregeln gegen echtes Postgres, Vergleich mit legacy)
  e2e/               Playwright (390 px und Desktop)
  docs/              STATUS, SUPABASE, DEPLOY, BACKUP, dieser Bericht
```

## 4. Erhaltene Inhalte (alle aus legacy, geprüft durch Tests)
4 Level, 36 Module, 144 Grammatikstunden, 72 Sprechstunden, 36 Mini-Tests, 4 Level-Starts (256 Stunden mit
Checklisten), 252 Vorlese-Skripte + Probestunde, 64 vollständige Skripte A1/A2 mit 256 Übungen und Lösungen,
16 Sprechdialoge, Lernziele für alle 36 Module, Lesson System (9 Schritte), 9 Plattformen, 6 Standards,
18 Aktivitäten, 7 WhatsApp-Vorlagen, 10 Notfälle, Germany Preparation (9 Themen), Wochenroutine, Generalprobe,
Probestunde, Einrichtung, Onboarding, 21 offene Entscheidungen, 104 gekennzeichnete Aussagen und der Text jeder Seite.
Ein Test vergleicht `content/` bei jedem Lauf mit einer frischen Extraktion aus `legacy/index.html`.

## 5. Vorschläge (PROPOSAL)
- Rollen pro Wochentag (aus legacy) – in den Einstellungen änderbar.
- „Meine Rolle im Team-Plan“ pro Gerät; später evtl. fest pro Person durch die Leitung.
- Datensicherung wöchentlich und vor größeren Änderungen (`docs/BACKUP.md`).
- Gruppen aus dem Import („Übernommen A1“ …) nach dem Import umbenennen oder aufteilen.

## 6. Offene Entscheidungen
Alle 21 aus legacy stehen in der App unter „14 Offene Entscheidungen“ und können dort entschieden werden. Zusätzlich
in dieser Umsetzung entstanden bzw. betroffen:
- Sehen Lehrkräfte alle Schüler oder nur ihre Gruppen? (umschaltbar, Standard: nur eigene)
- Wer darf Schülerdaten ändern? (vorläufig: Team bearbeitet, Leitung legt an und löscht)
- Warnschwellen der Qualitätskontrolle (nur Leitung, Standard: keine)
- Häufigkeit und Aufbewahrungsfrist der Datensicherung
- Uhrzeiten der Stunden (für „heute“ gilt Europe/Berlin)

## 7. Technische Änderungen
Next.js 14 (App Router), TypeScript strict, Tailwind CSS, Supabase (Postgres, Auth per Magic Link, RLS), Vercel.
Inhalte als versionierte JSON-Dateien. Tests: Vitest, PGlite (Zugriffsregeln gegen echtes Postgres in der CI),
Playwright mit axe. Neue Bibliotheken jeweils begründet in `docs/STATUS.md`.

## 8. Qualitätscheck
- Vitest: 96 Tests (Vollständigkeit der Inhalte, Logik identisch mit legacy, Zugriffsregeln, Formulare, Import).
- Playwright: 56 Tests auf 390 px und Desktop, inkl. Barrierefreiheit hell und dunkel.
- Keine erfundenen Inhalte: feste Texte im Seiten-Code werden per Test gegen den Text der alten Version geprüft.
- Kein seitliches Scrollen auf 390 px; Tippflächen mindestens 44 px; Eingaben 16 px.

## 9. Nächste Schritte
1. Supabase-Projekt anlegen (`docs/SUPABASE.md`), erste Leitung anlegen, Team einladen.
2. Auf Vercel veröffentlichen (`docs/DEPLOY.md`), auf dem Handy installieren.
3. Daten aus der alten Version importieren, Gruppen anlegen, Startdaten eintragen.
4. Offene Entscheidungen in der App entscheiden.
5. Phase 8 (Lern-App) und Phase 9 (Prüfungsvorbereitung).
