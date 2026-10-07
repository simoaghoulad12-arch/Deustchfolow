# Smart Deutsch Akademie – Academy App

## Was ist das?
Internes Betriebssystem der Smart Deutsch Akademie (Deutsch online, A1 bis B2, Gruppenunterricht).
Ziel: Mehrere Mitarbeiter liefern zuverlässig dieselbe hohe Unterrichtsqualität.
Kreislauf: Lehren → Dokumentieren → Messen → Verbessern.

Eine Codebasis, zwei Bereiche:
1. **Team-App** (intern): Curriculum, Skripte, Playbook, Dokumentation, Fortschritt, Qualität, Betrieb.
2. **Lern-App** (für Schüler): der komplette Weg von A1 bis zur bestandenen B2-Prüfung, mit Fortschritt in Prozent.

Die App startet NICHT leer: Alle Inhalte aus `legacy/index.html` und `content/` sind ab dem ersten Tag drin.

Nutzer (Rollen):
- `admin`: Leitung (Simo). Sieht und verwaltet alles.
- `teacher`: Lehrkraft (Grammatik, Hauptlehrkraft oder Assistenz).
- `native`: Muttersprachler/in (Sprechstunden).
- `student`: Schüler. Sieht nur die eigenen Daten und die Lerninhalte seines Levels.

## Quelle der Inhalte
`legacy/index.html` ist die bestehende Version (V2) als einzelne HTML-Datei. Sie enthält ALLE fachlichen Inhalte:
`LV` (Lehrplan A1–B2), `SC` (Vorlese-Skripte), `SPK` (Sprechdialoge), `PROBE` (Probestunde), `LO` (Lernziele),
`PLAT`, `STDS`, `ACT` (Online-Leitfaden), `TPL` (WhatsApp-Vorlagen), `FALL` (Notfallplan), `DEGROUPS` (Germany Preparation),
Checklisten-Generatoren (`grammarGroups`, `speakGroups`, `testGroups`, `startGroups`, `probeLessons`, `onbLesson`, `openLesson`, `setupGroups`).
Nichts davon darf verloren gehen. `legacy/` niemals verändern oder löschen.

## Regeln (wichtig)
1. Nichts erfinden: keine Preise, Lehrer, Zeiten, Verträge, Zertifikate, Partnerschaften, rechtlichen Aussagen, Garantien oder Akademie-Regeln.
2. Jede inhaltliche Aussage in der Oberfläche ist gekennzeichnet: `EXISTING`, `IMPROVEMENT`, `PROPOSAL` oder `OFFENE ENTSCHEIDUNG`. Übernimm die Kennzeichnung aus `legacy/index.html`.
3. Unklare Punkte nicht still entscheiden, sondern als OFFENE ENTSCHEIDUNG in die Tabelle `decisions` und auf die Seite „Offene Entscheidungen“.
4. Keine Fake-Daten als echte Akademie-Daten. Testdaten nur in Tests oder klar markiert im lokalen Seed.
5. Schülerdaten sind personenbezogen: Row Level Security in Supabase ist Pflicht, keine Schülerdaten in Logs, URLs oder Analytics.
6. Mobile first: große Buttons (min. 44 px), lesbare Schrift (min. 16 px in Eingaben), Tabellen responsiv.
7. Sprache der Oberfläche: Deutsch. Arabisch (Darija) als zweite Sprache mit RTL. Unterrichtsinhalte bleiben Deutsch.
8. Keine neuen Bibliotheken ohne kurze Begründung im Plan.

## Technik (Vorschlag, im Plan bestätigen lassen)
- Next.js (App Router) + TypeScript (strict) + Tailwind CSS
- Supabase: Postgres, Auth (E-Mail-Login), Row Level Security
- Hosting: Vercel
- Lehrplan-Inhalte als versionierte JSON-Dateien in `content/` (nicht in der Datenbank)
- Nutzerdaten in Supabase: groups, students, lesson_docs, errors, homework, material_notes, checklist_progress, decisions, profiles,
  exercise_attempts, test_results, submissions, exam_registrations
- PWA, damit die App auf dem Handy installierbar ist
- Tests: Vitest (Logik) und Playwright (wichtige Abläufe, auch Handy-Größe)

## Design
Schwarz/Anthrazit, Weiß, Rot als Akzent, Gold nur sehr sparsam. Seriös, klar, schnell. Vorbild: `legacy/index.html`.

## Arbeitsweise
- Vor jeder größeren Aufgabe: Plan zeigen und auf Freigabe warten.
- Kleine Schritte, nach jedem Schritt testen und einen Git-Commit mit klarer Nachricht machen.
- Am Ende jeder Aufgabe kurz berichten: Was geändert, was getestet, was offen.
- `docs/PROMPTS.md` enthält den Bauplan in Phasen. `docs/STATUS.md` nach jeder Phase aktualisieren.

## Fortschritt in Prozent (Lern-App)
- Pro Modul, pro Level und gesamt (A1 → B2 = 100 %). Formel im Code dokumentieren und in den Einstellungen änderbar.
- Vorschlag für die Formel: Anwesenheit laut Dokumentation, gelöste Übungen, Mini-Test-Ergebnis. Gewichtung und Bestehensgrenze
  sind eine OFFENE ENTSCHEIDUNG und werden vom Admin eingestellt, nicht erfunden.
- Fortschritt pro Fertigkeit: Grammatik, Wortschatz, Sprechen, Hören, Lesen, Schreiben.

## Inhalts-Stand
Siehe `docs/CONTENT-STATUS.md`. Fehlende Inhalte werden im gleichen Format wie A1/A2 ergänzt und vor der Freigabe
von einer Person mit sehr guten Deutschkenntnissen geprüft (Status `entwurf` → `geprüft`).
