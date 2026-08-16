import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <Link href="/" className="block text-center text-lg font-semibold">
          DeutschFlow
        </Link>
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
