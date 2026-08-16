import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <span className="text-lg font-semibold">DeutschFlow</span>
          <nav className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: 'outline' })}>
              Anmelden
            </Link>
          </nav>
        </div>
      </header>

      <section className="container flex flex-1 flex-col items-center justify-center gap-8 py-20 text-center sm:py-28">
        <span className="rounded-full border border-border px-4 py-1 text-sm text-muted-foreground">
          A1 – C1 · Made for Germany
        </span>

        <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Deutsch lernen. Deutsch sprechen.
          <br />
          In Deutschland ankommen.
        </h1>

        <p className="max-w-xl text-balance text-lg text-muted-foreground">
          DeutschFlow begleitet dich strukturiert von A1 bis C1 – mit echten
          Konversationsübungen, persönlichen Tutor-Stunden und gezielter
          Vorbereitung auf Bewerbung und Prüfung.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/register" className={buttonVariants({ size: 'lg' })}>
            Deutsch lernen
          </Link>
          <Button size="lg" variant="outline">
            Mehr erfahren
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} DeutschFlow
      </footer>
    </main>
  );
}
