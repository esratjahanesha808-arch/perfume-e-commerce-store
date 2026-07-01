import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { resolveProductImageUrl } from "@/lib/product-images";
import { Star, ShoppingCart } from "lucide-react";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDesc: string | null;
    price: number;
    comparePrice: number | null;
    volume: number | null;
    avgRating: number;
    reviewCount: number;
    brand: { name: string } | null;
    images: { url: string; altText: string | null }[];
  };
  badge?: "BEST SELLER" | "NEW";
}

const C = {
  cardBg:      "rgba(210, 192, 170, 1)",
  badge:       "rgba(169, 118, 54,  1)",
  badgeText:   "#fff",
  wishlist:    "rgba(156, 132, 104, 1)",
  brand:       "rgba(156, 132, 104, 1)",
  name:        "rgba(54,  44,  29,  1)",
  star:        "rgba(169, 118, 54,  1)",
  starEmpty:   "rgba(169, 118, 54,  0.25)",
  reviewCount: "rgba(147, 135, 117, 1)",
  price:       "rgba(82,  75,  61,  1)",
  priceOld:    "rgba(147, 135, 117, 1)",
  cartBorder:  "rgba(117, 96,  70,  1)",
  cartText:    "rgba(117, 96,  70,  1)",
};

export function ProductCard({ product, badge }: ProductCardProps) {
  const imageUrl = resolveProductImageUrl(
    product.images?.[0]?.url,
    product.name,
    product.slug
  );

  return (
    <article
      className="product-card group flex flex-col h-full overflow-hidden"
      style={{ background: C.cardBg, borderRadius: "6px" }}
    >
      {/* ── Image area ── */}
      <div className="relative flex-shrink-0" style={{ padding: "14px 14px 4px" }}>

        {/* Badge */}
        {badge && (
          <div
            style={{
              position: "absolute", top: "10px", left: "10px", zIndex: 10,
              background: C.badge, color: C.badgeText,
              fontSize: "8px", fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              padding: "3px 7px", borderRadius: "2px",
              whiteSpace: "nowrap",
            }}
          >
            {badge}
          </div>
        )}

        <WishlistButton
          productId={product.id}
          productName={product.name}
          variant="card"
        />

        {/* Product image — blend into card, drop shadow beneath */}
        <Link href={`/products/${product.slug}`} className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={product.images[0]?.altText ?? product.name}
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              objectFit: "contain",
              filter: "drop-shadow(0 8px 16px rgba(54,44,29,0.22))",
              transition: "transform 600ms cubic-bezier(0.33,1,0.68,1)",
              display: "block",
            }}
            className="group-hover:scale-[1.05]"
          />
        </Link>
      </div>

      {/* ── Info area ── */}
      <div
        className="flex flex-col flex-1"
        style={{ padding: "12px 14px 16px", gap: "6px" }}
      >
        {/* Brand */}
        <p style={{
          color: C.brand, fontSize: "9px", fontWeight: 700,
          letterSpacing: "0.2em", textTransform: "uppercase", lineHeight: 1,
        }}>
          {product.brand?.name ?? "LUXORA"}
        </p>

        {/* Product name — fixed 3-line height for uniform cards */}
        <Link href={`/products/${product.slug}`} className="block min-h-[3.9em]">
          <h3
            className="product-card-name group-hover:opacity-75 transition-opacity duration-200"
            style={{
              fontFamily: "var(--font-serif)",
              color: C.name,
              fontSize: "clamp(0.8125rem,1vw,0.9375rem)",
              fontWeight: 600,
            }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Stars + review count */}
        <div className="flex items-center gap-[5px]" style={{ marginTop: "3px" }}>
          <div className="flex items-center gap-[1px]">
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i < Math.floor(product.avgRating);
              const half   = !filled && i < product.avgRating;
              return (
                <Star
                  key={i}
                  size={10}
                  style={{
                    color:  C.star,
                    fill:   filled ? C.star : half ? "rgba(169,118,54,0.45)" : C.starEmpty,
                    flexShrink: 0,
                  }}
                />
              );
            })}
          </div>
          <span style={{ color: C.reviewCount, fontSize: "10px", lineHeight: 1 }}>
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2" style={{ marginTop: "4px" }}>
          <span style={{
            color: C.price,
            fontSize: "clamp(0.9375rem,1.15vw,1.0625rem)",
            fontWeight: 700,
            lineHeight: 1,
          }}>
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span style={{
              color: C.priceOld, fontSize: "12px",
              textDecoration: "line-through", fontWeight: 400,
            }}>
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Add to Cart + Wishlist — equal width */}
        <div className="product-card-actions">
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              shortDesc: product.shortDesc,
              price: product.price,
              comparePrice: product.comparePrice,
              volume: product.volume,
              avgRating: product.avgRating,
              reviewCount: product.reviewCount,
              brand: { name: product.brand?.name ?? "LUXORA" },
              images: product.images,
              badge,
            }}
            className="product-card-action-btn product-cart-btn"
            ariaLabel={`Add ${product.name} to cart`}
          >
            <ShoppingCart
              size={16}
              strokeWidth={1.75}
              className="product-cart-btn-icon"
              aria-hidden
            />
            <span className="product-cart-btn-label">Add to Cart</span>
          </AddToCartButton>

          <WishlistButton
            productId={product.id}
            productName={product.name}
            variant="card-text"
          />
        </div>
      </div>
    </article>
  );
}
