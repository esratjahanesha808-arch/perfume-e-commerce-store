import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { resetPassword } from "@/services/auth.service";
import { authRatelimit } from "@/lib/redis";
import { apiError, logApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const limited = await enforceRateLimit({
      limiter: authRatelimit,
      key: `reset:${getClientIp(req)}`,
      fallbackLimit: 5,
      fallbackWindowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Invalid input", 400, parsed.error.flatten());
    }

    const { token, password } = parsed.data;
    await resetPassword(token, password);

    return NextResponse.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_TOKEN") {
        return apiError("INVALID_TOKEN", "Invalid or expired reset link.", 400);
      }
      if (error.message === "TOKEN_EXPIRED") {
        return apiError(
          "TOKEN_EXPIRED",
          "Reset link has expired. Please request a new one.",
          400
        );
      }
    }
    logApiError("POST /api/v1/auth/reset-password", error);
    return apiError("SERVER_ERROR", "Something went wrong", 500);
  }
}
