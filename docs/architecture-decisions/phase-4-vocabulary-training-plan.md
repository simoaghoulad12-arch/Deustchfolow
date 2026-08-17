# Phase 4 — Plan: Vocabulary Training Flow

Status: **Planung, nicht implementiert.** Baut auf dem in Phase 3 bereits
angelegten `Vocabulary`/`UserVocabulary`-Datenmodell und der
`VocabularyService` (bisher ohne HTTP-Endpunkte) auf.

---

## 1. Produktprinzip

Ein separates, kurzes tägliches Vokabeltraining (Flashcard-Prinzip),
ergänzend zu den lektionsbasierten Übungen aus Phase 3 — nicht deren
Ersatz. Gleiche Grundregel wie im gesamten Projekt: kein KI-Bewertung,
kein Machine-Learning-Algorithmus, sondern ein einfacher, deterministischer,
vollständig testbarer Mechanismus.

## 2. Datenmodell — Bestand vs. minimale Ergänzung

Bereits vorhanden (Phase 3), **keine neue Tabelle nötig**:
`Vocabulary` (word, normalizedWord, translation, level, partOfSpeech,
exampleSentence), `UserVocabulary` (status, correctCount, incorrectCount,
lastReviewedAt, nextReviewAt).

Zwei kleine, gezielte Ergänzungen:

1. **`UserVocabulary.intervalDays Int @default(1)`.** Der Algorithmus
   (siehe unten) muss wissen, auf welcher Intervall-Stufe ein Wort gerade
   steht, um sie bei richtiger Antwort zu erhöhen bzw. bei falscher
   zurückzusetzen. Das lässt sich nicht zuverlässig aus `correctCount`
   allein ableiten (das zählt kumulativ, auch über Rücksetzungen hinweg).
2. **Optionale Lesson↔Vocabulary-Verknüpfung** (`Lesson.vocabulary
   Vocabulary[]`), analog zur bereits bestehenden
   Lesson-Prerequisites-Self-Relation (einfache implizite m2m, keine
   Zwischentabelle von Hand). Damit können Lektionen später gezielt
   Wörter in die Trainingswarteschlange eines Nutzers einführen. Optional
   für den ersten Wurf — funktioniert auch ohne, dann besteht die
   Warteschlange aus allen `Vocabulary`-Einträgen des aktuellen Levels.

## 3. Spaced-Repetition-Algorithmus (einfach, kein SM-2/ML)

Leitner-artiges System mit festen Intervall-Stufen statt eines vollen
SM-2-Algorithmus — SM-2 wäre für den Start unnötige Komplexität:

- **Richtig:** nächste Stufe aus `[1, 2, 4, 7, 14, 30, 60]` Tagen;
  `nextReviewAt = jetzt + intervalDays`. Status wird `LEARNING`, ab
  `intervalDays ≥ 30` `MASTERED`.
- **Falsch:** zurück auf Stufe 1 (`intervalDays = 1`), Status `LEARNING`
  (bzw. bleibt `NEW`, falls noch nie richtig beantwortet).

Als reine, ungebundene Funktion implementiert (analog zu
`exercises/grading.ts`) — kein Datumsrechnen direkt in Prisma-Queries,
dadurch einfach unit-testbar ohne Datenbank.

## 4. API (neu, alle unter `@CurrentUser()` skaliert)

| Endpunkt | Zweck |
|---|---|
| `GET /api/v1/vocabulary/due` | Fällige Wörter für den aktuellen Nutzer (`nextReviewAt <= now` oder `status=NEW`), begrenzte Anzahl (z. B. 20) — eine gebundene Query, kein voller Tabellen-Scan |
| `POST /api/v1/vocabulary/:id/review` | Antwort einreichen, serverseitig gegen `translation` geprüft (gleiche Normalisierung wie bei Exercises), aktualisiert `UserVocabulary` über den Algorithmus |
| `GET /api/v1/vocabulary` | Durchsuchbare, paginierte Liste, optionaler Level-Filter — nur Lesen |
| `GET /api/v1/me/vocabulary/summary` | Zähler für Dashboard (heute fällig, gelernt, gemeistert) |

Kein Content-Editor-CRUD in dieser Phase — gleiches Muster wie bei
Lessons/Exercises: Autorisierung strukturell vorbereitet
(`@Roles(CONTENT_EDITOR, ADMIN)` auf einer künftigen Schreib-Route), aber
kein Editor-Dashboard gebaut.

## 5. Frontend

- **`/vocabulary`** — Übersicht: Anzahl fälliger Wörter, „Jetzt üben“.
- **`/vocabulary/review`** — Session-UI: eine Karte nach der anderen,
  Nutzer tippt die Übersetzung (konsistent mit dem bereits gebauten
  Exercise-Bewertungsstil — serverseitige Prüfung, keine
  Selbsteinschätzung „wusste ich / wusste ich nicht“), Feedback,
  Session-Zusammenfassung am Ende.
- **Dashboard-Erweiterung:** kleine Kachel „X Vokabeln heute fällig“ mit
  Link zur Session — ergänzt, ersetzt nichts vom bestehenden Dashboard.

## 6. Security

Gleiches Muster wie in Phase 2/3 durchgängig: `/vocabulary/due`,
`/vocabulary/:id/review`, `/me/vocabulary/summary` immer auf
`@CurrentUser()` skaliert, kein `:userId`-Parameter. Review-Ergebnis wird
ausschließlich serverseitig bestimmt, nie vom Client als „richtig“
mitgeschickt.

## 7. Tests (mindestens)

- Algorithmus als reine Funktion: alle Intervall-Übergänge, richtig/falsch, Reset-Verhalten
- `/vocabulary/due` liefert nur eigene, wirklich fällige Wörter
- Ownership: fremde `UserVocabulary`-Einträge nicht lesbar/änderbar
- Keine N+1 bei `/vocabulary/due` (eine Query für die Warteschlange)

## 8. Seed

Die 8 vorhandenen A1-Vokabeln reichen als Entwicklungsbasis; höchstens 2–3
weitere für Level-Filter-Tests. Keine Masse — gleiche Regel wie beim
Lern-Content in Phase 3.

## 9. Offene Punkte (bewusst nicht Teil dieser Phase)

KI-gestützte Aussprache-/Schreibbewertung, Bild-Karten, Audio,
Content-Editor-Vokabel-CRUD-UI, Lesson↔Vocabulary-Verknüpfung falls in
Phase 4 selbst nicht mitgebaut.
