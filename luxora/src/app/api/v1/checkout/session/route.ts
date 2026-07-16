import { requireAuth } from "@/lib/api-auth";
import { apiError, apiSuccess, logApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { writeRatelimit } from "@/lib/redis";
import { isStripeConfigured } from "@/lib/stripe";
import { checkoutOrderSchema } from "@/lib/validations/checkout";
import { CouponError } from "@/services/coupon.service";
import { createStripeCheckoutSession } from "@/services/payment.service";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const limited = await enforceRateLimit({
    limiter: writeRatelimit,
    key: `checkout-session:${session!.user!.id}:${getClientIp(request)}`,
    fallbackLimit: 30,
    fallbackWindowMs: 60 * 1000,
  });
  if (limited) return limited;

  if (!isStripeConfigured) {
    return apiError(
      "STRIPE_NOT_CONFIGURED",
      "Stripe is not configured. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local.",
      503
    );
  }

  try {
    const body = await request.json();
    const parsed = checkoutOrderSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Invalid checkout data", 400);
    }

    const checkoutSession = await createStripeCheckoutSession(
      session!.user!.id,
      parsed.data
    );

    return apiSuccess({
      sessionId: checkoutSession.sessionId,
      clientSecret: checkoutSession.clientSecret,
      orderId: checkoutSession.orderId,
      orderNumber: checkoutSession.orderNumber,
      total: checkoutSession.total,
    });
  } catch (err) {
    if (err instanceof CouponError) {
      return apiError(err.code, err.message, 400);
    }

    if (err instanceof Error) {
      if (err.message === "EMPTY_CART") {
        return apiError("EMPTY_CART", "Your cart is empty", 400);
      }
      if (err.message === "OUT_OF_STOCK") {
        return apiError("OUT_OF_STOCK", "An item in your cart is out of stock", 400);
      }
    }

    logApiError("POST /api/v1/checkout/session", err);
    return apiError("SERVER_ERROR", "Failed to create payment session", 500);
  }
}
