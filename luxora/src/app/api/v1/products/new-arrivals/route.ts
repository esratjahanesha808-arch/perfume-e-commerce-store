import { NextResponse } from "next/server";
import { getNewArrivals } from "@/services/product.service";

// GET /api/v1/products/new-arrivals
// Public — cached via Redis
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 8), 20);

    const products = await getNewArrivals(limit);

    return NextResponse.json({
      data: products,
      meta: { count: products.length },
    });
  } catch (error) {
    console.error("[GET /api/v1/products/new-arrivals]", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch new arrivals" } },
      { status: 500 }
    );
  }
}
