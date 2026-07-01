import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { registerUser } from "@/services/auth.service";
import { authRatelimit } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

    if (authRatelimit) {
      const { success } = await authRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.flatten() } },
        { status: 400 }
      );
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
      return NextResponse.json(
        {
          error: {
            code: "EMAIL_TAKEN",
            message: "An account with this email already exists. Please sign in instead.",
          },
        },
        { status: 409 }
      );
    }

    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message:
            "We could not create your account right now. Please check your connection and try again.",
        },
      },
      { status: 500 }
    );
  }
}
