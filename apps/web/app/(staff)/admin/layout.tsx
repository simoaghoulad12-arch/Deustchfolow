import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { UserRole } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { liveGet } from '@/lib/api/live';

export type RegistryEntry = { key: string; label: string; idField: string; columns: string[]; readOnlyCreate: boolean; fields: string[] };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== UserRole.ADMIN && session.role !== UserRole.CONTENT_EDITOR) notFound();
  const registry = (await liveGet<RegistryEntry[]>(session, '/admin')) ?? [];
  return (
    <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
      <nav aria-label="Admin" className="flex gap-2 overflow-x-auto pb-2 scrollbar-none lg:flex-col lg:gap-1 lg:overflow-visible">
        <Link href="/admin" className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-100">
          Overview
        </Link>
        {registry.map((r) => (
          <Link key={r.key} href={`/admin/${r.key}`} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-slate-100">
            {r.label}
          </Link>
        ))}
        {session.role === UserRole.ADMIN && (
          <Link href="/admin/users" className="whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-slate-100">
            Users
          </Link>
        )}
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
