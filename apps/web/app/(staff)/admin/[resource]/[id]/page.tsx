import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { liveGet } from '@/lib/api/live';
import { PageHeader } from '@/components/live/ui';
import type { RegistryEntry } from '../../layout';
import { ContentEditor } from './content-editor';

export default async function EditPage({ params }: { params: { resource: string; id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const registry = (await liveGet<RegistryEntry[]>(session, '/admin')) ?? [];
  const entry = registry.find((r) => r.key === params.resource);
  if (!entry) notFound();
  const isNew = params.id === 'new';
  if (isNew && entry.readOnlyCreate) notFound();
  const item = isNew ? {} : await liveGet<Record<string, unknown>>(session, `/admin/content/${entry.key}/${encodeURIComponent(params.id)}`);
  if (!item) notFound();
  const initial = Object.fromEntries(entry.fields.map((f) => [f, item[f] ?? null]));
  return (
    <div>
      <Link href={`/admin/${entry.key}`} className="text-sm font-medium text-indigo-600 hover:underline">
        ← {entry.label}
      </Link>
      <PageHeader title={isNew ? `New ${entry.label.toLowerCase()}` : String(item.title ?? item.word ?? item.name ?? item.key ?? item.code ?? 'Edit')} />
      <ContentEditor resource={entry.key} id={isNew ? null : decodeURIComponent(params.id)} initial={initial} />
    </div>
  );
}
