import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { deleteUserAddress, updateUserAddress } from "@/services/user.service";
import { addressSchema } from "@/lib/validations/user";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid address data" } },
        { status: 400 }
      );
    }

    const address = await updateUserAddress(session!.user!.id, id, parsed.data);
    return NextResponse.json({ data: address });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Address not found" } },
        { status: 404 }
      );
    }

    console.error("[PUT /api/v1/users/addresses/:id]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to update address" } },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await context.params;
    await deleteUserAddress(session!.user!.id, id);
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Address not found" } },
        { status: 404 }
      );
    }

    console.error("[DELETE /api/v1/users/addresses/:id]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to delete address" } },
      { status: 500 }
    );
  }
}
