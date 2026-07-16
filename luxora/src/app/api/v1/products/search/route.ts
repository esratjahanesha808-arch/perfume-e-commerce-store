import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/prisma";

const MAX_RESULTS = 20;

// GET /api/v1/products/search?q=term&limit=10
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(MAX_RESULTS, Number(searchParams.get("limit") ?? "10"));

  if (!query) {
    return NextResponse.json({ data: [], meta: { total: 0 } });
  }

  if (!isDbConfigured) {
    return NextResponse.json({ data: [], meta: { total: 0 } });
  }

  try {
    const products = await db.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { brand: { name: { contains: query, mode: "insensitive" } } },
          { category: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        avgRating: true,
        brand: { select: { name: true } },
        category: { select: { name: true } },
        images: {
          where: { isPrimary: true },
          select: { url: true },
          take: 1,
        },
      },
      orderBy: { avgRating: "desc" },
    });

    const hits = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      avgRating: Number(p.avgRating),
      brandName: p.brand?.name ?? null,
      categoryName: p.category?.name ?? null,
      imageUrl: p.images[0]?.url ?? null,
    }));

    return NextResponse.json({
      data: hits,
      meta: { total: hits.length, source: "db" },
    });
  } catch (error) {
    console.error("[GET /api/v1/products/search]", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Search failed" } },
      { status: 500 }
    );
  }
}
