import { Metadata } from "next";
import { CheckoutPaymentClient } from "@/components/checkout/CheckoutPaymentClient";

export const metadata: Metadata = {
  title: "Payment — Luxora",
  description: "Complete your secure payment.",
};

export default function CheckoutPaymentPage() {
  return <CheckoutPaymentClient />;
}
