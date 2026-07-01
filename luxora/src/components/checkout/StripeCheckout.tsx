"use client";

import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

interface StripeCheckoutProps {
  clientSecret: string;
  publishableKey: string;
}

export function StripeCheckout({ clientSecret, publishableKey }: StripeCheckoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let checkoutInstance: { destroy: () => void } | null = null;

    async function mountCheckout() {
      if (!containerRef.current || !clientSecret || !publishableKey) return;

      try {
        const stripe = await loadStripe(publishableKey);
        if (!stripe || !mounted) return;

        const checkout = await stripe.createEmbeddedCheckoutPage({ clientSecret });
        checkoutInstance = checkout;
        checkout.mount(containerRef.current);
        setIsLoading(false);
      } catch (err) {
        console.error("[StripeCheckout]", err);
        if (mounted) {
          setError("Could not load secure payment form. Please refresh and try again.");
          setIsLoading(false);
        }
      }
    }

    void mountCheckout();

    return () => {
      mounted = false;
      checkoutInstance?.destroy();
    };
  }, [clientSecret, publishableKey]);

  if (error) {
    return (
      <div className="stripe-checkout-error" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="stripe-checkout-wrap">
      {isLoading && (
        <div className="stripe-checkout-loading" aria-live="polite">
          Loading secure payment…
        </div>
      )}
      <div ref={containerRef} className="stripe-checkout-container" />
    </div>
  );
}
