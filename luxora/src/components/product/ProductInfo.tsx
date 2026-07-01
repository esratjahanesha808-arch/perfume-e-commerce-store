"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { SizeSelector } from "./SizeSelector";
import { QuantitySelector } from "./QuantitySelector";

interface ProductInfoProps {
  productId: string;
  brand: string;
  name: string;
  rating: number;
  reviewCount: number;
  price: number;
  inStock: boolean;
  description: string;
  sizes: string[];
  selectedSize: string;
  onSizeChange: (size: string) => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
}

export function ProductInfo({
  productId,
  brand,
  name,
  rating,
  reviewCount,
  price,
  inStock,
  description,
  sizes,
  selectedSize,
  onSizeChange,
  quantity,
  onQuantityChange,
  onAddToCart,
}: ProductInfoProps) {
  const fullStars = Math.floor(rating);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
      className="w-full min-w-0 max-w-full pdp-info-stack"
    >
      {/* 1. Product name (larger) */}
      <h1 className="font-serif text-[1.35rem] sm:text-[1.5rem] md:text-[1.625rem] leading-tight tracking-wide text-[#F3EFE6] break-words">
        {name}
      </h1>

      {/* 2. Brand (smaller than name) */}
      <p className="text-[9px] sm:text-[10px] tracking-[0.28em] text-[#C8A96B] uppercase font-bold">
        {brand}
      </p>

      {/* 3. Stars + reviews — one line */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={13}
              className={
                i < fullStars
                  ? "text-[#C8A96B] fill-[#C8A96B]"
                  : "text-[rgba(200,169,107,0.25)]"
              }
            />
          ))}
        </div>
        <span className="text-[11px] text-[#A1A1A1] font-medium">
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
      </div>

      {/* 4. Price + stock — one line */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="text-xl md:text-2xl font-semibold text-[#F5F5F5] tracking-wide">
          {formatPrice(price)}
        </span>
        {inStock ? (
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-emerald-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
            In stock
          </span>
        ) : (
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#A1A1A1]">
            Out of stock
          </span>
        )}
      </div>

      {/* 5. Short description */}
      {description ? (
        <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed font-normal">{description}</p>
      ) : null}

      {/* 6. Size label (cream) + size cards in one row */}
      <SizeSelector sizes={sizes} selected={selectedSize} onChange={onSizeChange} />

      {/* 7. Quantity label (cream) + +/- on same line */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="pdp-info-label mb-0">Quantity</span>
        <QuantitySelector quantity={quantity} onChange={onQuantityChange} showLabel={false} />
      </div>

      {/* 8. Add to cart + wishlist — one line */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onAddToCart}
            disabled={!inStock}
            className="flex-1 h-12 sm:h-14 bg-[#C8A96B] hover:bg-[#D7B45D] text-[#090909] font-bold text-[10px] sm:text-xs tracking-[0.2em] uppercase transition-all duration-300 rounded-md shadow-lg shadow-[rgba(200,169,107,0.1)] cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
          <WishlistButton productId={productId} productName={name} variant="pdp" />
        </div>
        <p className="text-[10px] text-[#A1A1A1] tracking-wide text-center sm:text-left">
          Tap the heart to add this fragrance to your wishlist
        </p>
      </div>
    </motion.div>
  );
}
