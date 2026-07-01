"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { resolveProductImageUrl } from "@/lib/product-images";
import { CartQuantityControl } from "./CartQuantityControl";
import type { CartLine } from "@/stores/cart-store";

interface CartTableRowProps {
  item: CartLine;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string, productName: string) => void;
}

export function CartTableRow({ item, onUpdateQuantity, onRemove }: CartTableRowProps) {
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;
  const imageUrl = resolveProductImageUrl(
    product.images?.[0]?.url,
    product.name,
    product.slug
  );
  const sizeLabel = product.volume ? `${product.volume}ml` : "100ml";
  const brandLabel = product.brand?.name ?? "LUXORA";

  return (
    <article className="cart-table-row">
      <div className="cart-col-product">
        <Link href={`/products/${product.slug}`} className="cart-row-image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={product.images[0]?.altText ?? product.name}
            className="cart-row-image"
          />
        </Link>

        <div className="cart-row-info min-w-0">
          <Link href={`/products/${product.slug}`}>
            <h3 className="cart-row-name">{product.name}</h3>
          </Link>
          <p className="cart-row-meta">
            {brandLabel} ({sizeLabel})
          </p>
          <p className={`cart-row-stock ${item.inStock ? "in-stock" : "out-of-stock"}`}>
            <span className="cart-row-stock-dot" aria-hidden />
            {item.inStock ? "In Stock" : "Out of Stock"}
          </p>
        </div>
      </div>

      <div className="cart-col-price">
        <span className="cart-row-price">{formatPrice(product.price)}</span>
      </div>

      <div className="cart-col-qty">
        <CartQuantityControl
          quantity={quantity}
          onChange={(next) => onUpdateQuantity(product.id, next)}
        />
      </div>

      <div className="cart-col-total">
        <span className="cart-row-total">{formatPrice(lineTotal)}</span>
      </div>

      <button
        type="button"
        onClick={() => onRemove(product.id, product.name)}
        className="cart-row-remove"
        aria-label={`Remove ${product.name} from cart`}
      >
        <X size={16} strokeWidth={1.5} />
      </button>
    </article>
  );
}
