import { Metadata } from "next";
import { getFeaturedProducts } from "@/services/product.service";
import { toProductCard } from "@/lib/serialize-product";
import { WishlistPageClient } from "@/components/wishlist/WishlistPageClient";

export const metadata: Metadata = {
  title: "My Wishlist — Luxora",
  description: "View and manage your saved luxury fragrances.",
};

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const featured = await getFeaturedProducts(12);
  const suggestedProducts = featured.map((p) => toProductCard(p));

  return <WishlistPageClient suggestedProducts={suggestedProducts} />;
}
