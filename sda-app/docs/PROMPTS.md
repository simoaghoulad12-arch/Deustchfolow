# Bauplan: Smart Deutsch Akademie App – Prompts für Claude Code

So benutzt du diese Datei:
- Eine Phase pro Sitzung. Prompt kopieren, in Claude Code einfügen, Plan prüfen, freigeben.
- Für jede Phase den Plan-Modus nutzen. Erst wenn der Plan stimmt, umsetzen lassen.
- Nach jeder Phase: App selbst auf dem Handy testen, dann den Prüf-Prompt (ganz unten) laufen lassen.
- Danach `/clear` und mit der nächsten Phase weitermachen. `CLAUDE.md` wird automatisch wieder gelesen.

---

## Phase 1 – Projekt aufsetzen und Inhalte sichern

```
Lies CLAUDE.md und analysiere legacy/index.html vollständig. Ändere legacy/ nicht.

Aufgabe:
1. Lege ein neues Next.js-Projekt (App Router, TypeScript strict, Tailwind) in diesem Ordner an.
2. Schreibe ein Skript scripts/extract-content.ts, das alle Inhalte aus legacy/index.html ausliest und als JSON in content/ speichert:
   curriculum (LV), scripts (SC), speaking (SPK), probe (PROBE), objectives (LO), platforms (PLAT), standards (STDS),
   activities (ACT), templates (TPL), emergency (FALL), germany (DEGROUPS) sowie die Checklisten aller Stunden,
   der Generalprobe, Probestunde, Einrichtung, Onboarding und offenen Entscheidungen.
   Behalte die Kennzeichnung EXISTING, IMPROVEMENT, PROPOSAL, OFFENE ENTSCHEIDUNG bei.
3. Schreibe TypeScript-Typen für alle Inhalte (content/types.ts).
4. Schreibe Tests, die die Vollständigkeit prüfen: 4 Level, 36 Module, 144 Grammatikstunden, 72 Sprechstunden,
   64 vollständige Skripte (A1, A2), 16 Sprechdialoge, 18 Aktivitäten, 7 WhatsApp-Vorlagen, alle offenen Entscheidungen.
5. Lege docs/STATUS.md an.

Zeige mir zuerst den Plan. Nach der Umsetzung: Tests laufen lassen, Ergebnis berichten, committen.
```

## Phase 2 – Datenbank, Login und Rollen

```
Lies CLAUDE.md und docs/STATUS.md.

Aufgabe: Supabase anbinden.
1. Datenbankschema als Migration: profiles (Rolle: admin, teacher, native), groups (Name, Level, Startdatum),
   students (Name, Level, Gruppe, Startdatum, aktuelles Modul, Einschätzung pro Fertigkeit 1–5, Stärken, Schwächen, nächste Lernziele),
   lesson_docs (Datum, Lehrer, Gruppe, Stunden-ID, anwesende und abwesende Schüler, behandelt, Schüler kann jetzt, Fehler,
   Hausaufgabe, nächste Stunde, Material, Probleme), errors (Schüler, Datum, Fehler, Korrektur, Kategorie, Status),
   homework (Schüler, Aufgabe, Ziel, Deadline, Status Offen/Abgegeben/Korrigiert, Feedback),
   material_notes (Stunden-ID, Notiz), checklist_progress (Nutzer, Aufgaben-ID, erledigt am), decisions (Titel, Status, Entscheidung, Datum).
2. Row Level Security für jede Tabelle. Admin sieht alles. Ob Lehrkräfte alle Schüler oder nur ihre Gruppen sehen,
   ist eine OFFENE ENTSCHEIDUNG: baue beide Varianten über eine Einstellung umschaltbar, Standard = nur eigene Gruppen.
3. Login per E-Mail (Magic Link oder Passwort, im Plan begründen). Nur eingeladene Personen, keine offene Registrierung.
4. Admin-Seite zum Einladen von Mitarbeitern und Vergeben der Rolle.
5. .env.example mit allen nötigen Variablen, keine Schlüssel im Code.
6. Tests für die Zugriffsregeln (ein Lehrer darf keine fremden Gruppen sehen, wenn die Einstellung aktiv ist).

Zeige mir zuerst den Plan und die Liste der Tabellen. Danach umsetzen, testen, committen, STATUS.md aktualisieren.
```

## Phase 3 – App-Rahmen, Design und Sprachen

```
Lies CLAUDE.md und docs/STATUS.md. Nimm legacy/index.html als Vorbild für Design und Navigation.

Aufgabe:
1. App-Rahmen: Seitenleiste auf dem Desktop, Menü und untere Leiste auf dem Handy, Suche in der Kopfzeile.
2. Navigation: Dashboard, 01 Academy Standard, 02 Curriculum, 03 Lernziele, 04 Lesson System, 05 Teacher Playbook,
   06 Student Progress, 07 Error Tracking, 08 Hausaufgaben, 09 Germany Preparation, 10 Onboarding, 11 Dokumentation,
   12 Quality Control, 13 Materialien, 14 Offene Entscheidungen, Betrieb & Plattformen, Einstellungen.
3. Design-Tokens: Anthrazit, Weiß, Rot als Akzent, Gold sehr sparsam, Hell- und Dunkelmodus.
4. Zwei Sprachen: Deutsch und Arabisch (RTL). Unterrichtsinhalte bleiben Deutsch, Arabisch nur für Hinweise.
5. Komponenten für die Kennzeichnung EXISTING, IMPROVEMENT, PROPOSAL, OFFENE ENTSCHEIDUNG.
6. Playwright-Test: Navigation funktioniert auf 390 px Breite und auf Desktop.

Erst Plan, dann umsetzen, testen, committen.
```

