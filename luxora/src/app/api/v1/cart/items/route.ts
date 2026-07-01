import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { addCartItemSchema } from "@/lib/validations/cart";
import { addToCart, getUserCart } from "@/services/cart.service";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = addCartItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid request" } },
        { status: 400 }
      );
    }

    await addToCart(session!.user!.id, parsed.data.productId, parsed.data.quantity);
    const data = await getUserCart(session!.user!.id);

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    console.error("[POST /api/v1/cart/items]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to add to cart" } },
      { status: 500 }
    );
  }
}
