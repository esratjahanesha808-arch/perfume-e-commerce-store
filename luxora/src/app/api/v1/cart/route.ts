import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { mergeCartSchema } from "@/lib/validations/cart";
import {
  clearUserCart,
  getUserCart,
  mergeGuestCart,
} from "@/services/cart.service";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const data = await getUserCart(session!.user!.id);
    const count = data.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = data.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return NextResponse.json({
      data,
      meta: { count, subtotal },
    });
  } catch (err) {
    console.error("[GET /api/v1/cart]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch cart" } },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    await clearUserCart(session!.user!.id);
    return NextResponse.json({ data: { cleared: true } });
  } catch (err) {
    console.error("[DELETE /api/v1/cart]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to clear cart" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();

    if (body?.action === "merge") {
      const parsed = mergeCartSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: "VALIDATION_ERROR", message: "Invalid merge payload" } },
          { status: 400 }
        );
      }

      const data = await mergeGuestCart(session!.user!.id, parsed.data.items);
      const count = data.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = data.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

      return NextResponse.json({ data, meta: { count, subtotal } });
    }

    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Unsupported action" } },
      { status: 400 }
    );
  } catch (err) {
    console.error("[POST /api/v1/cart]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to merge cart" } },
      { status: 500 }
    );
  }
}
