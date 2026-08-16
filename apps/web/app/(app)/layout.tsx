import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { logoutAction } from './actions';
import { Button } from '@/components/ui/button';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-semibold">
            DeutschFlow
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="default">
              Abmelden
            </Button>
          </form>
        </div>
      </header>
      <main className="container flex-1 py-10">{children}</main>
    </div>
  );
}
