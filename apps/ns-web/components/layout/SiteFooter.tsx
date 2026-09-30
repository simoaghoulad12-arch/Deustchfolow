import Link from 'next/link';
import { Mark } from '@/components/brand/Mark';
import { BRAND, SOCIAL, WORLDS, WORLD_ORDER } from '@/lib/brand';
import { Icon } from '@/components/ui/Icon';

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/[0.07] bg-ink pb-28 pt-20 lg:pb-10">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="w-16">
              <Mark sizes="64px" />
            </div>
            <p className="mt-8 font-display text-3xl leading-tight sm:text-4xl">
              Discipline
              <br />
              <span className="italic text-gold">builds freedom.</span>
            </p>
            <a
              href={SOCIAL.instagram}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-3 text-sm text-ivory/80 transition-colors hover:text-gold"
            >
              <Icon name="instagram" /> {SOCIAL.instagramHandle}
            </a>
          </div>

          <FooterCol title="Worlds">
            {WORLD_ORDER.map((id) => (
              <FooterLink key={id} href={`/worlds/${id}`}>
                {WORLDS[id].name}
              </FooterLink>
            ))}
            <FooterLink href="/collection">Collection 01</FooterLink>
            <FooterLink href="/sets">The Sets</FooterLink>
          </FooterCol>

          <FooterCol title="House">
            <FooterLink href="/story">Story</FooterLink>
            <FooterLink href="/account">Account</FooterLink>
            <FooterLink href="/wishlist">Wishlist</FooterLink>
          </FooterCol>

          <FooterCol title="Service">
            <FooterLink href="/legal/faq">FAQ</FooterLink>
            <FooterLink href="/legal/contact">Contact</FooterLink>
            <FooterLink href="/legal/shipping">Delivery</FooterLink>
            <FooterLink href="/legal/returns">Returns · Widerruf</FooterLink>
            <FooterLink href="/legal/imprint">Imprint · Impressum</FooterLink>
            <FooterLink href="/legal/privacy">Privacy · Datenschutz</FooterLink>
            <FooterLink href="/legal/terms">Terms · AGB</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-white/[0.07] pt-8 text-[11px] uppercase tracking-[0.24em] text-fog sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.name} · {BRAND.roots}
          </p>
          <p>{BRAND.manifesto.join(' · ')}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label text-fog">{title}</p>
      <ul className="mt-6 space-y-3.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-ivory/75 transition-colors hover:text-ivory">
        {children}
      </Link>
    </li>
  );
}
