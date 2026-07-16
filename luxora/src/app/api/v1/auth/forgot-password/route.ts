import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { forgotPassword } from "@/services/auth.service";
import { authRatelimit } from "@/lib/redis";
import { apiError, logApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const limited = await enforceRateLimit({
      limiter: authRatelimit,
      key: `forgot:${getClientIp(req)}`,
      fallbackLimit: 5,
      fallbackWindowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Invalid email", 400);
    }

    const result = await forgotPassword(parsed.data.email);

    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
      ...(result.devResetUrl ? { devResetUrl: result.devResetUrl } : {}),
      emailConfigured: result.emailSent,
    });
  } catch (error) {
    logApiError("POST /api/v1/auth/forgot-password", error);
    return apiError("SERVER_ERROR", "Something went wrong", 500);
  }
}
