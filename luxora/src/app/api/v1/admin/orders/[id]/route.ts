import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getAdminOrderById } from "@/services/order.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const order = await getAdminOrderById(id);

  if (!order) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Order not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json(order);
}
