import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { adminInventoryListQuerySchema } from "@/lib/validations/inventory";
import { getAdminInventoryList } from "@/services/inventory.service";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const parsed = adminInventoryListQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    lowStockOnly: searchParams.get("lowStockOnly") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const data = await getAdminInventoryList(parsed.data);
  return NextResponse.json(data);
}
