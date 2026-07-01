import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartProduct = {
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
};

export type CartLine = {
  id?: string;
  productId: string;
  quantity: number;
  product: CartProduct;
  inStock: boolean;
};

type CartState = {
  items: CartLine[];
  isLoading: boolean;
  setItems: (items: CartLine[]) => void;
  setLoading: (loading: boolean) => void;
  replaceLocalItems: (items: CartLine[]) => void;
  upsertLocalItem: (product: CartProduct, quantity: number, inStock?: boolean) => void;
  updateLocalQuantity: (productId: string, quantity: number) => void;
  removeLocalItem: (productId: string) => void;
  clearLocal: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      setItems: (items) => set({ items }),
      setLoading: (isLoading) => set({ isLoading }),
      replaceLocalItems: (items) => set({ items }),
      upsertLocalItem: (product, quantity, inStock = true) => {
        const items = get().items;
        const existing = items.find((item) => item.productId === product.id);

        if (existing) {
          set({
            items: items.map((item) =>
              item.productId === product.id
                ? {
                    ...item,
                    quantity: Math.min(99, item.quantity + quantity),
                    product,
                    inStock,
                  }
                : item
            ),
          });
          return;
        }

        set({
          items: [
            { productId: product.id, quantity, product, inStock },
            ...items,
          ],
        });
      },
      updateLocalQuantity: (productId, quantity) => {
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        });
      },
      removeLocalItem: (productId) => {
        set({ items: get().items.filter((item) => item.productId !== productId) });
      },
      clearLocal: () => set({ items: [] }),
    }),
    {
      name: "luxora-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function getCartCount(items: CartLine[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotal(items: CartLine[]) {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function getShippingLabel(subtotal: number) {
  return subtotal >= 99 ? "Free" : "$9.99";
}

export function getShippingCost(subtotal: number) {
  return subtotal >= 99 ? 0 : 9.99;
}
