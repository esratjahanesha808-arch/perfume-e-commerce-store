"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { SiteContainer } from "@/components/shared/SiteContainer";
import { PageSection } from "@/components/shared/PageSection";
import { useCart } from "@/components/cart/CartProvider";
import { DEMO_CARD, DEMO_SHIPPING } from "@/lib/checkout-demo";
import { CheckoutStepper } from "./CheckoutStepper";
import { CheckoutShippingForm, type ShippingFormValues } from "./CheckoutShippingForm";
import {
  CheckoutMethodsColumn,
  type PaymentMethod,
  type ShippingMethod,
} from "./CheckoutMethodsColumn";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";
import {
  CHECKOUT_ORDER_KEY,
  CHECKOUT_SECRET_KEY,
} from "./CheckoutPaymentClient";
import { CheckoutTrustBar } from "./CheckoutTrustBar";

const isDev = process.env.NODE_ENV === "development";

const EMPTY_SHIPPING: ShippingFormValues = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "United States",
  zip: "",
  saveInfo: true,
};

export function CheckoutPageClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, isLoading } = useCart();

  const [shipping, setShipping] = useState<ShippingFormValues>(EMPTY_SHIPPING);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [adjustedShippingCost, setAdjustedShippingCost] = useState<number | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const isEmpty = !isLoading && items.length === 0;

  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.replace("/cart");
    }
  }, [isLoading, items.length, router]);

  useEffect(() => {
    if (session?.user?.email && !shipping.email) {
      setShipping((prev) => ({
        ...prev,
        email: session.user?.email ?? "",
        fullName: session.user?.name ?? prev.fullName,
      }));
    }
  }, [session, shipping.email]);

  const handleShippingChange = (
    field: keyof ShippingFormValues,
    value: string | boolean
  ) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const handleCardFieldChange = (
    field: "cardNumber" | "cardExpiry" | "cardCvv" | "cardName",
    value: string
  ) => {
    if (field === "cardNumber") setCardNumber(value);
    if (field === "cardExpiry") setCardExpiry(value);
    if (field === "cardCvv") setCardCvv(value);
    if (field === "cardName") setCardName(value);
  };

  const fillDemoData = () => {
    setShipping({
      ...DEMO_SHIPPING,
      email: session?.user?.email ?? DEMO_SHIPPING.email,
      fullName: session?.user?.name ?? DEMO_SHIPPING.fullName,
    });
    setCardNumber(DEMO_CARD.cardNumber);
    setCardExpiry(DEMO_CARD.cardExpiry);
    setCardCvv(DEMO_CARD.cardCvv);
    setCardName(DEMO_CARD.cardName);
    setPaymentMethod("card");
    toast.success("Demo checkout details filled — safe for testing.");
  };

  const clearAppliedCoupon = () => {
    setAppliedCouponCode(null);
    setDiscountAmount(0);
    setAdjustedShippingCost(null);
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;

    setIsApplyingCoupon(true);
    try {
      const res = await fetch("/api/v1/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal, shippingMethod }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message ?? "Invalid coupon code");
        return;
      }

      setAppliedCouponCode(code.toUpperCase());
      setDiscountAmount(json.data.discountAmount);
      setAdjustedShippingCost(json.data.shippingCost);
      toast.success(`Coupon ${code.toUpperCase()} applied`);
    } catch {
      toast.error("Could not validate coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    clearAppliedCoupon();
    toast.message("Coupon removed");
  };

  useEffect(() => {
    if (!appliedCouponCode) return;

    void (async () => {
      try {
        const res = await fetch("/api/v1/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: appliedCouponCode,
            subtotal,
            shippingMethod,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          clearAppliedCoupon();
          return;
        }
        setDiscountAmount(json.data.discountAmount);
        setAdjustedShippingCost(json.data.shippingCost);
      } catch {
        clearAppliedCoupon();
      }
    })();
  }, [appliedCouponCode, shippingMethod, subtotal]);

  const handlePlaceOrder = async () => {
    const required: (keyof ShippingFormValues)[] = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "country",
      "zip",
    ];

    const missing = required.filter((field) => !String(shipping[field]).trim());
    if (missing.length > 0) {
      toast.error("Please complete all shipping fields before placing your order.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        shipping,
        shippingMethod,
        paymentMethod,
        ...(appliedCouponCode ? { couponCode: appliedCouponCode } : {}),
      };

      const res = await fetch("/api/v1/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.error?.code === "STRIPE_NOT_CONFIGURED") {
          toast.error(
            "Stripe is not configured. Add your Stripe test keys to .env.local to enable payments."
          );
          return;
        }
        toast.error(json.error?.message ?? "Could not start payment.");
        return;
      }

      sessionStorage.setItem(CHECKOUT_SECRET_KEY, json.data.clientSecret);
      sessionStorage.setItem(CHECKOUT_ORDER_KEY, json.data.orderNumber);
      router.push("/checkout/payment");
    } catch {
      toast.error("Could not start payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const panelContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="checkout-loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="checkout-loading-block" aria-hidden />
          ))}
        </div>
      );
    }

    if (isEmpty) return null;

    return (
      <div className="checkout-columns-grid">
        <div className="checkout-column-card">
          <CheckoutShippingForm values={shipping} onChange={handleShippingChange} />
        </div>

        <div className="checkout-column-card">
          <CheckoutMethodsColumn
            shippingMethod={shippingMethod}
            paymentMethod={paymentMethod}
            onShippingMethodChange={setShippingMethod}
            onPaymentMethodChange={setPaymentMethod}
            cardNumber={cardNumber}
            cardExpiry={cardExpiry}
            cardCvv={cardCvv}
            cardName={cardName}
            onCardFieldChange={handleCardFieldChange}
          />
        </div>

        <div className="checkout-column-card checkout-column-card-summary">
          <CheckoutOrderSummary
            items={items}
            subtotal={subtotal}
            shippingMethod={shippingMethod}
            couponCode={couponCode}
            appliedCouponCode={appliedCouponCode}
            discountAmount={discountAmount}
            adjustedShippingCost={adjustedShippingCost}
            onCouponCodeChange={setCouponCode}
            onApplyCoupon={() => void handleApplyCoupon()}
            onRemoveCoupon={handleRemoveCoupon}
            isApplyingCoupon={isApplyingCoupon}
            onPlaceOrder={() => void handlePlaceOrder()}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    );
  }, [
    isLoading,
    isEmpty,
    shipping,
    shippingMethod,
    paymentMethod,
    cardNumber,
    cardExpiry,
    cardCvv,
    cardName,
    items,
    subtotal,
    couponCode,
    appliedCouponCode,
    discountAmount,
    adjustedShippingCost,
    isApplyingCoupon,
    isSubmitting,
  ]);

  return (
    <div className="checkout-page w-full min-w-0">
      <PageSection className="checkout-page-section">
        <SiteContainer>
          <header className="checkout-page-header">
            <h1 className="checkout-page-title">Checkout</h1>
            <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">&gt;</span>
              <Link href="/cart">Your Cart</Link>
              <span aria-hidden="true">&gt;</span>
              <span>Checkout</span>
            </nav>
            {isDev && (
              <button type="button" className="checkout-demo-btn" onClick={fillDemoData}>
                Fill demo details (test)
              </button>
            )}
          </header>

          <CheckoutStepper activeStep={1} />

          {panelContent}
        </SiteContainer>
      </PageSection>

      <CheckoutTrustBar />
    </div>
  );
}
