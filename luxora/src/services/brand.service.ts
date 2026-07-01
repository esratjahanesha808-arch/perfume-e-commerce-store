import { db, isDbConfigured } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const BRANDS_CACHE_KEY = "luxora:brands:all";
const CACHE_TTL = 600;

export async function getActiveBrands() {
  if (!isDbConfigured) return [];

  try {
    if (redis) {
      const cached = await redis.get(BRANDS_CACHE_KEY);
      if (cached) return cached as Awaited<ReturnType<typeof fetchBrands>>;
    }
  } catch {
    // Redis unavailable
  }

  const brands = await fetchBrands();

  try {
    if (redis) {
      await redis.set(BRANDS_CACHE_KEY, brands, { ex: CACHE_TTL });
    }
  } catch {
    // Non-fatal
  }

  return brands;
}

async function fetchBrands() {
  return db.brand.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });
}
