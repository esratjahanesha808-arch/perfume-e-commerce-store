import { requireAuth } from "@/lib/api-auth";
import { apiError, apiSuccess, logApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { writeRatelimit } from "@/lib/redis";
import { createReviewSchema } from "@/lib/validations/review";
import { ReviewError, createReview } from "@/services/review.service";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const limited = await enforceRateLimit({
    limiter: writeRatelimit,
    key: `review:${session!.user!.id}:${getClientIp(request)}`,
    fallbackLimit: 30,
    fallbackWindowMs: 60 * 1000,
  });
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        "VALIDATION_ERROR",
        parsed.error.flatten().fieldErrors as Record<string, unknown>,
        400
      );
    }

    const review = await createReview(session!.user!.id, parsed.data);
    return apiSuccess(review, 201);
  } catch (err) {
    if (err instanceof ReviewError) {
      return apiError(err.code, err.message, 400);
    }

    logApiError("POST /api/v1/reviews", err);
    return apiError("SERVER_ERROR", "Failed to submit review", 500);
  }
}
