import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { addToWishlistSchema } from "@/lib/validations/wishlist";
import {
  addToWishlist,
  getUserWishlist,
  removeFromWishlist,
} from "@/services/wishlist.service";

// GET /api/v1/wishlist — list authenticated user's wishlist
export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const data = await getUserWishlist(session!.user!.id);

    return NextResponse.json({
      data,
      meta: { count: data.length },
    });
  } catch (err) {
    console.error("[GET /api/v1/wishlist]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch wishlist" } },
      { status: 500 }
    );
  }
}

// POST /api/v1/wishlist — add product to wishlist
export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = addToWishlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const item = await addToWishlist(session!.user!.id, parsed.data.productId);

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    console.error("[POST /api/v1/wishlist]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to add to wishlist" } },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/wishlist — remove product (productId in body)
export async function DELETE(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = addToWishlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    await removeFromWishlist(session!.user!.id, parsed.data.productId);

    return NextResponse.json({ data: { productId: parsed.data.productId } });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_IN_WISHLIST") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Item not in wishlist" } },
        { status: 404 }
      );
    }

    console.error("[DELETE /api/v1/wishlist]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to remove from wishlist" } },
      { status: 500 }
    );
  }
}
