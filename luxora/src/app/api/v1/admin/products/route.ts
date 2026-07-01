import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { adminProductListQuerySchema } from "@/lib/validations/product";
import { getAdminProducts } from "@/services/admin-product.service";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const parsed = adminProductListQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const data = await getAdminProducts(parsed.data);
  return NextResponse.json(data);
}
