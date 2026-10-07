/** Pflicht-Hinweis: Termine, Gebühren und Formate werden nicht in der App gepflegt. */
export function ExamNotice() {
  return (
    <p role="note" className="rounded-lg border border-gold bg-gold-soft px-3 py-2 text-sm">
      Termine, Gebühren und Prüfungsformate ändern sich – bitte immer aktuell{' '}
      <b>beim Prüfungsanbieter prüfen</b>.
    </p>
  );
}
