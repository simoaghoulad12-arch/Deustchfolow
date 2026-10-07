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

## Nächste Phase
Phase 2 – Datenbank, Login und Rollen (`docs/PROMPTS.md`).
