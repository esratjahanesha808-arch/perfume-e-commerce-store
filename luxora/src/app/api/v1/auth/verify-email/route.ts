import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/services/auth.service";
import { authRatelimit } from "@/lib/redis";
import { apiError, logApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const limited = await enforceRateLimit({
      limiter: authRatelimit,
      key: `verify:${getClientIp(req)}`,
      fallbackLimit: 5,
      fallbackWindowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

    const body = await req.json();
    const { token } = body as { token?: string };

    if (!token || typeof token !== "string") {
      return apiError("MISSING_TOKEN", "Verification token is required.", 400);
    }

    await verifyEmail(token);

    return NextResponse.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_TOKEN") {
        return apiError("INVALID_TOKEN", "Invalid verification link.", 400);
      }
      if (error.message === "TOKEN_EXPIRED") {
        return apiError("TOKEN_EXPIRED", "Verification link has expired.", 400);
      }
    }
    logApiError("POST /api/v1/auth/verify-email", error);
    return apiError("SERVER_ERROR", "Something went wrong", 500);
  }
}
