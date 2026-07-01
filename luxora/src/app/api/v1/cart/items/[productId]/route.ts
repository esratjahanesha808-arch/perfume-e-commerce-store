import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { updateCartItemSchema } from "@/lib/validations/cart";
import {
  getUserCart,
  removeFromCart,
  updateCartQuantity,
} from "@/services/cart.service";

type RouteContext = { params: Promise<{ productId: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { productId } = await context.params;

  try {
    const body = await request.json();
    const parsed = updateCartItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid quantity" } },
        { status: 400 }
      );
    }

    await updateCartQuantity(session!.user!.id, productId, parsed.data.quantity);
    const data = await getUserCart(session!.user!.id);

    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_IN_CART") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Item not in cart" } },
        { status: 404 }
      );
    }

    console.error("[PUT /api/v1/cart/items/:productId]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to update cart" } },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { productId } = await context.params;

  try {
    await removeFromCart(session!.user!.id, productId);
    const data = await getUserCart(session!.user!.id);

    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_IN_CART") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Item not in cart" } },
        { status: 404 }
      );
    }

    console.error("[DELETE /api/v1/cart/items/:productId]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to remove item" } },
      { status: 500 }
    );
  }
}
