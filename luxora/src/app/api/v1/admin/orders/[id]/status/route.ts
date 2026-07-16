import { NextResponse } from "next/server";
import { requireAdminWrite } from "@/lib/api-auth";
import { apiError, logApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { adminRatelimit } from "@/lib/redis";
import { adminOrderStatusSchema } from "@/lib/validations/order";
import { updateAdminOrderStatus, getAdminOrderById } from "@/services/order.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { session, isDemo, error } = await requireAdminWrite();
  if (error) return error;

  const limited = await enforceRateLimit({
    limiter: adminRatelimit,
    key: `admin-order-status:${session!.user.id}:${getClientIp(request)}`,
    fallbackLimit: 60,
    fallbackWindowMs: 60 * 1000,
  });
  if (limited) return limited;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = adminOrderStatusSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", parsed.error.flatten() as unknown as Record<string, unknown>, 400);
  }

  try {
    if (isDemo) {
      const order = await getAdminOrderById(id);
      if (!order) {
        return apiError("NOT_FOUND", "Order not found", 404);
      }
      return NextResponse.json({ ...order, status: parsed.data.status });
    }

    const order = await updateAdminOrderStatus(
      id,
      parsed.data.status,
      session!.user.id,
      parsed.data.note
    );

    if (!order) {
      return apiError("NOT_FOUND", "Order not found", 404);
    }

    return NextResponse.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    if (message === "ORDER_NOT_FOUND") {
      return apiError("NOT_FOUND", "Order not found", 404);
    }
    logApiError("PATCH /api/v1/admin/orders/[id]/status", err);
    return apiError("UPDATE_FAILED", message, 500);
  }
}
