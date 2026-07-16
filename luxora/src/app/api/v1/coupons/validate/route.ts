import { requireAuth } from "@/lib/api-auth";
import { apiError, apiSuccess, logApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { writeRatelimit } from "@/lib/redis";
import { validateCouponSchema } from "@/lib/validations/coupon";
import { CouponError, validateCouponForUser } from "@/services/coupon.service";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const limited = await enforceRateLimit({
    limiter: writeRatelimit,
    key: `coupon:${session!.user!.id}:${getClientIp(request)}`,
    fallbackLimit: 30,
    fallbackWindowMs: 60 * 1000,
  });
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = validateCouponSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Invalid coupon request", 400);
    }

    const result = await validateCouponForUser(
      parsed.data.code,
      session!.user!.id,
      parsed.data.subtotal,
      parsed.data.shippingMethod
    );

    return apiSuccess(result);
  } catch (err) {
    if (err instanceof CouponError) {
      return apiError(err.code, err.message, 400);
    }

    logApiError("POST /api/v1/coupons/validate", err);
    return apiError("SERVER_ERROR", "Failed to validate coupon", 500);
  }
}
