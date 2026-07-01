import { db, isDbConfigured } from "@/lib/prisma";
import { toProductCard } from "@/lib/serialize-product";
import { getStockStatus } from "@/lib/stock-status";

const wishlistProductSelect = {
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
    select: {
      quantity: true,
      reserved: true,
      lowStockThreshold: true,
    },
  },
};

export async function getUserWishlist(userId: string) {
  if (!isDbConfigured) return [];

  const items = await db.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      productId: true,
      createdAt: true,
      product: { select: wishlistProductSelect },
    },
  });

  return items.flatMap((item) =>
    item.product
      ? [
          {
            id: item.id,
            productId: item.productId,
            createdAt: item.createdAt,
            product: {
              ...toProductCard(item.product),
              ...getStockStatus(item.product.inventory),
            },
          },
        ]
      : []
  );
}

export async function getWishlistProductIds(userId: string): Promise<string[]> {
  if (!isDbConfigured) return [];

  const items = await db.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });

  return items.map((item) => item.productId);
}

export async function addToWishlist(userId: string, productId: string) {
  if (!isDbConfigured) {
    throw new Error("Database not configured");
  }

  const product = await db.product.findFirst({
    where: { id: productId, isActive: true },
    select: { id: true },
  });

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  return db.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
    select: { id: true, productId: true, createdAt: true },
  });
}

export async function removeFromWishlist(userId: string, productId: string) {
  if (!isDbConfigured) {
    throw new Error("Database not configured");
  }

  const existing = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("NOT_IN_WISHLIST");
  }

  await db.wishlistItem.delete({
    where: { userId_productId: { userId, productId } },
  });

  return { productId };
}

export async function isProductWishlisted(userId: string, productId: string) {
  if (!isDbConfigured) return false;

  const item = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });

  return !!item;
}
