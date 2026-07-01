import { db, isDbConfigured } from "@/lib/prisma";
import { toProductCard } from "@/lib/serialize-product";

const cartProductSelect = {
  id: true,
  name: true,
  slug: true,
  shortDesc: true,
  price: true,
  comparePrice: true,
  volume: true,
  avgRating: true,
  reviewCount: true,
  isFeatured: true,
  createdAt: true,
  brand: { select: { name: true, slug: true } },
  images: {
    orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }],
    select: { url: true, altText: true },
    take: 1,
  },
  inventory: {
    select: { quantity: true, reserved: true },
  },
};

function isProductInStock(inventory: { quantity: number; reserved: number } | null) {
  if (!inventory) return true;
  return inventory.quantity - inventory.reserved > 0;
}

export function serializeCartItem(item: {
  id: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: string;
    name: string;
    slug: string;
    shortDesc: string | null;
    price: unknown;
    comparePrice: unknown;
    volume: string | null;
    avgRating: unknown;
    reviewCount: number;
    isFeatured?: boolean;
    createdAt?: Date | string;
    brand: { name: string; slug: string } | null;
    images: { url: string; altText: string | null }[];
    inventory: { quantity: number; reserved: number } | null;
  };
}) {
  const product = toProductCard(item.product);
  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    product,
    inStock: isProductInStock(item.product.inventory),
  };
}

export async function getUserCart(userId: string) {
  if (!isDbConfigured) return [];

  const items = await db.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      productId: true,
      quantity: true,
      createdAt: true,
      updatedAt: true,
      product: { select: cartProductSelect },
    },
  });

  return items.filter((item) => item.product).map(serializeCartItem);
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const product = await db.product.findFirst({
    where: { id: productId, isActive: true },
    select: { id: true },
  });

  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  const existing = await db.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true, quantity: true },
  });

  if (existing) {
    return db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: Math.min(99, existing.quantity + quantity) },
      select: { id: true, productId: true, quantity: true },
    });
  }

  return db.cartItem.create({
    data: { userId, productId, quantity },
    select: { id: true, productId: true, quantity: true },
  });
}

export async function updateCartQuantity(userId: string, productId: string, quantity: number) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const existing = await db.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });

  if (!existing) throw new Error("NOT_IN_CART");

  return db.cartItem.update({
    where: { id: existing.id },
    data: { quantity },
    select: { id: true, productId: true, quantity: true },
  });
}

export async function removeFromCart(userId: string, productId: string) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const existing = await db.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });

  if (!existing) throw new Error("NOT_IN_CART");

  await db.cartItem.delete({ where: { id: existing.id } });
  return { productId };
}

export async function clearUserCart(userId: string) {
  if (!isDbConfigured) return;
  await db.cartItem.deleteMany({ where: { userId } });
}

export async function mergeGuestCart(
  userId: string,
  guestItems: { productId: string; quantity: number }[]
) {
  if (!isDbConfigured || guestItems.length === 0) return getUserCart(userId);

  for (const guestItem of guestItems) {
    try {
      await addToCart(userId, guestItem.productId, guestItem.quantity);
    } catch {
      // skip invalid products
    }
  }

  return getUserCart(userId);
}
