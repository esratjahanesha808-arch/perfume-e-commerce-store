import { NextResponse } from "next/server";
import { getAllProducts } from "@/services/product.service";

// GET /api/v1/products
// Public — returns all active products for shop listing
export async function GET() {
  try {
    const products = await getAllProducts();

    const data = products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      avgRating: Number(p.avgRating),
    }));

    return NextResponse.json({
      data,
      meta: { count: data.length },
    });
  } catch (error) {
    console.error("[GET /api/v1/products]", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch products" } },
      { status: 500 }
    );
  }
}
