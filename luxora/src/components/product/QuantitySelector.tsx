"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  max?: number;
  showLabel?: boolean;
  className?: string;
}

export function QuantitySelector({
  quantity,
  onChange,
  max = 99,
  showLabel = true,
  className,
}: QuantitySelectorProps) {
  const decrease = () => onChange(Math.max(1, quantity - 1));
  const increase = () => onChange(Math.min(max, quantity + 1));

  return (
    <div className={cn(className)}>
      {showLabel && (
        <h4 className="text-[10px] tracking-[0.25em] text-[#C8A96B] uppercase font-bold mb-3">
          Quantity
        </h4>
      )}
      <div className="inline-flex items-center bg-[#111111] border border-[rgba(200,169,107,0.15)] rounded-md w-fit overflow-hidden">
        <button
          type="button"
          onClick={decrease}
          disabled={quantity <= 1}
          className="w-10 h-10 flex items-center justify-center text-[#A1A1A1] hover:text-[#C8A96B] hover:bg-[rgba(172,125,69,0.05)] transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Decrease quantity"
        >
          <Minus size={12} />
        </button>
        <span
          className="w-12 text-center text-xs font-bold text-[#F5F5F5] tabular-nums"
          aria-live="polite"
          aria-atomic="true"
        >
          {quantity}
        </span>
        <button
          type="button"
          onClick={increase}
          disabled={quantity >= max}
          className="w-10 h-10 flex items-center justify-center text-[#A1A1A1] hover:text-[#C8A96B] hover:bg-[rgba(172,125,69,0.05)] transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Increase quantity"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}
