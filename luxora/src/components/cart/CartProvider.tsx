"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  useCartStore,
  getCartCount,
  getCartSubtotal,
  type CartLine,
  type CartProduct,
} from "@/stores/cart-store";

const toastStyle = {
  background: "#111111",
  color: "#C8A96B",
  border: "1px solid rgba(200,169,107,0.15)",
};

function mergeSessionKey(userId: string) {
  return `luxora-cart-merged-${userId}`;
}

type CartContextValue = {
  items: CartLine[];
  count: number;
  subtotal: number;
  isLoading: boolean;
  addItem: (product: CartProduct, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string, productName?: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function mapApiItems(data: CartLine[]): CartLine[] {
  return data.map((item) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: item.product,
    inStock: item.inStock ?? true,
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const items = useCartStore((s) => s.items);
  const isLoading = useCartStore((s) => s.isLoading);
  const setItems = useCartStore((s) => s.setItems);
  const setLoading = useCartStore((s) => s.setLoading);
  const upsertLocalItem = useCartStore((s) => s.upsertLocalItem);
  const updateLocalQuantity = useCartStore((s) => s.updateLocalQuantity);
  const removeLocalItem = useCartStore((s) => s.removeLocalItem);
  const clearLocal = useCartStore((s) => s.clearLocal);
  const syncPromiseRef = useRef<Promise<void> | null>(null);
  const lastUserIdRef = useRef<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasHydrated(true);
      return;
    }
    return useCartStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
  }, []);

  const refresh = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const res = await fetch("/api/v1/cart");
      if (!res.ok) {
        setItems([]);
        return;
      }
      const json = await res.json();
      setItems(mapApiItems(json.data ?? []));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, setItems, setLoading]);

  useEffect(() => {
    if (status === "unauthenticated") {
      if (lastUserIdRef.current) {
        sessionStorage.removeItem(mergeSessionKey(lastUserIdRef.current));
      }
      lastUserIdRef.current = null;
      return;
    }

    if (!hasHydrated || status !== "authenticated" || !session?.user?.id) {
      return;
    }

    const userId = session.user.id;
    lastUserIdRef.current = userId;

    async function syncAuthenticatedCart() {
      if (syncPromiseRef.current) {
        await syncPromiseRef.current;
        return;
      }

      syncPromiseRef.current = (async () => {
        const alreadyMerged = sessionStorage.getItem(mergeSessionKey(userId)) === "1";
        const guestItems = useCartStore.getState().items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

        setLoading(true);
        try {
          if (!alreadyMerged && guestItems.length > 0) {
            const snapshot = [...guestItems];
            clearLocal();

            const res = await fetch("/api/v1/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "merge", items: snapshot }),
            });

            if (res.ok) {
              const json = await res.json();
              const mapped = mapApiItems(json.data ?? []);
              setItems(mapped);
              sessionStorage.setItem(mergeSessionKey(userId), "1");
              return;
            }
          }

          const res = await fetch("/api/v1/cart");
          if (res.ok) {
            const json = await res.json();
            const mapped = mapApiItems(json.data ?? []);
            setItems(mapped);
            sessionStorage.setItem(mergeSessionKey(userId), "1");
          } else {
            setItems([]);
          }
        } catch {
          setItems([]);
        } finally {
          setLoading(false);
        }
      })();

      try {
        await syncPromiseRef.current;
      } finally {
        syncPromiseRef.current = null;
      }
    }

    void syncAuthenticatedCart();
  }, [hasHydrated, status, session?.user?.id, setItems, setLoading, clearLocal]);

  const addItem = useCallback(
    async (product: CartProduct, quantity = 1) => {
      if (session?.user?.id) {
        const res = await fetch("/api/v1/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, quantity }),
        });

        if (!res.ok) {
          toast.error("Could not add item to cart.", { style: toastStyle });
          return;
        }

        await refresh();
      } else {
        upsertLocalItem(product, quantity);
      }

      toast.success(`Added to cart`, { style: toastStyle });
    },
    [session?.user?.id, upsertLocalItem, refresh]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (session?.user?.id) {
        const res = await fetch(`/api/v1/cart/items/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        });

        if (!res.ok) {
          toast.error("Could not update quantity.", { style: toastStyle });
          return;
        }

        const json = await res.json();
        setItems(mapApiItems(json.data ?? []));
        return;
      }

      updateLocalQuantity(productId, quantity);
    },
    [session?.user?.id, updateLocalQuantity, setItems]
  );

  const removeItem = useCallback(
    async (productId: string, productName?: string) => {
      if (session?.user?.id) {
        const res = await fetch(`/api/v1/cart/items/${productId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          toast.error("Could not remove item.", { style: toastStyle });
          return;
        }

        const json = await res.json();
        setItems(mapApiItems(json.data ?? []));
      } else {
        removeLocalItem(productId);
      }

      toast.success(
        productName ? `Removed ${productName} from cart` : "Item removed from cart",
        { style: toastStyle }
      );
    },
    [session?.user?.id, removeLocalItem, setItems]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: getCartCount(items),
      subtotal: getCartSubtotal(items),
      isLoading,
      addItem,
      updateQuantity,
      removeItem,
      refresh,
    }),
    [items, isLoading, addItem, updateQuantity, removeItem, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function useAddToCart() {
  const { addItem } = useCart();
  return addItem;
}
