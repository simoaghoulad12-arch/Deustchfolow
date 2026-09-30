import type { Metadata } from 'next';
import { CheckoutView } from '@/components/commerce/CheckoutView';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-24 pt-24 sm:px-8 sm:pt-32">
      <CheckoutView />
    </div>
  );
}
