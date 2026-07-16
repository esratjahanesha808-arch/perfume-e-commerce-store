import { requireAuth } from "@/lib/api-auth";
import { apiError, apiSuccess, logApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { writeRatelimit } from "@/lib/redis";
import { checkoutOrderSchema } from "@/lib/validations/checkout";
import { createOrderFromCheckout } from "@/services/checkout.service";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const limited = await enforceRateLimit({
    limiter: writeRatelimit,
    key: `checkout:${session!.user!.id}:${getClientIp(request)}`,
    fallbackLimit: 30,
    fallbackWindowMs: 60 * 1000,
  });
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = checkoutOrderSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Invalid checkout data", 400);
    }

    const order = await createOrderFromCheckout(session!.user!.id, parsed.data);

    return apiSuccess({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: Number(order.total),
      status: order.status,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "EMPTY_CART") {
        return apiError("EMPTY_CART", "Your cart is empty", 400);
      }
      if (err.message === "OUT_OF_STOCK") {
        return apiError("OUT_OF_STOCK", "An item in your cart is out of stock", 400);
      }
    }

    logApiError("POST /api/v1/checkout", err);
    return apiError("SERVER_ERROR", "Failed to place order", 500);
  }
}
