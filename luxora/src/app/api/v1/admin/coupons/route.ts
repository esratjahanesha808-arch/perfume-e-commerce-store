import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import {
  adminCouponListQuerySchema,
  createCouponSchema,
} from "@/lib/validations/coupon";
import { CouponError, createCoupon, getAdminCoupons } from "@/services/coupon.service";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const parsed = adminCouponListQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const data = await getAdminCoupons(parsed.data);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = createCouponSchema.safeParse(body);

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

    const coupon = await createCoupon(parsed.data);
    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch (err) {
    if (err instanceof CouponError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: 400 }
      );
    }

    console.error("[POST /api/v1/admin/coupons]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to create coupon" } },
      { status: 500 }
    );
  }
}
