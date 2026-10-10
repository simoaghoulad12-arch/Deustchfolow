'use client';

/** Status direkt in der Liste ändern: speichert bei Auswahl (ohne JavaScript per Knopf). */
export function StatusSelect({
  action,
  id,
  value,
  options,
  label,
}: {
  action: (fd: FormData) => Promise<void>;
  id: string;
  value: string;
  options: readonly string[];
  label: string;
}) {
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={value}
        aria-label={label}
        className="input w-auto"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="btn-secondary">
          OK
        </button>
      </noscript>
    </form>
  );
}
