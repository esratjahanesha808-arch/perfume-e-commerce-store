"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteContainer } from "@/components/shared/SiteContainer";
import { PageSection } from "@/components/shared/PageSection";
import { CheckoutStepper } from "./CheckoutStepper";
import { StripeCheckout } from "./StripeCheckout";
import { CheckoutTrustBar } from "./CheckoutTrustBar";

const CHECKOUT_SECRET_KEY = "luxora-checkout-client-secret";
const CHECKOUT_ORDER_KEY = "luxora-checkout-order-number";

export function CheckoutPaymentClient() {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

  useEffect(() => {
    const secret = sessionStorage.getItem(CHECKOUT_SECRET_KEY);
    const order = sessionStorage.getItem(CHECKOUT_ORDER_KEY);

    if (!secret || !publishableKey) {
      router.replace("/checkout");
      return;
    }

    setClientSecret(secret);
    setOrderNumber(order);
  }, [publishableKey, router]);

  return (
    <div className="checkout-page w-full min-w-0">
      <PageSection className="checkout-page-section">
        <SiteContainer>
          <header className="checkout-page-header">
            <h1 className="checkout-page-title">Payment</h1>
            <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">&gt;</span>
              <Link href="/cart">Your Cart</Link>
              <span aria-hidden="true">&gt;</span>
              <Link href="/checkout">Checkout</Link>
              <span aria-hidden="true">&gt;</span>
              <span>Payment</span>
            </nav>
            {orderNumber && (
              <p className="checkout-payment-order-ref">
                Order reference: <strong>{orderNumber}</strong>
              </p>
            )}
          </header>

          <CheckoutStepper activeStep={2} />

          <div className="checkout-payment-panel">
            {clientSecret && publishableKey ? (
              <StripeCheckout clientSecret={clientSecret} publishableKey={publishableKey} />
            ) : (
              <div className="checkout-loading">
                <div className="checkout-loading-block" aria-hidden />
              </div>
            )}
          </div>

          <p className="checkout-payment-note">
            Use test card <code>4242 4242 4242 4242</code> with any future expiry and CVC in
            Stripe test mode.
          </p>
        </SiteContainer>
      </PageSection>

      <CheckoutTrustBar />
    </div>
  );
}

export { CHECKOUT_SECRET_KEY, CHECKOUT_ORDER_KEY };
