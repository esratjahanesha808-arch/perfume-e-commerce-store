import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getUserProfile, updateUserProfile } from "@/services/user.service";
import { updateProfileSchema } from "@/lib/validations/user";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const profile = await getUserProfile(session!.user!.id);
    return NextResponse.json({ data: profile });
  } catch (err) {
    console.error("[GET /api/v1/users/profile]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to load profile" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid profile data" } },
        { status: 400 }
      );
    }

    const profile = await updateUserProfile(session!.user!.id, parsed.data);
    return NextResponse.json({ data: profile });
  } catch (err) {
    console.error("[PUT /api/v1/users/profile]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to update profile" } },
      { status: 500 }
    );
  }
}
