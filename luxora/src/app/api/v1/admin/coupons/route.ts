import { NextResponse } from "next/server";
import { requireAdmin, requireAdminWrite } from "@/lib/api-auth";
import { apiError, apiSuccess, logApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { adminRatelimit } from "@/lib/redis";
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
  const { session, isDemo, error } = await requireAdminWrite();
  if (error) return error;

  const limited = await enforceRateLimit({
    limiter: adminRatelimit,
    key: `admin-coupon:${session!.user.id}:${getClientIp(request)}`,
    fallbackLimit: 60,
    fallbackWindowMs: 60 * 1000,
  });
  if (limited) return limited;

  try {
    const body = await request.json();
    const parsed = createCouponSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        "VALIDATION_ERROR",
        parsed.error.flatten().fieldErrors as Record<string, unknown>,
        400
      );
    }

    if (isDemo) {
      return apiSuccess(
        {
          id: `demo-${Date.now()}`,
          ...parsed.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        201
      );
    }

    const coupon = await createCoupon(parsed.data);
    return apiSuccess(coupon, 201);
  } catch (err) {
    if (err instanceof CouponError) {
      return apiError(err.code, err.message, 400);
    }

    logApiError("POST /api/v1/admin/coupons", err);
    return apiError("SERVER_ERROR", "Failed to create coupon", 500);
  }
}
