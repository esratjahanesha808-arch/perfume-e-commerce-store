import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { forgotPassword } from "@/services/auth.service";
import { authRatelimit } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (authRatelimit) {
      const { success } = await authRatelimit.limit(`forgot:${ip}`);
      if (!success) {
        return NextResponse.json(
          { error: { code: "RATE_LIMITED", message: "Too many requests." } },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid email" } },
        { status: 400 }
      );
    }

    const result = await forgotPassword(parsed.data.email);

    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
      ...(result.devResetUrl ? { devResetUrl: result.devResetUrl } : {}),
      emailConfigured: result.emailSent,
    });
  } catch (error) {
    console.error("[FORGOT_PASSWORD_ERROR]", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}
