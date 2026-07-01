import { Metadata } from "next";
import { CartPageClient } from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Your Cart — Luxora",
  description: "Review items in your luxury fragrance cart.",
};

export default function CartPage() {
  return <CartPageClient />;
}
