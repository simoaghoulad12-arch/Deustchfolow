import { cloneElement, isValidElement, useId } from 'react';

/**
 * Beschriftetes Formularfeld (mobile first: große Eingaben, 16 px).
 * Beschriftung über for/id statt Verschachtelung: sonst liest ein Screenreader bei Auswahllisten
 * alle Optionen als Teil der Beschriftung vor. Die ID ist pro Feld eindeutig (useId), auch wenn
 * dasselbe Formular mehrfach auf einer Seite steht.
 */
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactElement<{ id?: string }>;
  hint?: string;
}) {
  const auto = useId();
  const id = children.props.id ?? `feld${auto.replace(/:/g, '-')}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-medium">
        {label}
      </label>
      {isValidElement(children)
        ? cloneElement(children, {
            id,
            'aria-describedby': hint ? `${id}-hinweis` : undefined,
          } as never)
        : children}
      {hint && (
        <span id={`${id}-hinweis`} className="mt-1 block text-sm text-muted">
          {hint}
        </span>
      )}
    </div>
  );
}

export const textareaClass = 'input min-h-24 py-2';
