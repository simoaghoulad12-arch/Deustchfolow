import type { Metadata } from 'next';
import { CheckoutView } from '@/components/commerce/CheckoutView';
import { getLocale } from '@/lib/i18n/server';
import { pick } from '@/lib/i18n/copy';
import { checkout } from '@/lib/i18n/copy/checkout';

export function generateMetadata(): Metadata {
  return { title: pick(checkout, getLocale()).title, robots: { index: false } };
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-24 pt-24 sm:px-8 sm:pt-32">
      <CheckoutView />
    </div>
  );
}
