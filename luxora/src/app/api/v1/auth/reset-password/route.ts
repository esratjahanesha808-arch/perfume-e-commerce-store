import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { resetPassword } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;
    await resetPassword(token, password);

    return NextResponse.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_TOKEN") {
        return NextResponse.json(
          { error: { code: "INVALID_TOKEN", message: "Invalid or expired reset link." } },
          { status: 400 }
        );
      }
      if (error.message === "TOKEN_EXPIRED") {
        return NextResponse.json(
          { error: { code: "TOKEN_EXPIRED", message: "Reset link has expired. Please request a new one." } },
          { status: 400 }
        );
      }
    }
    console.error("[RESET_PASSWORD_ERROR]", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}
