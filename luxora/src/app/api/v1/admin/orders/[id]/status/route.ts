import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { adminOrderStatusSchema } from "@/lib/validations/order";
import { updateAdminOrderStatus } from "@/services/order.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = adminOrderStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  try {
    const order = await updateAdminOrderStatus(
      id,
      parsed.data.status,
      session!.user.id,
      parsed.data.note
    );

    if (!order) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    if (message === "ORDER_NOT_FOUND") {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: { code: "UPDATE_FAILED", message } },
      { status: 500 }
    );
  }
}
