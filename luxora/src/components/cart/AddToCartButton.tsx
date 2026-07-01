"use client";

import type { CartProduct } from "@/stores/cart-store";
import { useAddToCart } from "./CartProvider";

interface AddToCartButtonProps {
  product: CartProduct;
  quantity?: number;
  className?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
}

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  children,
  ariaLabel = "Add to cart",
}: AddToCartButtonProps) {
  const addItem = useAddToCart();

  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void addItem(product, quantity);
      }}
    >
      {children ?? "Add to Cart"}
    </button>
  );
}
