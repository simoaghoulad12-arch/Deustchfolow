'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';

// Module-level singleton — loadStripe() must only be called once per
// publishable key, never per render (Stripe.js docs).
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise: Promise<Stripe | null> | null = publishableKey ? loadStripe(publishableKey) : null;

function PayButton() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    // `redirect: 'if_required'` — most EU cards go through 3DS and
    // Stripe redirects itself; only methods that complete synchronously
    // (no redirect needed) return here, and we send the user on
    // manually so a successful in-browser confirmation doesn't also
    // need a full page redirect round-trip.
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/bookings?paid=1` },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Zahlung fehlgeschlagen. Bitte versuche es erneut.');
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      router.push('/bookings?paid=1');
      return;
    }

    setError('Zahlung konnte nicht abgeschlossen werden. Bitte versuche es erneut.');
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <FormMessage type="error">{error}</FormMessage>}
      <Button type="submit" disabled={!stripe || submitting} className="w-full">
        {submitting ? 'Zahlung wird verarbeitet…' : 'Jetzt bezahlen'}
      </Button>
    </form>
  );
}

export function BookingPaymentForm({ clientSecret }: { clientSecret: string }) {
  if (!stripePromise) {
    return (
      <FormMessage type="error">
        Zahlungen sind aktuell nicht verfügbar (Stripe ist nicht konfiguriert).
      </FormMessage>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PayButton />
    </Elements>
  );
}
