import type { Metadata } from 'next';
import Link from 'next/link';
import { Mark } from '@/components/brand/Mark';
import { COMMERCE } from '@/lib/commerce/provider';
import { SOCIAL } from '@/lib/brand';

export const metadata: Metadata = { title: 'Account', robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="mx-auto flex min-h-[85svh] max-w-xl flex-col items-center justify-center px-5 pb-28 pt-28 text-center">
      <div className="w-16">
        <Mark sizes="64px" />
      </div>
      <p className="label mt-10 text-gold">Account</p>
      <h1 className="mt-4 font-display text-5xl leading-none sm:text-6xl">Members open at launch.</h1>
      {COMMERCE.accountsEnabled ? null : (
        <p className="mt-6 text-sm leading-relaxed text-mist">
          Customer accounts, order history and saved addresses go live with the Collection 01 store. Until then your bag and wishlist are kept on this device.
        </p>
      )}
      <div className="mt-10 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
        <Link href="/wishlist" className="btn-line">
          View wishlist
        </Link>
        <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="btn-solid">
          Launch news on Instagram
        </a>
      </div>
    </div>
  );
}
