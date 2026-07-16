"use client";

import { SessionProvider } from "next-auth/react";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { PostHogProvider } from "@/components/shared/PostHogProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <SessionProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </SessionProvider>
    </PostHogProvider>
  );
}
