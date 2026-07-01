import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { CouponError, getCouponUsageStats } from "@/services/coupon.service";

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

    console.error("[GET /api/v1/admin/coupons/[id]/usage]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to load coupon usage" } },
      { status: 500 }
    );
  }
}
