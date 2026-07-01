import { db, isDbConfigured } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const FEATURED_CACHE_KEY = "luxora:products:featured";
const NEW_ARRIVALS_CACHE_KEY = "luxora:products:new-arrivals";
const CACHE_TTL = 300; // 5 minutes

// ── Shared select — only expose public fields ──────────────────
const productSelect = {
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
  scentNotes: true,
  attributes: true,
  category: { select: { name: true, slug: true } },
  brand: { select: { name: true, slug: true } },
  images: {
    orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }],
    select: { url: true, altText: true },
    take: 1,
  },
  inventory: { select: { quantity: true, reserved: true } },
};

// ── Get Featured Products ──────────────────────────────────────
export async function getFeaturedProducts(limit = 8) {
  if (!isDbConfigured) return [];

  // Try cache first
  try {
    if (redis) {
      const cached = await redis.get(FEATURED_CACHE_KEY);
      if (cached) return cached as typeof products;
    }
  } catch {
    // Redis unavailable — continue to DB
  }

  const products = await db.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: productSelect,
  });

  // Cache result
  try {
    if (redis) {
      await redis.set(FEATURED_CACHE_KEY, products, { ex: CACHE_TTL });
    }
  } catch {
    // Redis unavailable — non-fatal
  }

  return products;
}

// ── Get New Arrivals ──────────────────────────────────────────
export async function getNewArrivals(limit = 8) {
  if (!isDbConfigured) return [];

  try {
    if (redis) {
      const cached = await redis.get(NEW_ARRIVALS_CACHE_KEY);
      if (cached) return cached as typeof products;
    }
  } catch {
    // Redis unavailable
  }

  const products = await db.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: productSelect,
  });

  try {
    if (redis) {
      await redis.set(NEW_ARRIVALS_CACHE_KEY, products, { ex: CACHE_TTL });
    }
  } catch {
    // Non-fatal
  }

  return products;
}

// ── Get Products by Category (for shop page, Phase 4) ─────────
export async function getProductsByCategory(
  categorySlug: string,
  { page = 1, limit = 12, sort = "newest" }: { page?: number; limit?: number; sort?: string }
) {
  if (!isDbConfigured) return { products: [], total: 0, pages: 0 };

  const orderBy =
    sort === "price-asc"
      ? { price: "asc" as const }
      : sort === "price-desc"
      ? { price: "desc" as const }
      : sort === "rating"
      ? { avgRating: "desc" as const }
      : { createdAt: "desc" as const };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where: {
        isActive: true,
        category: { slug: categorySlug },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: productSelect,
    }),
    db.product.count({
      where: { isActive: true, category: { slug: categorySlug } },
    }),
  ]);

  return { products, total, pages: Math.ceil(total / limit) };
}

// ── Get All Active Products (for shop listing) ─────────────────
export async function getAllProducts() {
  if (!isDbConfigured) return [];

  return db.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: productSelect,
  });
}

// ── Invalidate product caches (call on product create/update) ──
export async function invalidateProductCaches() {
  try {
    if (redis) {
      await redis.del(FEATURED_CACHE_KEY);
      await redis.del(NEW_ARRIVALS_CACHE_KEY);
    }
  } catch {
    // Non-fatal
  }
}

// ── Get Product by Slug (for product details page, Phase 5) ────
export async function getProductBySlug(slug: string) {
  if (!isDbConfigured) return null;

  return await db.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true, altText: true, isPrimary: true },
      },
      inventory: { select: { quantity: true, reserved: true } },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: {
          user: { select: { name: true, avatarUrl: true } },
        },
      },
    },
  });
}

