import Link from 'next/link';
import { Mark } from '@/components/brand/Mark';
import { BRAND, SOCIAL, WORLD_ORDER } from '@/lib/brand';
import { pick } from '@/lib/i18n/copy';
import { shell } from '@/lib/i18n/copy/shell';
import { getLocale } from '@/lib/i18n/server';
import { localizedWorlds } from '@/lib/i18n/worlds';
import { Icon } from '@/components/ui/Icon';

export function SiteFooter() {
  const locale = getLocale();
  const t = pick(shell, locale);
  const WORLDS = localizedWorlds(locale);
  return (
    <footer className="relative border-t border-white/[0.07] bg-ink pb-28 pt-20 lg:pb-10">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="w-16">
              <Mark sizes="64px" />
            </div>
            <p className="mt-8 font-display text-3xl leading-tight sm:text-4xl">
              {t.footer.tagline[0]}
              <br />
              <span className="italic text-gold">{t.footer.tagline[1]}</span>
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

          <FooterCol title={t.footer.worlds}>
            {WORLD_ORDER.map((id) => (
              <FooterLink key={id} href={`/worlds/${id}`}>
                {WORLDS[id].name}
              </FooterLink>
            ))}
            <FooterLink href="/collection">{t.nav.collection}</FooterLink>
            <FooterLink href="/sets">{t.nav.sets}</FooterLink>
          </FooterCol>

          <FooterCol title={t.footer.house}>
            <FooterLink href="/story">{t.footer.story}</FooterLink>
            <FooterLink href="/account">{t.footer.account}</FooterLink>
            <FooterLink href="/wishlist">{t.footer.wishlist}</FooterLink>
          </FooterCol>

          <FooterCol title={t.footer.service}>
            <FooterLink href="/legal/faq">{t.footer.faq}</FooterLink>
            <FooterLink href="/legal/contact">{t.footer.contact}</FooterLink>
            <FooterLink href="/legal/shipping">{t.footer.delivery}</FooterLink>
            <FooterLink href="/legal/returns">{t.footer.returns}</FooterLink>
            <FooterLink href="/legal/imprint">{t.footer.imprint}</FooterLink>
            <FooterLink href="/legal/privacy">{t.footer.privacy}</FooterLink>
            <FooterLink href="/legal/terms">{t.footer.terms}</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-white/[0.07] pt-8 text-[11px] uppercase tracking-[0.24em] text-fog sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} <span data-latin>{BRAND.name}</span> · {t.roots}
          </p>
          <p>{t.manifesto.join(' · ')}</p>
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
