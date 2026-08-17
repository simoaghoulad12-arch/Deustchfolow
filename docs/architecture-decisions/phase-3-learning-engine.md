# Phase 3 — Learning Engine: Implementierungsentscheidungen

Kurze Entscheidungen, die während der Umsetzung nötig wurden. Gemäß
Auftrag dokumentiert statt nachgefragt — jeweils die einfachste
skalierbare Lösung gewählt.

1. **"Answers" (Abschnitt 7) und "Exercise Attempts" (Abschnitt 9) sind
   ein einziges Modell (`ExerciseAttempt`).** Beide Abschnitte beschreiben
   praktisch identische Felder (userId, exerciseId, answer, isCorrect,
   Versuch/attemptNumber, Zeitpunkt). Zwei Tabellen dafür anzulegen wäre
   genau die in Abschnitt 9 explizit verbotene Duplikation.

2. **Course-/Module-Fortschritt wird nicht als eigene Tabelle
   gespeichert, sondern aus `LessonProgress` aggregiert.** Abschnitt 21
   verbietet redundante Daten; Kurs-/Modul-Fortschritt lässt sich
   korrekt und performant aus den Lesson-Progress-Zeilen berechnen
   (COUNT completed / total). Nur `LessonProgress` ist Quelle der
   Wahrheit, wie in Abschnitt 8 als Beispiel vorgegeben.

3. **Kein eigener `Module`-Endpoint.** Abschnitt 17 listet keinen
   `GET /modules/:module`-Endpunkt. Modul-Daten (mit ihren Lektionen)
   werden eingebettet in `GET /courses/:course` zurückgegeben — vermeidet
   einen ungenutzten Controller, den die API-Liste nicht vorsieht.

4. **`GET /me/learning-profile` wird nicht dupliziert.** Der Endpunkt
   existiert bereits seit Phase 2 unter `/users/me/learning-profile` und
   bleibt dort (bereits getestet, bereits von `/settings` genutzt). Eine
   zweite Route für dieselbe Ressource wäre unnötige Komplexität. Neu ist
   nur `GET /me/progress`.

5. **`POST /exercises/:id/attempts` wurde ergänzt**, obwohl nicht in der
   Read-API-Liste (Abschnitt 17) enthalten — ohne Schreib-Endpunkt können
   Antworten nicht gespeichert werden, was Abschnitt 8/9/18/24 aber
   explizit verlangen (Attempt-Speicherung, Progress-Update, Tests dafür).

6. **Vocabulary-API wird in dieser Phase nicht gebaut**, nur das
   Datenmodell (Abschnitt 10) plus Seed-Daten. Abschnitt 17 listet keine
   Vocabulary-Endpunkte; ein eigener Trainings-Flow ist erkennbar
   spätere Phase.

7. **Analytics-Events (Abschnitt 27) werden nicht als Tabelle gebaut.**
   Die genannten Events entsprechen bereits vorhandenen Zustandsübergängen
   (`lesson_started`/`lesson_completed` = `LessonProgress`-Status,
   `exercise_completed` = neuer `ExerciseAttempt`) und können später ohne
   Schema-Änderung in eine echte Event-Pipeline gespiegelt werden.

8. **ORDER_WORDS wird im Frontend als Texteingabe (Wörter durch
   Leerzeichen getrennt) statt Drag-and-Drop umgesetzt.** Datenmodell und
   Bewertung unterstützen den Übungstyp vollständig; nur die Eingabe-UI
   ist für das MVP vereinfacht, um kein aufwendiges Drag-and-Drop-Widget
   für eine einzelne Übungsart zu bauen.
