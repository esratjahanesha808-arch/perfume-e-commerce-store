import { NextResponse } from "next/server";
import { requireAdminWrite } from "@/lib/api-auth";
import { adminInventoryAdjustSchema } from "@/lib/validations/inventory";
import { adjustInventory } from "@/services/inventory.service";

type RouteContext = { params: Promise<{ productId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { session, isDemo, error } = await requireAdminWrite();
  if (error) return error;

  const { productId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = adminInventoryAdjustSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.flatten() } },
      { status: 400 }
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
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Inventory record not found" } },
        { status: 404 }
      );
    }

    if (message === "STOCK_BELOW_ZERO" || message === "STOCK_BELOW_RESERVED") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_ADJUSTMENT",
            message:
              message === "STOCK_BELOW_ZERO"
                ? "Stock cannot be reduced below zero"
                : "Stock cannot fall below reserved quantity",
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: "ADJUSTMENT_FAILED", message } },
      { status: 500 }
    );
  }
}
