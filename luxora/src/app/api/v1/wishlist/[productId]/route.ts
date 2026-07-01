import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { wishlistProductIdSchema } from "@/lib/validations/wishlist";
import { removeFromWishlist } from "@/services/wishlist.service";

interface RouteContext {
  params: Promise<{ productId: string }>;
}

// DELETE /api/v1/wishlist/:productId — remove single item
export async function DELETE(_request: Request, context: RouteContext) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { productId } = await context.params;
  const parsed = wishlistProductIdSchema.safeParse({ productId });

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid product ID" } },
      { status: 400 }
    );
  }

  try {
    await removeFromWishlist(session!.user!.id, parsed.data.productId);
    return NextResponse.json({ data: { productId: parsed.data.productId } });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_IN_WISHLIST") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Item not in wishlist" } },
        { status: 404 }
      );
    }

    console.error("[DELETE /api/v1/wishlist/:productId]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to remove from wishlist" } },
      { status: 500 }
    );
  }
}
