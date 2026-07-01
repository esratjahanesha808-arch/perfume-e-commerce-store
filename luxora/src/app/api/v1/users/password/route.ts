import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { changeUserPassword } from "@/services/user.service";
import { changePasswordSchema } from "@/lib/validations/user";

export async function PUT(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid password data" } },
        { status: 400 }
      );
    }

    await changeUserPassword(
      session!.user!.id,
      parsed.data.currentPassword,
      parsed.data.newPassword
    );

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NO_PASSWORD") {
        return NextResponse.json(
          {
            error: {
              code: "NO_PASSWORD",
              message: "Password change is not available for social sign-in accounts.",
            },
          },
          { status: 400 }
        );
      }
      if (err.message === "INVALID_PASSWORD") {
        return NextResponse.json(
          { error: { code: "INVALID_PASSWORD", message: "Current password is incorrect." } },
          { status: 400 }
        );
      }
    }

    console.error("[PUT /api/v1/users/password]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to change password" } },
      { status: 500 }
    );
  }
}
