"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

type WishlistItem = {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    shortDesc: string | null;
    price: number;
    comparePrice: number | null;
    volume: number | null;
    avgRating: number;
    reviewCount: number;
    brand: { name: string };
    images: { url: string; altText: string | null }[];
    badge?: "BEST SELLER" | "NEW";
    status?: "in_stock" | "low_stock" | "out_of_stock";
    label?: string;
  };
};

type WishlistContextValue = {
  items: WishlistItem[];
  ids: Set<string>;
  count: number;
  isLoading: boolean;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string, productName?: string) => Promise<boolean>;
  remove: (productId: string, productName?: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

const toastStyle = {
  background: "#111111",
  color: "#C8A96B",
  border: "1px solid rgba(200,169,107,0.15)",
};

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!session?.user?.id) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/wishlist");
      if (!res.ok) {
        setItems([]);
        return;
      }
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "loading") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [status, refresh]);

  const ids = useMemo(() => new Set(items.map((item) => item.productId)), [items]);

  const isWishlisted = useCallback(
    (productId: string) => ids.has(productId),
    [ids]
  );

  const remove = useCallback(
    async (productId: string, productName?: string) => {
      const res = await fetch(`/api/v1/wishlist/${productId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Could not remove from wishlist.", { style: toastStyle });
        return;
      }
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      if (productName) {
        toast.success(`Removed ${productName} from your wishlist.`, { style: toastStyle });
      }
    },
    []
  );

  const toggle = useCallback(
    async (productId: string, productName?: string) => {
      if (ids.has(productId)) {
        await remove(productId, productName);
        return false;
      }

      const res = await fetch("/api/v1/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        toast.error("Could not add to wishlist.", { style: toastStyle });
        return false;
      }

      await refresh();
      if (productName) {
        toast.success(`Added ${productName} to your wishlist.`, { style: toastStyle });
      }
      return true;
    },
    [ids, remove, refresh]
  );

  const value = useMemo(
    () => ({
      items,
      ids,
      count: items.length,
      isLoading,
      isWishlisted,
      toggle,
      remove,
      refresh,
    }),
    [items, ids, isLoading, isWishlisted, toggle, remove, refresh]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}

export function useWishlistToggle(productId: string, productName?: string) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { isWishlisted, toggle, isLoading } = useWishlist();

  const wishlisted = isWishlisted(productId);

  const handleToggle = useCallback(async () => {
    if (status === "loading") return;

    if (!session) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      toast("Sign in to save items to your wishlist.", { style: toastStyle });
      return;
    }

    await toggle(productId, productName);
  }, [status, session, pathname, router, toggle, productId, productName]);

  return { wishlisted, handleToggle, isLoading, isAuthenticated: !!session };
}

export type { WishlistItem };
