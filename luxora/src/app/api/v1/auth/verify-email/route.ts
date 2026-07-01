import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body as { token?: string };

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: { code: "MISSING_TOKEN", message: "Verification token is required." } },
        { status: 400 }
      );
    }

    await verifyEmail(token);

    return NextResponse.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_TOKEN") {
        return NextResponse.json(
          { error: { code: "INVALID_TOKEN", message: "Invalid verification link." } },
          { status: 400 }
        );
      }
      if (error.message === "TOKEN_EXPIRED") {
        return NextResponse.json(
          { error: { code: "TOKEN_EXPIRED", message: "Verification link has expired." } },
          { status: 400 }
        );
      }
    }
    console.error("[VERIFY_EMAIL_ERROR]", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}
