import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function EmptyCart() {
  return (
    <div className="cart-empty">
      <div className="cart-empty-icon">
        <ShoppingBag size={28} strokeWidth={1.5} />
      </div>
      <h2 className="cart-empty-title">Your cart is empty</h2>
      <p className="cart-empty-text">
        Discover luxury fragrances and add your favorites to the cart.
      </p>
      <Link href="/shop" className="cart-continue-btn">
        Explore the Shop
      </Link>
    </div>
  );
}
