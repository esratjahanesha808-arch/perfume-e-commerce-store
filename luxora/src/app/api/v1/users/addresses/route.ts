import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { createUserAddress, getUserAddresses } from "@/services/user.service";
import { addressSchema } from "@/lib/validations/user";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const addresses = await getUserAddresses(session!.user!.id);
    return NextResponse.json({ data: addresses });
  } catch (err) {
    console.error("[GET /api/v1/users/addresses]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to load addresses" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid address data" } },
        { status: 400 }
      );
    }

    const address = await createUserAddress(session!.user!.id, parsed.data);
    return NextResponse.json({ data: address }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/v1/users/addresses]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to create address" } },
      { status: 500 }
    );
  }
}
