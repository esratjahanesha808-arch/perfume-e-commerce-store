import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const BRANDS_CACHE_KEY = "luxora:brands:all";
const CACHE_TTL = 600;

// GET /api/v1/brands
// Public — cached via Redis
export async function GET() {
  try {
    // Try cache
    const cached = redis
      ? await redis.get(BRANDS_CACHE_KEY).catch(() => null)
      : null;
    if (cached) {
      return NextResponse.json({ data: cached });
    }

    const brands = await db.brand.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        country: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    if (redis) {
      await redis.set(BRANDS_CACHE_KEY, brands, { ex: CACHE_TTL }).catch(() => null);
    }

    return NextResponse.json({
      data: brands,
      meta: { count: brands.length },
    });
  } catch (error) {
    console.error("[GET /api/v1/brands]", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch brands" } },
      { status: 500 }
    );
  }
}