## Phase 4 – Curriculum und Stunden-Ansicht

```
Lies CLAUDE.md und docs/STATUS.md.

Aufgabe: Unterrichtsinhalte nutzbar machen, mit den Daten aus content/.
1. Curriculum: Level A1–B2, Module mit Lernzielen („Am Ende dieser Einheit kann der Schüler …“), Filter nach Bereich
   (Grammatik, Sprechen, Schreiben, Hören, Lesen, Deutschland, Bewerbung) und Status (Offen, In Arbeit, Abgeschlossen).
2. Lernziele-Seite pro Modul: Grammatik, Wortschatz, Kommunikation, Praxis.
3. Stunden-Ansicht mit drei Modi wie in legacy/index.html: Skript (zum Vorlesen, mit Darija-Hinweis und Lösungen zum Aufklappen),
   Schritte (eine Aufgabe nach der anderen) und Liste. Stunden-Timer, der zeigt, was laut Minute dran ist.
4. Rollen pro Wochentag wie in legacy (Lehrkraft 1 Haupt Mo und Mi, Lehrkraft 2 Di und Do, Sprechstunden Fr und Sa).
   Das ist ein PROPOSAL: in den Einstellungen änderbar machen.
5. Checklisten-Fortschritt pro Nutzer in checklist_progress speichern.
6. Feld „Im Lehrbuch (Seite/Lektion)“ pro Stunde, gespeichert in material_notes.
7. Lesson System Seite mit den 9 Schritten und der Zuordnung zu den Minuten.

Erst Plan, dann umsetzen, testen (inkl. Handy-Ansicht), committen.
```

## Phase 5 – Lehren, Dokumentieren, Messen

```
Lies CLAUDE.md und docs/STATUS.md.

Aufgabe: Den Kreislauf Lehren → Dokumentieren → Messen bauen.
1. Gruppen und Schüler verwalten (anlegen, bearbeiten, löschen mit Bestätigung).
2. Teacher Playbook „Heute“: welche Gruppe, welche Stunde laut Startdatum der Gruppe, was zuletzt dokumentiert wurde,
   offene Hausaufgaben, offene Fehler, Lernziel der Stunde.
3. Button „Stunde dokumentieren“ in jeder Stunde: Formular vorausgefüllt aus dem Skript (Thema, Hausaufgabe, nächste Stunde, Material),
   Anwesenheit per Häkchen, Option „Hausaufgabe für alle Anwesenden anlegen“. Ziel: in 2 Minuten ausgefüllt.
4. Student Progress: Anwesenheit (aus lesson_docs), Hausaufgaben-Status, offene Fehler, Fertigkeiten 1–5, letzte und nächste Stunde.
5. Error Tracking mit Kategorien (Grammatik, Wortschatz, Aussprache, Satzbau, Schreiben, Sprechen, Verständnis)
   und Status (offen, wiederholen, verbessert), Filter.
6. Hausaufgaben mit Ziel, Deadline, Status und Feedback.
7. Dashboard mit Lernweg A1 → A2 → B1 → B2 → Deutschland und Kennzahlen.

Erst Plan, dann umsetzen, testen, committen.
```

## Phase 6 – Qualität, Deutschland, Material, Suche

```
Lies CLAUDE.md und docs/STATUS.md.

Aufgabe:
1. Quality Control: Kennzahlen aus den Daten (Anwesenheit, Hausaufgaben, Fehler, Dokumentationen) und Listen
   (niedrigste Anwesenheit, meiste offene Fehler, am längsten ohne Dokumentation). Keine Warnschwellen erfinden:
   Schwellen sind eine OFFENE ENTSCHEIDUNG und nur vom Admin einstellbar.
2. Germany Preparation, Materialien, Onboarding, Betrieb & Plattformen (Generalprobe, Probestunde, Einrichtung,
   Online-Leitfaden, WhatsApp-Vorlagen mit Kopier-Button, Notfallplan), Academy Standard – alles aus content/.
3. Offene Entscheidungen aus der Tabelle decisions: Admin kann Entscheidung eintragen, Status und Datum werden gespeichert.
4. Schnelle Suche über Stunden, Module, Lernziele, Aktivitäten, Vorlagen, Schüler und Dokumentationen, mit Filter nach Level und Bereich.

Erst Plan, dann umsetzen, testen, committen.
```

## Phase 7 – Handy-App, Tests und Veröffentlichung

