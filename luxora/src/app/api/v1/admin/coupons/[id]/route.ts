import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { updateCouponSchema } from "@/lib/validations/coupon";
import {
  CouponError,
  deleteCoupon,
  getCouponUsageStats,
  updateCoupon,
} from "@/services/coupon.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;

  try {
    const data = await getCouponUsageStats(id);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof CouponError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: 404 }
      );
    }

    console.error("[GET /api/v1/admin/coupons/[id]]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to load coupon usage" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const parsed = updateCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const coupon = await updateCoupon(id, parsed.data);
    return NextResponse.json({ data: coupon });
  } catch (err) {
    if (err instanceof CouponError) {
      const status = err.code === "COUPON_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status }
      );
    }

    console.error("[PUT /api/v1/admin/coupons/[id]]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to update coupon" } },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;

  try {
    await deleteCoupon(id);
    return NextResponse.json({ data: { id } });
  } catch (err) {
    if (err instanceof CouponError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: 404 }
      );
    }

    console.error("[DELETE /api/v1/admin/coupons/[id]]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to delete coupon" } },
      { status: 500 }
    );
  }
}
