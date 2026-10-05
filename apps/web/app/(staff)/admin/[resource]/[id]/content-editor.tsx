'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, buttonClass } from '@/components/live/ui';
import { deleteContentAction, saveContentAction } from '../../actions';

type Kind = 'boolean' | 'number' | 'json' | 'longtext' | 'text';

const LONG_FIELDS = new Set(['description', 'objective', 'scenario', 'explanation', 'summary', 'openingLine', 'practicePrompt', 'prompt', 'personality', 'speakingStyle', 'exampleSentence']);
const NUMBER_FIELDS = new Set(['difficulty', 'estimatedMinutes', 'xpReward', 'order', 'frequency', 'rollout', 'chapter']);
const BOOL_FIELDS = new Set(['isActive', 'isPlacement', 'isTarget', 'enabled']);
const JSON_FIELDS = new Set(['keyPhrases', 'criteria', 'extra', 'examples', 'payload', 'content', 'value', 'objectives', 'requiredSkills']);

function kindOf(field: string, value: unknown): Kind {
  if (BOOL_FIELDS.has(field) || typeof value === 'boolean') return 'boolean';
  if (NUMBER_FIELDS.has(field) || typeof value === 'number') return 'number';
  if (JSON_FIELDS.has(field) || (value !== null && typeof value === 'object')) return 'json';
  if (LONG_FIELDS.has(field)) return 'longtext';
  return 'text';
}

/** Generic CMS form: one control per editable field, typed from the value; complex fields edit as JSON. */
export function ContentEditor({ resource, id, initial }: { resource: string; id: string | null; initial: Record<string, unknown> }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(
      Object.entries(initial).map(([k, v]) => {
        const kind = kindOf(k, v);
        if (kind === 'boolean') return [k, Boolean(v ?? (k === 'isActive' || k === 'isTarget'))];
        if (kind === 'json') return [k, v == null ? '' : JSON.stringify(v, null, 2)];
        return [k, v == null ? '' : String(v)];
      }),
    ),
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const build = (): Record<string, unknown> | null => {
    const out: Record<string, unknown> = {};
    for (const [k, raw] of Object.entries(values)) {
      const kind = kindOf(k, initial[k]);
      if (kind === 'boolean') out[k] = raw;
      else if (raw === '') {
        if (id) out[k] = null;
      } else if (kind === 'number') out[k] = Number(raw);
      else if (kind === 'json') {
        try {
          out[k] = JSON.parse(String(raw));
        } catch {
          setError(`${k}: invalid JSON`);
          return null;
        }
      } else out[k] = raw;
    }
    return out;
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setSaved(false);
        const data = build();
        if (!data) return;
        start(async () => {
          const res = await saveContentAction(resource, id, data);
          if (!res.ok) return setError(res.message);
          setSaved(true);
          if (!id) {
            const newId = String(res.data.id ?? res.data.key ?? res.data.code ?? '');
            router.push(newId ? `/admin/${resource}/${encodeURIComponent(newId)}` : `/admin/${resource}`);
          } else router.refresh();
        });
      }}
    >
      <Card className="space-y-4">
        {Object.keys(values).map((field) => {
          const kind = kindOf(field, initial[field]);
          const v = values[field];
          const set = (nv: string | boolean) => setValues((s) => ({ ...s, [field]: nv }));
          return (
            <label key={field} className="block text-sm font-medium">
              <span className="font-mono text-xs text-slate-500">{field}</span>
              {kind === 'boolean' ? (
                <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(e.target.checked)} className="ml-3 h-4 w-4 align-middle" />
              ) : kind === 'json' || kind === 'longtext' ? (
                <textarea
                  value={String(v)}
                  onChange={(e) => set(e.target.value)}
                  rows={kind === 'json' ? Math.min(16, Math.max(3, String(v).split('\n').length)) : 3}
                  className={`mt-1 w-full rounded-xl border border-border bg-white p-3 ${kind === 'json' ? 'font-mono text-xs' : 'text-sm'}`}
                  spellCheck={kind !== 'json'}
                />
              ) : (
                <input type={kind === 'number' ? 'number' : 'text'} value={String(v)} onChange={(e) => set(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-sm" />
              )}
            </label>
          );
        })}
      </Card>
      {error && (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}
      {saved && <p className="text-sm text-emerald-700" role="status">Saved.</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass('primary')}>
          {pending ? 'Saving…' : id ? 'Save' : 'Create'}
        </button>
        {id && (
          <button
            type="button"
            disabled={pending}
            className={`${buttonClass('ghost')} text-rose-600`}
            onClick={() => {
              if (!window.confirm('Delete this item permanently? Consider deactivating it instead.')) return;
              start(async () => {
                const res = await deleteContentAction(resource, id);
                if (!res.ok) return setError(res.message);
                router.push(`/admin/${resource}`);
              });
            }}
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
