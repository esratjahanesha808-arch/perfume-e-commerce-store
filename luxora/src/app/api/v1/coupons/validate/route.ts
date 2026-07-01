import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { validateCouponSchema } from "@/lib/validations/coupon";
import { CouponError, validateCouponForUser } from "@/services/coupon.service";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = validateCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid coupon request" } },
        { status: 400 }
      );
    }

    const result = await validateCouponForUser(
      parsed.data.code,
      session!.user!.id,
      parsed.data.subtotal,
      parsed.data.shippingMethod
    );

    return NextResponse.json({ data: result });
  } catch (err) {
    if (err instanceof CouponError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: 400 }
      );
    }

    console.error("[POST /api/v1/coupons/validate]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to validate coupon" } },
      { status: 500 }
    );
  }
}
