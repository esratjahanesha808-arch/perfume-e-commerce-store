"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getShippingCost, getShippingLabel } from "@/stores/cart-store";

interface CartSummaryProps {
  subtotal: number;
}

export function CartSummary({ subtotal }: CartSummaryProps) {
  const shippingCost = getShippingCost(subtotal);
  const shippingLabel = getShippingLabel(subtotal);
  const tax = 0;
  const total = subtotal + shippingCost + tax;

  return (
    <aside className="cart-summary">
      <div className="cart-summary-deco" aria-hidden="true" />

      <h2 className="cart-summary-title">Cart Totals</h2>

      <dl className="cart-summary-lines">
        <div className="cart-summary-line">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="cart-summary-line">
          <dt>Shipping</dt>
          <dd className={shippingCost === 0 ? "cart-summary-free" : undefined}>
            {shippingLabel}
          </dd>
        </div>
        <div className="cart-summary-line">
          <dt>Tax</dt>
          <dd>{formatPrice(tax)}</dd>
        </div>
      </dl>

      <div className="cart-summary-total-row">
        <span>Total</span>
        <strong>{formatPrice(total)}</strong>
      </div>

      <Link href="/checkout" className="cart-checkout-btn">
        <Lock size={14} strokeWidth={1.75} />
        Proceed to Checkout
      </Link>

      <div className="cart-payment-note">
        <p>We Accept</p>
        <div className="cart-payment-icons">
          <span>Visa</span>
          <span>Mastercard</span>
          <span>PayPal</span>
          <span>Apple Pay</span>
        </div>
      </div>
    </aside>
  );
}
