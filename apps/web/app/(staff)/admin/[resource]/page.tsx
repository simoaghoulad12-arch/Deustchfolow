import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { liveGet } from '@/lib/api/live';
import { ButtonLink, Card, ErrorState, PageHeader } from '@/components/live/ui';
import type { RegistryEntry } from '../layout';
import { UsersTable } from './users-table';

type Page = { total: number; page: number; pageSize: number; items: Record<string, unknown>[] };

function cell(value: unknown): string {
  if (value === null || value === undefined) return '–';
  if (typeof value === 'boolean') return value ? '✓' : '—';
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 60);
  const s = String(value);
  return s.length > 70 ? `${s.slice(0, 70)}…` : s;
}

export default async function ResourcePage({ params, searchParams }: { params: { resource: string }; searchParams: { q?: string; page?: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const q = new URLSearchParams();
  if (searchParams.q) q.set('q', searchParams.q.slice(0, 100));
  if (searchParams.page && /^\d+$/.test(searchParams.page)) q.set('page', searchParams.page);

  if (params.resource === 'users') {
    const users = await liveGet<Page>(session, `/admin/users?${q.toString()}`);
    if (!users) return <ErrorState retryHref="/admin/users" />;
    return (
      <div>
        <PageHeader title="Users" description={`${users.total} accounts`} />
        <UsersTable users={users.items as never} selfId={session.id} />
      </div>
    );
  }

  const registry = (await liveGet<RegistryEntry[]>(session, '/admin')) ?? [];
  const entry = registry.find((r) => r.key === params.resource);
  if (!entry) notFound();
  const data = await liveGet<Page>(session, `/admin/content/${entry.key}?${q.toString()}`);
  if (!data) return <ErrorState retryHref={`/admin/${entry.key}`} />;
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const pageLink = (p: number) => {
    const n = new URLSearchParams(q);
    n.set('page', String(p));
    return `/admin/${entry.key}?${n.toString()}`;
  };

  return (
    <div>
      <PageHeader title={entry.label} description={`${data.total} items`} action={!entry.readOnlyCreate && <ButtonLink href={`/admin/${entry.key}/new`}>+ New</ButtonLink>} />
      <form className="mb-4 flex gap-2" action={`/admin/${entry.key}`}>
        <input name="q" defaultValue={searchParams.q} placeholder="Search…" aria-label="Search" className="h-10 flex-1 rounded-xl border border-border bg-white px-3" />
        <button className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white">Search</button>
      </form>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {entry.columns.map((c) => (
                <th key={c} className="px-4 py-3 font-semibold">
                  {c.replace(/([a-z])([A-Z])/g, '$1 $2')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.items.map((item) => {
              const id = String(item[entry.idField]);
              return (
                <tr key={id} className="hover:bg-slate-50">
                  {entry.columns.map((c, i) => (
                    <td key={c} className="px-4 py-2.5">
                      {i === 0 ? (
                        <Link href={`/admin/${entry.key}/${encodeURIComponent(id)}`} className="font-medium text-indigo-700 hover:underline">
                          {cell(item[c])}
                        </Link>
                      ) : (
                        cell(item[c])
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-3 text-sm" aria-label="Pagination">
          {data.page > 1 && <a href={pageLink(data.page - 1)} className="rounded-lg border border-border bg-white px-3 py-1.5">← Previous</a>}
          <span>
            Page {data.page} of {pages}
          </span>
          {data.page < pages && <a href={pageLink(data.page + 1)} className="rounded-lg border border-border bg-white px-3 py-1.5">Next →</a>}
        </nav>
      )}
    </div>
  );
}
