import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { isStripeConfigured } from "@/lib/stripe";
import { getCheckoutSessionForUser } from "@/services/payment.service";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { session, error } = await requireAuth();
  if (error) return error;

  if (!isStripeConfigured) {
    return NextResponse.json(
      { error: { code: "STRIPE_NOT_CONFIGURED", message: "Stripe is not configured" } },
      { status: 503 }
    );
  }

  try {
    const { sessionId } = await context.params;
    const data = await getCheckoutSessionForUser(sessionId, session!.user!.id);

    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Session not found" } },
        { status: 403 }
      );
    }

    console.error("[GET /api/v1/checkout/session/:id]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to load payment session" } },
      { status: 500 }
    );
  }
}
