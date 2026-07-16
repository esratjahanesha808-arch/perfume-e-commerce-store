import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { registerUser } from "@/services/auth.service";
import { authRatelimit } from "@/lib/redis";
import { apiError, logApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const limited = await enforceRateLimit({
      limiter: authRatelimit,
      key: `register:${getClientIp(req)}`,
      fallbackLimit: 5,
      fallbackWindowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Invalid input", 400, parsed.error.flatten());
    }

    const { name, email, password } = parsed.data;
    const result = await registerUser(name, email, password);

    return NextResponse.json(
      {
        message: result.autoVerified
          ? "Account created. You can sign in now."
          : "Account created. Please check your email to verify your account.",
        ...(result.devVerifyUrl ? { devVerifyUrl: result.devVerifyUrl } : {}),
        autoVerified: result.autoVerified,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return apiError(
        "EMAIL_TAKEN",
        "An account with this email already exists. Please sign in instead.",
        409
      );
    }

    logApiError("POST /api/v1/auth/register", error);
    return apiError(
      "SERVER_ERROR",
      "We could not create your account right now. Please check your connection and try again.",
      500
    );
  }
}
