import { NextResponse } from "next/server";
import { getAllCategories } from "@/services/category.service";

// GET /api/v1/categories
// Public — cached via Redis
export async function GET() {
  try {
    const categories = await getAllCategories();

    return NextResponse.json({
      data: categories,
      meta: { count: categories.length },
    });
  } catch (error) {
    console.error("[GET /api/v1/categories]", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch categories" } },
      { status: 500 }
    );
  }
}
