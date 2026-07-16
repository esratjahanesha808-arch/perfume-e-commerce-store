import { ReviewError, markReviewHelpful } from "@/services/review.service";
import { requireAuth } from "@/lib/api-auth";
import { apiError, apiSuccess, logApiError } from "@/lib/api-response";
import {
  claimOnceKey,
  enforceRateLimit,
  getClientIp,
  releaseOnceKey,
} from "@/lib/rate-limit";
import { helpfulRatelimit } from "@/lib/redis";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = session!.user!.id;
  const ip = getClientIp(request);

  const limited = await enforceRateLimit({
    limiter: helpfulRatelimit,
    key: `user:${userId}`,
    fallbackLimit: 20,
    fallbackWindowMs: 60 * 60 * 1000,
    message: "Too many helpful votes. Please try again later.",
  });
  if (limited) return limited;

  // Secondary IP-based throttle against shared-account abuse
  const ipLimited = await enforceRateLimit({
    limiter: helpfulRatelimit,
    key: `ip:${ip}`,
    fallbackLimit: 40,
    fallbackWindowMs: 60 * 60 * 1000,
  });
  if (ipLimited) return ipLimited;

  let voteKey: string | null = null;

  try {
    const { id } = await context.params;
    voteKey = `luxora:helpful-vote:${userId}:${id}`;

    const claimed = await claimOnceKey(voteKey);
    if (!claimed) {
      return apiError(
        "ALREADY_VOTED",
        "You have already marked this review as helpful",
        409
      );
    }

    const helpfulCount = await markReviewHelpful(id);
    return apiSuccess({ helpfulCount });
  } catch (err) {
    if (voteKey) {
      await releaseOnceKey(voteKey).catch(() => undefined);
    }

    if (err instanceof ReviewError) {
      return apiError(err.code, err.message, 404);
    }

    logApiError("POST /api/v1/reviews/[id]/helpful", err);
    return apiError("SERVER_ERROR", "Failed to mark review helpful", 500);
  }
}
