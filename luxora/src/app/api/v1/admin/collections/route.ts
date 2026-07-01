import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { adminCollectionListQuerySchema } from "@/lib/validations/collection";
import { getAdminCollections } from "@/services/admin-collection.service";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const parsed = adminCollectionListQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const data = await getAdminCollections(parsed.data);
  return NextResponse.json(data);
}
