import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getUserOrderById } from "@/services/order.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await context.params;
    const order = await getUserOrderById(session!.user!.id, id);

    if (!order) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: order });
  } catch (err) {
    console.error("[GET /api/v1/orders/:id]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to load order" } },
      { status: 500 }
    );
  }
}
