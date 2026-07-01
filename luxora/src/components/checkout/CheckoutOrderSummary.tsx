"use client";

import Link from "next/link";
import { Lock, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { resolveProductImageUrl } from "@/lib/product-images";
import type { CartLine } from "@/stores/cart-store";
import {
  getCheckoutShippingCost,
  getCheckoutShippingLabel,
  type ShippingMethod,
} from "./CheckoutMethodsColumn";

interface CheckoutOrderSummaryProps {
  items: CartLine[];
  subtotal: number;
  shippingMethod: ShippingMethod;
  couponCode: string;
  appliedCouponCode: string | null;
  discountAmount: number;
  adjustedShippingCost: number | null;
  onCouponCodeChange: (value: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  isApplyingCoupon?: boolean;
  onPlaceOrder: () => void;
  isSubmitting?: boolean;
}

export function CheckoutOrderSummary({
  items,
  subtotal,
  shippingMethod,
  couponCode,
  appliedCouponCode,
  discountAmount,
  adjustedShippingCost,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
  isApplyingCoupon = false,
  onPlaceOrder,
  isSubmitting = false,
}: CheckoutOrderSummaryProps) {
  const baseShippingCost = getCheckoutShippingCost(shippingMethod, subtotal);
  const shippingCost = adjustedShippingCost ?? baseShippingCost;
  const shippingLabel =
    shippingCost === 0
      ? "Free"
      : getCheckoutShippingLabel(shippingMethod, subtotal);
  const tax = 0;
  const total = subtotal - discountAmount + shippingCost + tax;

  return (
    <aside className="checkout-summary" aria-labelledby="checkout-summary-heading">
      <header className="checkout-panel-header">
        <ShoppingBag size={16} strokeWidth={1.75} className="checkout-panel-icon" />
        <h2 id="checkout-summary-heading" className="checkout-panel-title">
          Order Summary
        </h2>
      </header>

      <ul className="checkout-summary-items">
        {items.map((item) => {
          const { product, quantity } = item;
          const imageUrl = resolveProductImageUrl(
            product.images?.[0]?.url,
            product.name,
            product.slug
          );
          const sizeLabel = product.volume ? `${product.volume}ml` : "100ml";
          const brandLabel = product.brand?.name ?? "LUXORA";

          return (
            <li key={item.productId} className="checkout-summary-item">
              <div className="checkout-summary-item-image-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={product.images[0]?.altText ?? product.name}
                  className="checkout-summary-item-image"
                />
              </div>

              <div className="checkout-summary-item-info min-w-0">
                <p className="checkout-summary-item-name">{product.name}</p>
                <p className="checkout-summary-item-meta">
                  {brandLabel} ({sizeLabel})
                </p>
                <p className="checkout-summary-item-qty">Qty: {quantity}</p>
              </div>

              <span className="checkout-summary-item-price">
                {formatPrice(product.price * quantity)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="checkout-coupon-box">
        <label htmlFor="checkout-coupon-code" className="checkout-coupon-label">
          Coupon code
        </label>
        <div className="checkout-coupon-row">
          <input
            id="checkout-coupon-code"
            type="text"
            value={couponCode}
            placeholder="Enter code"
            className="checkout-coupon-input"
            onChange={(event) => onCouponCodeChange(event.target.value.toUpperCase())}
            disabled={Boolean(appliedCouponCode) || isApplyingCoupon}
          />
          {appliedCouponCode ? (
            <button
              type="button"
              className="checkout-coupon-btn checkout-coupon-btn-remove"
              onClick={onRemoveCoupon}
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              className="checkout-coupon-btn"
              onClick={onApplyCoupon}
              disabled={!couponCode.trim() || isApplyingCoupon}
            >
              {isApplyingCoupon ? "Applying…" : "Apply"}
            </button>
          )}
        </div>
        {appliedCouponCode && (
          <p className="checkout-coupon-applied">
            Applied: <strong>{appliedCouponCode}</strong>
          </p>
        )}
      </div>

      <dl className="checkout-summary-lines">
        <div className="checkout-summary-line">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        {discountAmount > 0 && (
          <div className="checkout-summary-line checkout-summary-line-discount">
            <dt>Discount</dt>
            <dd>-{formatPrice(discountAmount)}</dd>
          </div>
        )}
        <div className="checkout-summary-line">
          <dt>Shipping</dt>
          <dd className={shippingCost === 0 ? "is-free" : undefined}>{shippingLabel}</dd>
        </div>
        <div className="checkout-summary-line">
          <dt>Tax</dt>
          <dd>{formatPrice(tax)}</dd>
        </div>
      </dl>

      <div className="checkout-summary-total-row">
        <span className="checkout-summary-total-label">Total</span>
        <strong>{formatPrice(total)}</strong>
      </div>

      <div className="checkout-summary-footer">
        <button
          type="button"
          className="checkout-place-order-btn"
          onClick={onPlaceOrder}
          disabled={isSubmitting || items.length === 0}
        >
          {isSubmitting ? "Preparing Payment…" : "Continue to Payment"}
        </button>

        <p className="checkout-legal-note">
          <Lock size={12} strokeWidth={1.75} aria-hidden="true" />
          <span>
            By placing your order, you agree to our{" "}
            <Link href="/terms">Terms &amp; Conditions</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </span>
        </p>
      </div>
    </aside>
  );
}
