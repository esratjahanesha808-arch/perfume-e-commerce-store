"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SiteContainer } from "@/components/shared/SiteContainer";
import { PageSection } from "@/components/shared/PageSection";
import { useCart } from "@/components/cart/CartProvider";
import {
  CHECKOUT_ORDER_KEY,
  CHECKOUT_SECRET_KEY,
} from "./CheckoutPaymentClient";

export function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const legacyOrder = searchParams.get("order");
  const { refresh } = useCart();

  const [orderNumber, setOrderNumber] = useState<string | null>(legacyOrder);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(sessionId));

  useEffect(() => {
    sessionStorage.removeItem(CHECKOUT_SECRET_KEY);
    sessionStorage.removeItem(CHECKOUT_ORDER_KEY);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    const id = sessionId;

    let cancelled = false;

    async function loadSession() {
      try {
        const res = await fetch(`/api/v1/checkout/session/${encodeURIComponent(id)}`);
        const json = await res.json();

        if (!cancelled && res.ok) {
          setOrderNumber(json.data?.orderNumber ?? null);
          setPaymentStatus(json.data?.paymentStatus ?? null);
          await refresh();
        } else if (!cancelled) {
          const message =
            json?.error?.message ??
            (res.status === 503
              ? "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local."
              : "Could not confirm payment with the server.");
          toast.error(message);
          setPaymentStatus("failed");
        }
      } catch {
        if (!cancelled) {
          setPaymentStatus("unknown");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [sessionId, refresh]);

  const isPaid = paymentStatus === "paid" || (!sessionId && Boolean(legacyOrder));

  return (
    <div className="checkout-page w-full min-w-0">
      <PageSection className="checkout-page-section">
        <SiteContainer>
          <div className="checkout-success">
            <h1 className="checkout-page-title">
              {isPaid ? "Order Confirmed" : "Processing Payment"}
            </h1>

            {isLoading ? (
              <p className="checkout-success-text">Confirming your payment…</p>
            ) : (
              <p className="checkout-success-text">
                {isPaid ? (
                  <>
                    Thank you for your order
                    {orderNumber ? (
                      <>
                        {" "}
                        <strong>{orderNumber}</strong>
                      </>
                    ) : null}
                    . Your payment was received and your order is confirmed.
                  </>
                ) : (
                  <>
                    We are still processing your payment
                    {orderNumber ? (
                      <>
                        {" "}
                        for <strong>{orderNumber}</strong>
                      </>
                    ) : null}
                    . You will receive a confirmation email once payment completes.
                  </>
                )}
              </p>
            )}

            <div className="checkout-success-actions">
              <Link href="/shop" className="checkout-demo-btn">
                Continue Shopping
              </Link>
            </div>
          </div>
        </SiteContainer>
      </PageSection>
    </div>
  );
}
