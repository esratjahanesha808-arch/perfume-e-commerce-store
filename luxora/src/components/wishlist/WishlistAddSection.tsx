"use client";

import { ProductCard } from "@/components/shared/ProductCard";

type SuggestedProduct = {
  id: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  price: number;
  comparePrice: number | null;
  volume: number | null;
  avgRating: number;
  reviewCount: number;
  brand: { name: string };
  images: { url: string; altText: string | null }[];
  badge?: "BEST SELLER" | "NEW";
};

interface WishlistAddSectionProps {
  products: SuggestedProduct[];
  title?: string;
  subtitle?: string;
}

export function WishlistAddSection({
  products,
  title = "Add to Your Wishlist",
  subtitle = "Tap Wishlist on any fragrance below to save it here.",
}: WishlistAddSectionProps) {
  if (products.length === 0) return null;

  return (
    <section
      className="mt-[var(--sp-24)] pt-[var(--sp-24)] border-t border-[rgba(200,169,107,0.12)]"
      aria-labelledby="wishlist-add-heading"
    >
      <header className="text-center mb-10">
        <h2
          id="wishlist-add-heading"
          className="font-serif text-xl md:text-2xl tracking-[0.12em] text-[#F3EFE6] uppercase"
        >
          {title}
        </h2>
        <p className="text-sm text-[#A1A1A1] mt-3 max-w-lg mx-auto">{subtitle}</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 items-stretch">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} badge={product.badge} />
        ))}
      </div>
    </section>
  );
}

export type { SuggestedProduct };
