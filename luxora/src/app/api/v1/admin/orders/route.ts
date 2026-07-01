import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { adminOrderListQuerySchema } from "@/lib/validations/order";
import { getAdminOrders } from "@/services/order.service";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const parsed = adminOrderListQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    direction: searchParams.get("direction") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const data = await getAdminOrders(parsed.data);
  return NextResponse.json(data);
}
