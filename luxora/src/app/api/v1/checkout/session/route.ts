import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { isStripeConfigured } from "@/lib/stripe";
import { checkoutOrderSchema } from "@/lib/validations/checkout";
import { CouponError } from "@/services/coupon.service";
import { createStripeCheckoutSession } from "@/services/payment.service";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  if (!isStripeConfigured) {
    return NextResponse.json(
      {
        error: {
          code: "STRIPE_NOT_CONFIGURED",
          message:
            "Stripe is not configured. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local.",
        },
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const parsed = checkoutOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid checkout data" } },
        { status: 400 }
      );
    }

    const checkoutSession = await createStripeCheckoutSession(
      session!.user!.id,
      parsed.data
    );

    return NextResponse.json({
      data: {
        sessionId: checkoutSession.sessionId,
        clientSecret: checkoutSession.clientSecret,
        orderId: checkoutSession.orderId,
        orderNumber: checkoutSession.orderNumber,
        total: checkoutSession.total,
      },
    });
  } catch (err) {
    if (err instanceof CouponError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: 400 }
      );
    }

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

    console.error("[POST /api/v1/checkout/session]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to create payment session" } },
      { status: 500 }
    );
  }
}
