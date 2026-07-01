import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getUserOrders } from "@/services/order.service";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");

    const data = await getUserOrders(session!.user!.id, page);

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[GET /api/v1/orders]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to load orders" } },
      { status: 500 }
    );
  }
}
