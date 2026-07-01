import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { adminOrderListQuerySchema } from "@/lib/validations/order";
import { exportAdminOrdersCsv } from "@/services/order.service";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const parsed = adminOrderListQuerySchema.safeParse({
    status: searchParams.get("status") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const csv = await exportAdminOrdersCsv(parsed.data);
  const filename = `luxora-orders-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
