"use client";

import { Minus, Plus } from "lucide-react";

interface CartQuantityControlProps {
  quantity: number;
  onChange: (quantity: number) => void;
  max?: number;
}

export function CartQuantityControl({
  quantity,
  onChange,
  max = 99,
}: CartQuantityControlProps) {
  return (
    <div className="cart-qty-control">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
        className="cart-qty-btn"
        aria-label="Decrease quantity"
      >
        <Minus size={12} />
      </button>
      <span className="cart-qty-value" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="cart-qty-btn"
        aria-label="Increase quantity"
      >
        <Plus size={12} />
      </button>
    </div>
  );
}
