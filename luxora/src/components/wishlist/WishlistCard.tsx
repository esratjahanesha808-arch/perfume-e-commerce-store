import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { resolveProductImageUrl } from "@/lib/product-images";
import type { WishlistItem } from "./WishlistProvider";

interface WishlistCardProps {
  item: WishlistItem;
  onRemove: (productId: string, productName: string) => void;
  onMoveToCart: (item: WishlistItem) => void;
}

export function WishlistCard({ item, onRemove, onMoveToCart }: WishlistCardProps) {
  const { product } = item;
  const imageUrl = resolveProductImageUrl(
    product.images?.[0]?.url,
    product.name,
    product.slug
  );

  return (
    <article className="flex flex-col sm:flex-row gap-5 pdp-content-card bg-[rgba(210,192,170,1)] rounded-md overflow-hidden">
      <Link
        href={`/products/${product.slug}`}
        className="shrink-0 w-full sm:w-36 aspect-square sm:aspect-auto sm:h-36 bg-[#F3EFE6] flex items-center justify-center p-4"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={product.images[0]?.altText ?? product.name}
          className="max-w-full max-h-full object-contain filter drop-shadow-[0_8px_16px_rgba(54,44,29,0.22)]"
        />
      </Link>

      <div className="flex flex-col flex-1 min-w-0 gap-3">
        <div>
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-[rgba(156,132,104,1)]">
            {product.brand?.name ?? "LUXORA"}
          </p>
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif text-lg text-[rgba(54,44,29,1)] hover:opacity-75 transition-opacity">
              {product.name}
            </h3>
          </Link>
        </div>

        <p className="text-xl font-semibold text-[rgba(82,75,61,1)]">
          {formatPrice(product.price)}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          <button
            type="button"
            onClick={() => onMoveToCart(item)}
            className="inline-flex items-center gap-2 h-10 px-5 bg-[rgba(117,96,70,1)] hover:bg-[rgba(117,96,70,0.9)] text-white text-[10px] font-bold tracking-[0.18em] uppercase transition-colors"
          >
            <ShoppingBag size={14} />
            Move to Cart
          </button>
          <button
            type="button"
            onClick={() => onRemove(product.id, product.name)}
            className="inline-flex items-center gap-2 h-10 px-4 border border-[rgba(117,96,70,0.4)] text-[rgba(117,96,70,1)] text-[10px] font-bold tracking-[0.18em] uppercase hover:bg-[rgba(117,96,70,0.08)] transition-colors"
            aria-label={`Remove ${product.name} from wishlist`}
          >
            <Trash2 size={14} />
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
