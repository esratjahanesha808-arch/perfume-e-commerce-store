import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { checkoutOrderSchema } from "@/lib/validations/checkout";
import { createOrderFromCheckout } from "@/services/checkout.service";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = checkoutOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid checkout data" } },
        { status: 400 }
      );
    }

    const order = await createOrderFromCheckout(session!.user!.id, parsed.data);

    return NextResponse.json({
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        status: order.status,
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "EMPTY_CART") {
        return NextResponse.json(
          { error: { code: "EMPTY_CART", message: "Your cart is empty" } },
          { status: 400 }
        );
      }
      if (err.message === "OUT_OF_STOCK") {
        return NextResponse.json(
          { error: { code: "OUT_OF_STOCK", message: "An item in your cart is out of stock" } },
          { status: 400 }
        );
      }
    }

    console.error("[POST /api/v1/checkout]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to place order" } },
      { status: 500 }
    );
  }
}
