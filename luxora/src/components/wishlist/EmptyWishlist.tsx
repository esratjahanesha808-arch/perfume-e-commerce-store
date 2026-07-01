import Link from "next/link";

interface EmptyWishlistProps {
  signedIn: boolean;
}

export function EmptyWishlist({ signedIn }: EmptyWishlistProps) {
  return (
    <div className="wishlist-empty">
      <p className="wishlist-empty-text">
        {signedIn
          ? "Browse the shop and tap Wishlist on any fragrance you love."
          : "Sign in to save fragrances to your wishlist and access them on any device."}
      </p>

      {signedIn ? (
        <Link href="/shop" className="wishlist-auth-btn wishlist-auth-btn-primary">
          Explore the Shop
        </Link>
      ) : (
        <div className="wishlist-auth-actions">
          <Link
            href="/login?callbackUrl=%2Fwishlist"
            className="wishlist-auth-btn wishlist-auth-btn-primary"
          >
            Sign In
          </Link>
          <Link href="/register" className="wishlist-auth-btn wishlist-auth-btn-secondary">
            Create Account
          </Link>
        </div>
      )}
    </div>
  );
}