```
Lies CLAUDE.md und docs/STATUS.md.

Aufgabe:
1. PWA: App-Icon, Name „Smart Deutsch Akademie“, installierbar auf Android und iPhone, Startbildschirm.
2. Playwright-Tests für die wichtigsten Abläufe: Login, Stunde öffnen, Skript lesen, Stunde dokumentieren,
   Schüler-Fortschritt prüfen – jeweils auf Handy-Größe und Desktop.
3. Barrierefreiheit und Geschwindigkeit prüfen (Kontrast, Tastatur, Ladezeit) und Probleme beheben.
4. Deployment auf Vercel vorbereiten: Schritt-für-Schritt-Anleitung in docs/DEPLOY.md
   (GitHub-Repository, Vercel-Projekt, Umgebungsvariablen, Supabase-URL, eigene Domain).
5. Datensicherung: Anleitung für regelmäßigen Export aus Supabase in docs/BACKUP.md.
6. Daten aus der alten Version übernehmen: Import-Funktion für den JSON-Export aus legacy/index.html (Einstellungen → Export).

Erst Plan, dann umsetzen, testen, committen. Am Ende Abschlussbericht: Analyse, Verbesserungen, Struktur,
erhaltene Inhalte, Vorschläge, offene Entscheidungen, technische Änderungen, Qualitätscheck, nächste Schritte.
```

## Phase 8 – Lern-App für Schüler

```
Lies CLAUDE.md, docs/STATUS.md und docs/CONTENT-STATUS.md.

Aufgabe: Bereich für Schüler (Rolle student) in derselben App.
1. Schüler-Login über Einladung durch Admin oder Lehrkraft. Verknüpfung profiles ↔ students.
2. „Mein Weg“: A1 → A2 → B1 → B2 → Prüfung bestanden, mit Prozent pro Level, pro Modul und gesamt.
3. Pro Modul: Lernziele, Zusammenfassung der Regeln (aus content/), Wortschatz, Beispielsätze,
   Übungen mit automatischer Prüfung (aus content/scripts, Felder Frage/Lösung), Ergebnis in exercise_attempts.
4. Wochen-Mini-Test pro Modul mit Punktzahl in test_results.
5. Hausaufgaben: Liste, Abgabe als Text, Status und Feedback der Lehrkraft.
6. Persönliche Fehlerliste (nur eigene Fehler, Status offen, wiederholen, verbessert) mit Wiederholungsübung.
7. Fortschritt pro Fertigkeit als einfache Balken.
8. Deutschland-Bereich: Alltag, Behörden, Arzt, Wohnen, Bewerbung (aus content/germany).
9. Strenge Row Level Security: Ein Schüler sieht niemals Daten anderer Schüler oder interne Team-Inhalte (Skripte, Notizen).
10. Fortschritts-Formel als PROPOSAL umsetzen, Gewichtung und Bestehensgrenze in den Admin-Einstellungen (OFFENE ENTSCHEIDUNG).

Erst Plan, dann umsetzen, testen (Handy!), committen.
```

## Phase 9 – Prüfungsvorbereitung bis B2

```
Lies CLAUDE.md, docs/STATUS.md und docs/CONTENT-STATUS.md.

Aufgabe:
1. Prüfungsbereich pro Level (A1, A2, B1, B2): Aufbau der Prüfung (Lesen, Hören, Schreiben, Sprechen),
   eigene Modelltests aus content/ mit Punktzahl und Auswertung pro Teil.
2. „Bereit für die Prüfung?“-Ansicht: Ergebnis der letzten Modelltests, schwächste Fertigkeit, Empfehlung zum Wiederholen.
3. Prüfungsanmeldung erfassen (Anbieter, Datum, Ort, Ergebnis) in exam_registrations.
   Termine, Gebühren und Formate NICHT eintragen oder erfinden: Hinweis „beim Anbieter prüfen“.
4. Ergebnis „bestanden“ setzt das Level auf 100 % und schaltet das nächste Level frei.
5. Admin-Übersicht: wie viele Schüler sind in welchem Level, wie viele haben welche Prüfung bestanden.

Erst Plan, dann umsetzen, testen, committen.
```

## Später (erst nach Entscheidung)
- B1 und B2 vollständige Skripte und Übungen ergänzen (gleiches Format wie A1/A2 in content/scripts).
- Zahlungen und Verträge: OFFENE ENTSCHEIDUNG, rechtlich prüfen lassen.
- Native Apps in den Stores: erst prüfen, ob die PWA reicht.

---

## Prüf-Prompt nach jeder Phase

```
Prüfe die letzte Phase gegen CLAUDE.md:
1. Sind alle Inhalte aus legacy/index.html noch vorhanden? (Tests laufen lassen)
2. Wurde irgendetwas erfunden (Preise, Zeiten, Regeln, Namen)? Wenn ja, als OFFENE ENTSCHEIDUNG markieren.
3. Funktioniert alles auf 390 px Breite?
4. Sind Schülerdaten durch Row Level Security geschützt?
5. Liste gefundene Probleme mit Priorität auf und behebe die wichtigsten. Danach committen und STATUS.md aktualisieren.
```
