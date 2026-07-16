import { db, isDbConfigured } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const CATEGORIES_CACHE_KEY = "luxora:categories:all";
const CACHE_TTL = 600; // 10 minutes

// ── Get All Active Categories ──────────────────────────────────
export async function getAllCategories() {
  if (!isDbConfigured) return [];

  try {
    if (redis) {
      const cached = await redis.get(CATEGORIES_CACHE_KEY);
      if (cached) return cached as typeof categories;
    }
  } catch {
    // Redis unavailable
  }

  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      parentId: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });

  try {
    if (redis) {
      await redis.set(CATEGORIES_CACHE_KEY, categories, { ex: CACHE_TTL });
    }
  } catch {
    // Non-fatal
  }

  return categories;
}

// ── Get Root Categories (no parent) ───────────────────────────
export async function getRootCategories() {
  const all = await getAllCategories();
  return (all || []).filter((c) => c.parentId === null);
}

// ── Invalidate category cache ──────────────────────────────────
export async function invalidateCategoryCache() {
  try {
    if (redis) {
      await redis.del(CATEGORIES_CACHE_KEY);
    }
  } catch {
    // Non-fatal
  }
}
