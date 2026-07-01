import { Metadata } from "next";
import Link from "next/link";
import { SiteContainer } from "@/components/shared/SiteContainer";
import { PageSection } from "@/components/shared/PageSection";

export const metadata: Metadata = {
  title: "Payment Cancelled — Luxora",
};

export default function CheckoutCancelPage() {
  return (
    <div className="checkout-page w-full min-w-0">
      <PageSection className="checkout-page-section">
        <SiteContainer>
          <div className="checkout-success">
            <h1 className="checkout-page-title">Payment Cancelled</h1>
            <p className="checkout-success-text">
              Your payment was not completed. Your cart is unchanged and you can try again when
              ready.
            </p>
            <div className="checkout-success-actions">
              <Link href="/checkout" className="checkout-demo-btn">
                Return to Checkout
              </Link>
              <Link href="/cart" className="checkout-demo-btn">
                View Cart
              </Link>
            </div>
          </div>
        </SiteContainer>
      </PageSection>
    </div>
  );
}
