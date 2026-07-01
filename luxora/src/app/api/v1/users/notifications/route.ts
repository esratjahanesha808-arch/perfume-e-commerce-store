import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { notificationPrefsSchema } from "@/lib/validations/user";
import {
  getUserNotificationPrefs,
  updateUserNotificationPrefs,
} from "@/services/user.service";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const prefs = await getUserNotificationPrefs(session!.user!.id);
    return NextResponse.json({ data: prefs });
  } catch (err) {
    console.error("[GET /api/v1/users/notifications]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to load notification preferences" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = notificationPrefsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid notification preferences" } },
        { status: 400 }
      );
    }

    const prefs = await updateUserNotificationPrefs(session!.user!.id, parsed.data);
    return NextResponse.json({ data: prefs });
  } catch (err) {
    console.error("[PUT /api/v1/users/notifications]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to save notification preferences" } },
      { status: 500 }
    );
  }
}
