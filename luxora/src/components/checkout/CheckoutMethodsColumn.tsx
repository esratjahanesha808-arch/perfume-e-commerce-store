"use client";

import { CreditCard, Lock, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export type ShippingMethod = "standard" | "express";
export type PaymentMethod = "card" | "paypal" | "apple" | "google";

interface CheckoutMethodsColumnProps {
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  onShippingMethodChange: (method: ShippingMethod) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardName: string;
  onCardFieldChange: (field: "cardNumber" | "cardExpiry" | "cardCvv" | "cardName", value: string) => void;
}

const SHIPPING_OPTIONS: { id: ShippingMethod; label: string; price: string }[] = [
  { id: "standard", label: "Standard Shipping (5–7 days)", price: "Free" },
  { id: "express", label: "Express Shipping (2–3 days)", price: "$15.00" },
];

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; badges?: string[] }[] = [
  { id: "card", label: "Credit / Debit Card", badges: ["Visa", "MC", "Amex"] },
  { id: "paypal", label: "PayPal", badges: ["PayPal"] },
  { id: "apple", label: "Apple Pay", badges: ["Apple Pay"] },
  { id: "google", label: "Google Pay", badges: ["Google Pay"] },
];

export function CheckoutMethodsColumn({
  shippingMethod,
  paymentMethod,
  onShippingMethodChange,
  onPaymentMethodChange,
  cardNumber,
  cardExpiry,
  cardCvv,
  cardName,
  onCardFieldChange,
}: CheckoutMethodsColumnProps) {
  return (
    <div className="checkout-methods-column">
      <section className="checkout-panel checkout-panel-compact" aria-labelledby="checkout-shipping-method-heading">
        <header className="checkout-panel-header">
          <Truck size={16} strokeWidth={1.75} className="checkout-panel-icon" />
          <h2 id="checkout-shipping-method-heading" className="checkout-panel-title">
            Shipping Method
          </h2>
        </header>

        <div className="checkout-radio-stack">
          {SHIPPING_OPTIONS.map((option) => (
            <label key={option.id} className="checkout-radio-option">
              <input
                type="radio"
                name="shippingMethod"
                checked={shippingMethod === option.id}
                onChange={() => onShippingMethodChange(option.id)}
              />
              <span className="checkout-radio-control" aria-hidden="true" />
              <span className="checkout-radio-content min-w-0">
                <span className="checkout-radio-label">{option.label}</span>
              </span>
              <span className={`checkout-radio-price${option.price === "Free" ? " is-free" : ""}`}>
                {option.price}
              </span>
            </label>
          ))}
        </div>
      </section>

      <div className="checkout-methods-divider" aria-hidden="true" />

      <section className="checkout-panel checkout-panel-compact" aria-labelledby="checkout-payment-heading">
        <header className="checkout-panel-header">
          <CreditCard size={16} strokeWidth={1.75} className="checkout-panel-icon" />
          <h2 id="checkout-payment-heading" className="checkout-panel-title">
            Payment Method
          </h2>
        </header>

        <div className="checkout-radio-stack">
          {PAYMENT_OPTIONS.map((option) => (
            <label key={option.id} className="checkout-radio-option checkout-radio-option-payment">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === option.id}
                onChange={() => onPaymentMethodChange(option.id)}
              />
              <span className="checkout-radio-control" aria-hidden="true" />
              <span className="checkout-radio-label">{option.label}</span>
              {option.badges && (
                <span className="checkout-payment-badges">
                  {option.badges.map((badge) => (
                    <span key={badge}>{badge}</span>
                  ))}
                </span>
              )}
            </label>
          ))}
        </div>

        {paymentMethod === "card" && (
          <div className="checkout-card-fields">
            <p className="checkout-card-fields-title">Card Details</p>

            <label className="checkout-field">
              <span className="checkout-field-label">Card Number</span>
              <div className="checkout-input-icon-wrap">
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => onCardFieldChange("cardNumber", e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  autoComplete="cc-number"
                />
                <CreditCard size={15} strokeWidth={1.5} className="checkout-input-icon" />
              </div>
            </label>

            <div className="checkout-field-row">
              <label className="checkout-field">
                <span className="checkout-field-label">Expiry Date</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardExpiry}
                  onChange={(e) => onCardFieldChange("cardExpiry", e.target.value)}
                  placeholder="MM / YY"
                  autoComplete="cc-exp"
                />
              </label>

              <label className="checkout-field">
                <span className="checkout-field-label">CVV</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardCvv}
                  onChange={(e) => onCardFieldChange("cardCvv", e.target.value)}
                  placeholder="CVV"
                  autoComplete="cc-csc"
                />
              </label>
            </div>

            <label className="checkout-field">
              <span className="checkout-field-label">Name on Card</span>
              <input
                type="text"
                value={cardName}
                onChange={(e) => onCardFieldChange("cardName", e.target.value)}
                placeholder="Name on Card"
                autoComplete="cc-name"
              />
            </label>
          </div>
        )}

        <p className="checkout-secure-note">
          <Lock size={13} strokeWidth={1.75} />
          Your payment information is secure and encrypted.
        </p>
      </section>
    </div>
  );
}

export function getCheckoutShippingCost(method: ShippingMethod, subtotal: number) {
  if (method === "express") return 15;
  return subtotal >= 99 ? 0 : 9.99;
}

export function getCheckoutShippingLabel(method: ShippingMethod, subtotal: number) {
  const cost = getCheckoutShippingCost(method, subtotal);
  return cost === 0 ? "Free" : formatPrice(cost);
}
