"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { WishlistTableRow } from "@/components/wishlist/WishlistTableRow";

export function WishlistDashboardPanel() {
  const { items, isLoading, remove } = useWishlist();

  if (isLoading) {
    return (
      <div className="dashboard-panel">
        <div className="dashboard-loading-block" aria-hidden />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="dashboard-empty">
        <Heart size={28} className="text-[#C8A96B] mx-auto mb-3" aria-hidden />
        <p className="dashboard-empty-title">Your wishlist is empty</p>
        <p className="dashboard-empty-text">Save fragrances you love and shop them anytime.</p>
        <Link href="/shop" className="dashboard-empty-btn">
          Explore Fragrances
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard-panel dashboard-wishlist-panel">
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
              key={item.productId}
              item={item}
              onRemove={(productId, productName?) => void remove(productId, productName)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
