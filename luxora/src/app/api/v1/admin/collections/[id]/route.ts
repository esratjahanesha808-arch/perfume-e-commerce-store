import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { adminCollectionUpdateSchema } from "@/lib/validations/collection";
import { updateAdminCollection } from "@/services/admin-collection.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = adminCollectionUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  try {
    const collection = await updateAdminCollection(id, parsed.data);
    return NextResponse.json(collection);
  } catch {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Collection not found" } },
      { status: 404 }
    );
  }
}
