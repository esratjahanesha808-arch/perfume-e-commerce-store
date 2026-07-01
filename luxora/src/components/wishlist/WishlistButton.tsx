"use client";

import { Heart } from "lucide-react";
import { useWishlistToggle } from "./WishlistProvider";

interface WishlistButtonProps {
  productId: string;
  productName?: string;
  variant?: "card" | "card-inline" | "card-text" | "pdp" | "header";
  className?: string;
  iconSize?: number;
  style?: React.CSSProperties;
}

const cardColor = "rgba(156, 132, 104, 1)";
const cartBorder = "rgba(117, 96, 70, 1)";

export function WishlistButton({
  productId,
  productName,
  variant = "card",
  className = "",
  iconSize,
  style,
}: WishlistButtonProps) {
  const { wishlisted, handleToggle, isAuthenticated } = useWishlistToggle(productId, productName);
  const size = iconSize ?? (variant === "pdp" ? 18 : variant === "card-inline" ? 14 : 15);
  const label = wishlisted ? "Saved" : "Wishlist";

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void handleToggle();
        }}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
        title={isAuthenticated ? (wishlisted ? "Remove from wishlist" : "Add to wishlist") : "Sign in to save to wishlist"}
        className={className}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 10,
          background: "rgba(255,255,255,0.92)",
          border: `1px solid ${wishlisted ? "rgba(169, 118, 54, 0.55)" : "rgba(117, 96, 70, 0.25)"}`,
          borderRadius: "999px",
          cursor: "pointer",
          color: wishlisted ? "rgba(169, 118, 54, 1)" : cardColor,
          padding: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(54,44,29,0.12)",
          ...style,
        }}
      >
        <Heart size={size} strokeWidth={1.75} className={wishlisted ? "fill-current" : ""} />
      </button>
    );
  }

  if (variant === "card-inline") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void handleToggle();
        }}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
        title={isAuthenticated ? (wishlisted ? "Remove from wishlist" : "Add to wishlist") : "Sign in to save to wishlist"}
        className={className}
        style={{
          width: "34px",
          height: "34px",
          border: `1px solid ${wishlisted ? "rgba(169, 118, 54, 0.65)" : cartBorder}`,
          color: wishlisted ? "rgba(169, 118, 54, 1)" : cartBorder,
          background: wishlisted ? "rgba(169, 118, 54, 0.12)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "background 150ms ease, color 150ms ease, border-color 150ms ease",
          borderRadius: "0",
          flexShrink: 0,
          ...style,
        }}
      >
        <Heart size={size} strokeWidth={1.5} className={wishlisted ? "fill-current" : ""} />
      </button>
    );
  }

  if (variant === "card-text") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void handleToggle();
        }}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
        data-active={wishlisted ? "true" : "false"}
        className={`product-card-wishlist-btn ${className}`}
        style={style}
      >
        <Heart size={12} strokeWidth={1.5} className={wishlisted ? "fill-current" : ""} />
        {label}
      </button>
    );
  }

  if (variant === "pdp") {
    return (
      <button
        type="button"
        onClick={() => void handleToggle()}
        className={`w-12 sm:w-14 h-12 sm:h-14 rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer active:scale-[0.98] ${
          wishlisted
            ? "bg-[rgba(172,125,69,0.15)] border-[#C8A96B] text-[#C8A96B]"
            : "bg-[#111111] border-[rgba(200,169,107,0.15)] text-[#A1A1A1] hover:border-[#C8A96B] hover:text-[#C8A96B]"
        } ${className}`}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
      >
        <Heart size={size} className={wishlisted ? "fill-[#C8A96B]" : ""} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      className={className}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      style={style}
    >
      <Heart size={size} strokeWidth={1.5} className={wishlisted ? "fill-current" : ""} />
    </button>
  );
}
