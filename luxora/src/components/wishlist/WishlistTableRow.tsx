"use client";

import Link from "next/link";
import { Star, ShoppingBag, Heart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { resolveProductImageUrl } from "@/lib/product-images";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "./WishlistProvider";
import type { WishlistItem } from "./WishlistProvider";

interface WishlistTableRowProps {
  item: WishlistItem;
  onRemove: (productId: string, productName?: string) => void;
}

const STAR = "rgba(196, 154, 69, 1)";
const STAR_EMPTY = "rgba(196, 154, 69, 0.25)";

export function WishlistTableRow({ item, onRemove }: WishlistTableRowProps) {
  const { product } = item;
  const { addItem } = useCart();
  const { remove } = useWishlist();

  const handleMoveToCart = async () => {
    await addItem(product);
    // Silently remove from wishlist — cart add already shows "Added to cart" toast
    await remove(product.id);
  };
  const imageUrl = resolveProductImageUrl(
    product.images?.[0]?.url,
    product.name,
    product.slug
  );
  const sizeLabel = product.volume ? `${product.volume}ml` : "100ml";
  const stockStatus = product.status ?? "in_stock";
  const stockLabel = product.label ?? "In Stock";
  const stockClass =
    stockStatus === "out_of_stock"
      ? "wishlist-row-stock wishlist-row-stock--out"
      : stockStatus === "low_stock"
        ? "wishlist-row-stock wishlist-row-stock--low"
        : "wishlist-row-stock";

  return (
    <article className="wishlist-table-row">
      <div className="wishlist-col-product">
        <Link
          href={`/products/${product.slug}`}
          className="wishlist-row-image-wrap"
        >
          {product.badge && (
            <span className="wishlist-row-badge">{product.badge}</span>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={product.images[0]?.altText ?? product.name}
            className="wishlist-row-image"
          />
        </Link>

        <div className="wishlist-row-info min-w-0">
          <Link href={`/products/${product.slug}`}>
            <h3 className="wishlist-row-name">{product.name}</h3>
          </Link>
          <p className="wishlist-row-brand">{product.brand?.name ?? "LUXORA"}</p>
          <div className="wishlist-row-rating">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < Math.floor(product.avgRating);
                const half = !filled && i < product.avgRating;
                return (
                  <Star
                    key={i}
                    size={12}
                    style={{
                      color: STAR,
                      fill: filled ? STAR : half ? "rgba(196,154,69,0.45)" : STAR_EMPTY,
                    }}
                  />
                );
              })}
            </div>
            <span className="wishlist-row-reviews">({product.reviewCount})</span>
          </div>
          <p className="wishlist-row-size">Size: {sizeLabel}</p>
        </div>
      </div>

      <div className="wishlist-col-price">
        <span className="wishlist-row-price">{formatPrice(product.price)}</span>
      </div>

      <div className="wishlist-col-stock">
        <span className={stockClass}>{stockLabel}</span>
      </div>

      <div className="wishlist-col-action">
        <div className="wishlist-row-actions">
          <div className="wishlist-row-buttons">
            <button
              type="button"
              onClick={() => void handleMoveToCart()}
              className="wishlist-add-cart-btn"
            >
              <ShoppingBag size={14} strokeWidth={1.75} />
              Add to Cart
            </button>
            <button
              type="button"
              onClick={() => onRemove(product.id, product.name)}
              className="wishlist-remove-btn"
            >
              Remove
            </button>
          </div>
          <button
            type="button"
            onClick={() => onRemove(product.id, product.name)}
            className="wishlist-row-heart"
            aria-label={`Remove ${product.name} from wishlist`}
          >
            <Heart size={16} className="fill-[#C8A96B]" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </article>
  );
}
