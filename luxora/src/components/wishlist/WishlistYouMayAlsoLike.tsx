"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/shared/ProductCard";
import type { SuggestedProduct } from "./WishlistAddSection";

interface WishlistYouMayAlsoLikeProps {
  products: SuggestedProduct[];
}

export function WishlistYouMayAlsoLike({ products }: WishlistYouMayAlsoLikeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  function scrollBy(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-carousel-card]");
    const step = card ? card.offsetWidth + 16 : 280;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <section className="wishlist-related-section" aria-labelledby="wishlist-related-heading">
      <div className="home-section-heading relative">
        <div className="home-section-heading-line" aria-hidden="true" />
        <h2 id="wishlist-related-heading" className="home-section-heading-title">
          You May Also Like
        </h2>
        <div className="home-section-heading-line" aria-hidden="true" />
      </div>

      <div className="wishlist-carousel-wrap">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          className="wishlist-carousel-arrow wishlist-carousel-arrow-left"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>

        <div ref={trackRef} className="wishlist-carousel-track">
          {products.map((product) => (
            <div key={product.id} data-carousel-card className="wishlist-carousel-card">
              <ProductCard product={product} badge={product.badge} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollBy(1)}
          className="wishlist-carousel-arrow wishlist-carousel-arrow-right"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}
