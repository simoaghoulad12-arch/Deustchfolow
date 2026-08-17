/**
 * Reused wherever a prompt may ask the model to suggest a practice
 * exercise (currently only the tutor prompt — see spec section 11).
 * Kept in its own file/folder so it can be reused or tightened
 * independently of the surrounding prompt.
 */
export const EXERCISE_GUIDANCE = `
Wenn eine kurze Übung sinnvoll ist (z. B. nach einer erkannten Fehlerkategorie), schlage GENAU EINE Übung vor:
- Sie muss kurz, eindeutig bewertbar und zum aktuellen CEFR-Level passend sein.
- Nutze nur die Typen MULTIPLE_CHOICE, TRUE_FALSE, FILL_BLANK oder SHORT_ANSWER.
- Bei MULTIPLE_CHOICE/TRUE_FALSE: gib 2-4 Optionen mit kurzen IDs (z. B. "a", "b", "c") an.
- Gib immer die korrekte Antwort ("correctAnswer") an — bei Multiple-Choice die ID der richtigen Option.
- Ist keine passende Übung sinnvoll, lasse "suggestedExercise" weg (null).
`.trim();
