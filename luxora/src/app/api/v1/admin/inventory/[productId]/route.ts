import { NextResponse } from "next/server";
import { requireAdminWrite } from "@/lib/api-auth";
import { apiError, logApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { adminRatelimit } from "@/lib/redis";
import { adminInventoryAdjustSchema } from "@/lib/validations/inventory";
import { adjustInventory } from "@/services/inventory.service";

type RouteContext = { params: Promise<{ productId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { session, isDemo, error } = await requireAdminWrite();
  if (error) return error;

  const limited = await enforceRateLimit({
    limiter: adminRatelimit,
    key: `admin-inventory:${session!.user.id}:${getClientIp(request)}`,
    fallbackLimit: 60,
    fallbackWindowMs: 60 * 1000,
  });
  if (limited) return limited;

  const { productId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = adminInventoryAdjustSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      parsed.error.flatten() as unknown as Record<string, unknown>,
      400
    );
  }

  try {
    if (isDemo) {
      return NextResponse.json({
        inventory: {
          productId,
          quantity: 100, // mock quantity
          reserved: 0,
        },
      });
    }

    const result = await adjustInventory({
      productId,
      quantityChange: parsed.data.quantityChange,
      reason: parsed.data.reason,
      changeType: parsed.data.changeType,
      adminUserId: session!.user.id,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Adjustment failed";

    if (message === "INVENTORY_NOT_FOUND") {
      return apiError("NOT_FOUND", "Inventory record not found", 404);
    }

    if (message === "STOCK_BELOW_ZERO" || message === "STOCK_BELOW_RESERVED") {
      return apiError(
        "INVALID_ADJUSTMENT",
        message === "STOCK_BELOW_ZERO"
          ? "Stock cannot be reduced below zero"
          : "Stock cannot fall below reserved quantity",
        400
      );
    }

    logApiError("PATCH /api/v1/admin/inventory/[productId]", err);
    return apiError("ADJUSTMENT_FAILED", message, 500);
  }
}
