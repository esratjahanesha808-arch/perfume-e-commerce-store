import { requireAdminWrite } from "@/lib/api-auth";
import { apiError, apiSuccess, logApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { adminRatelimit } from "@/lib/redis";
import { moderateReviewSchema } from "@/lib/validations/review";
import {
  ReviewError,
  deleteReview,
  moderateReview,
} from "@/services/review.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { session, isDemo, error } = await requireAdminWrite();
  if (error) return error;

  const limited = await enforceRateLimit({
    limiter: adminRatelimit,
    key: `admin-review:${session!.user.id}:${getClientIp(request)}`,
    fallbackLimit: 60,
    fallbackWindowMs: 60 * 1000,
  });
  if (limited) return limited;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = moderateReviewSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        "VALIDATION_ERROR",
        parsed.error.flatten().fieldErrors as Record<string, unknown>,
        400
      );
    }

    if (isDemo) {
      return apiSuccess({ id, isApproved: parsed.data.isApproved });
    }

    const review = await moderateReview(id, parsed.data.isApproved);
    return apiSuccess(review);
  } catch (err) {
    if (err instanceof ReviewError) {
      return apiError(err.code, err.message, 404);
    }

    logApiError("PATCH /api/v1/admin/reviews/[id]", err);
    return apiError("SERVER_ERROR", "Failed to update review", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { session, isDemo, error } = await requireAdminWrite();
  if (error) return error;

  const limited = await enforceRateLimit({
    limiter: adminRatelimit,
    key: `admin-review-del:${session!.user.id}:${getClientIp(request)}`,
    fallbackLimit: 60,
    fallbackWindowMs: 60 * 1000,
  });
  if (limited) return limited;

  try {
    const { id } = await context.params;

    if (isDemo) {
      return apiSuccess({ deleted: true });
    }

    await deleteReview(id);
    return apiSuccess({ deleted: true });
  } catch (err) {
    if (err instanceof ReviewError) {
      return apiError(err.code, err.message, 404);
    }

    logApiError("DELETE /api/v1/admin/reviews/[id]", err);
    return apiError("SERVER_ERROR", "Failed to delete review", 500);
  }
}
