import { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout — Luxora",
  description: "Complete your luxury fragrance order securely.",
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
