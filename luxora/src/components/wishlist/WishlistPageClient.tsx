"use client";

import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { SiteContainer } from "@/components/shared/SiteContainer";
import { PageSection } from "@/components/shared/PageSection";
import { useWishlist } from "./WishlistProvider";
import { WishlistTableRow } from "./WishlistTableRow";
import { EmptyWishlist } from "./EmptyWishlist";
import { WishlistYouMayAlsoLike } from "./WishlistYouMayAlsoLike";
import type { SuggestedProduct } from "./WishlistAddSection";

interface WishlistPageClientProps {
  suggestedProducts: SuggestedProduct[];
}

export function WishlistPageClient({ suggestedProducts }: WishlistPageClientProps) {
  const { data: session, status } = useSession();
  const { items, isLoading, remove, ids } = useWishlist();

  const signedIn = !!session;
  const showEmpty = !isLoading && (!signedIn || items.length === 0);
  const productsToSuggest = suggestedProducts.filter((p) => !ids.has(p.id)).slice(0, 8);

  const handleRemove = (productId: string, productName?: string) => {
    void remove(productId, productName);
  };

  return (
    <div className="wishlist-page w-full min-w-0">
      <PageSection className="wishlist-page-section">
        <SiteContainer>
          <header className="wishlist-page-header">
            <div className="wishlist-page-header-main">
              <h1 className="wishlist-page-title">
                My Wishlist
                <Heart size={22} strokeWidth={1.5} className="text-[#C8A96B]" aria-hidden />
              </h1>
              <p className="wishlist-page-subtitle">
                Save your favorite fragrances and shop them anytime.
              </p>
            </div>
            {signedIn && items.length > 0 && (
              <p className="wishlist-page-count">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </p>
            )}
          </header>

          {status === "loading" || (signedIn && isLoading) ? (
            <div className="wishlist-table">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-md bg-[rgba(255,255,255,0.04)] animate-pulse border-b border-[rgba(200,169,107,0.08)]"
                  aria-hidden
                />
              ))}
            </div>
          ) : showEmpty ? (
            <EmptyWishlist signedIn={signedIn} />
          ) : (
            <div className="wishlist-table">
              <div className="wishlist-table-head" aria-hidden="true">
                <span>Product</span>
                <span>Price</span>
                <span>Stock Status</span>
                <span>Action</span>
              </div>
              <div className="wishlist-table-body">
                {items.map((item) => (
                  <WishlistTableRow
                    key={item.id}
                    item={item}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>
          )}

          <WishlistYouMayAlsoLike products={productsToSuggest} />
        </SiteContainer>
      </PageSection>
    </div>
  );
}
