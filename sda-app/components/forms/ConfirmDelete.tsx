'use client';

/** Löschen mit Bestätigung (kleines eigenes Formular). */
export function ConfirmDelete({
  action,
  id,
  question,
  label = 'Löschen',
}: {
  action: (fd: FormData) => Promise<void>;
  id: string;
  question: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(question)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn-secondary border-red text-red">
        {label}
      </button>
    </form>
  );
}
