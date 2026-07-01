import { NextResponse } from "next/server";
import { getFeaturedProducts } from "@/services/product.service";

// GET /api/v1/products/featured
// Public — cached via Redis
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 8), 20);

    const products = await getFeaturedProducts(limit);

    return NextResponse.json({
      data: products,
      meta: { count: products.length },
    });
  } catch (error) {
    console.error("[GET /api/v1/products/featured]", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch featured products" } },
      { status: 500 }
    );
  }
}
