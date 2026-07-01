import type { Coupon, CouponType } from "@prisma/client";
import { db, isDbConfigured } from "@/lib/prisma";
import type {
  AdminCouponListQuery,
  CreateCouponInput,
  UpdateCouponInput,
} from "@/lib/validations/coupon";

const COUPONS_PER_PAGE = 20;

export class CouponError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export function getShippingCostForCoupon(
  method: "standard" | "express",
  subtotal: number
) {
  if (method === "express") return 15;
  return subtotal >= 99 ? 0 : 9.99;
}

export function computeCouponDiscount(
  coupon: Pick<Coupon, "type" | "value" | "maxDiscount">,
  subtotal: number,
  shippingCost: number
) {
  if (coupon.type === "FREE_SHIPPING") {
    return {
      discountAmount: shippingCost,
      shippingCost: 0,
    };
  }

  if (coupon.type === "PERCENTAGE") {
    let discount = subtotal * (Number(coupon.value) / 100);
    if (coupon.maxDiscount != null) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }
    return {
      discountAmount: Math.min(discount, subtotal),
      shippingCost,
    };
  }

  return {
    discountAmount: Math.min(Number(coupon.value), subtotal),
    shippingCost,
  };
}

function formatCouponRow(coupon: Coupon) {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    type: coupon.type as CouponType,
    value: Number(coupon.value),
    minOrderValue: Number(coupon.minOrderValue),
    maxDiscount: coupon.maxDiscount != null ? Number(coupon.maxDiscount) : null,
    usageLimit: coupon.usageLimit,
    usageCount: coupon.usageCount,
    perUserLimit: coupon.perUserLimit,
    validFrom: coupon.validFrom.toISOString(),
    validUntil: coupon.validUntil.toISOString(),
    isActive: coupon.isActive,
    createdAt: coupon.createdAt.toISOString(),
  };
}

async function assertCouponUsable(
  coupon: Coupon,
  userId: string,
  subtotal: number
) {
  const now = new Date();

  if (!coupon.isActive) {
    throw new CouponError("COUPON_INACTIVE", "This coupon is no longer active");
  }

  if (now < coupon.validFrom) {
    throw new CouponError("COUPON_NOT_STARTED", "This coupon is not valid yet");
  }

  if (now > coupon.validUntil) {
    throw new CouponError("COUPON_EXPIRED", "This coupon has expired");
  }

  if (subtotal < Number(coupon.minOrderValue)) {
    throw new CouponError(
      "COUPON_MIN_ORDER",
      `Minimum order value is $${Number(coupon.minOrderValue).toFixed(2)}`
    );
  }

  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    throw new CouponError("COUPON_USAGE_LIMIT", "This coupon has reached its usage limit");
  }

  const userUsageCount = await db.couponUsage.count({
    where: { couponId: coupon.id, userId },
  });

  if (userUsageCount >= coupon.perUserLimit) {
    throw new CouponError(
      "COUPON_USER_LIMIT",
      "You have already used this coupon the maximum number of times"
    );
  }
}

export async function validateCouponForUser(
  code: string,
  userId: string,
  subtotal: number,
  shippingMethod: "standard" | "express" = "standard"
) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const coupon = await db.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon) {
    throw new CouponError("COUPON_NOT_FOUND", "Invalid coupon code");
  }

  await assertCouponUsable(coupon, userId, subtotal);

  const baseShipping = getShippingCostForCoupon(shippingMethod, subtotal);
  const { discountAmount, shippingCost } = computeCouponDiscount(
    coupon,
    subtotal,
    baseShipping
  );
  const total = subtotal - discountAmount + shippingCost;

  return {
    coupon: formatCouponRow(coupon),
    discountAmount,
    shippingCost,
    total,
  };
}

export async function getAdminCoupons(params: AdminCouponListQuery) {
  if (!isDbConfigured) {
    return { coupons: [], total: 0, page: 1, totalPages: 1 };
  }

  const where = {
    ...(params.status === "active" ? { isActive: true } : {}),
    ...(params.status === "inactive" ? { isActive: false } : {}),
    ...(params.search
      ? {
          OR: [
            { code: { contains: params.search, mode: "insensitive" as const } },
            { description: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, coupons] = await Promise.all([
    db.coupon.count({ where }),
    db.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * COUPONS_PER_PAGE,
      take: COUPONS_PER_PAGE,
    }),
  ]);

  return {
    coupons: coupons.map(formatCouponRow),
    total,
    page: params.page,
    totalPages: Math.max(1, Math.ceil(total / COUPONS_PER_PAGE)),
  };
}

export async function createCoupon(input: CreateCouponInput) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const existing = await db.coupon.findUnique({ where: { code: input.code } });
  if (existing) {
    throw new CouponError("COUPON_EXISTS", "A coupon with this code already exists");
  }

  const coupon = await db.coupon.create({
    data: {
      code: input.code,
      description: input.description,
      type: input.type,
      value: input.type === "FREE_SHIPPING" ? 1 : input.value,
      minOrderValue: input.minOrderValue,
      maxDiscount: input.type === "PERCENTAGE" ? input.maxDiscount ?? null : null,
      usageLimit: input.usageLimit ?? null,
      perUserLimit: input.perUserLimit,
      validFrom: input.validFrom,
      validUntil: input.validUntil,
      isActive: input.isActive,
    },
  });

  return formatCouponRow(coupon);
}

export async function updateCoupon(id: string, input: UpdateCouponInput) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const existing = await db.coupon.findUnique({ where: { id } });
  if (!existing) {
    throw new CouponError("COUPON_NOT_FOUND", "Coupon not found");
  }

  if (input.code && input.code !== existing.code) {
    const duplicate = await db.coupon.findUnique({ where: { code: input.code } });
    if (duplicate) {
      throw new CouponError("COUPON_EXISTS", "A coupon with this code already exists");
    }
  }

  const nextType = input.type ?? existing.type;
  const coupon = await db.coupon.update({
    where: { id },
    data: {
      ...(input.code !== undefined ? { code: input.code } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.value !== undefined
        ? { value: nextType === "FREE_SHIPPING" ? 1 : input.value }
        : {}),
      ...(input.minOrderValue !== undefined ? { minOrderValue: input.minOrderValue } : {}),
      ...(input.maxDiscount !== undefined
        ? { maxDiscount: nextType === "PERCENTAGE" ? input.maxDiscount : null }
        : {}),
      ...(input.usageLimit !== undefined ? { usageLimit: input.usageLimit } : {}),
      ...(input.perUserLimit !== undefined ? { perUserLimit: input.perUserLimit } : {}),
      ...(input.validFrom !== undefined ? { validFrom: input.validFrom } : {}),
      ...(input.validUntil !== undefined ? { validUntil: input.validUntil } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return formatCouponRow(coupon);
}

export async function deleteCoupon(id: string) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const existing = await db.coupon.findUnique({ where: { id } });
  if (!existing) {
    throw new CouponError("COUPON_NOT_FOUND", "Coupon not found");
  }

  await db.coupon.delete({ where: { id } });
  return { id };
}

export async function getCouponUsageStats(id: string) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const coupon = await db.coupon.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      usageCount: true,
      usageLimit: true,
      couponUsages: {
        orderBy: { usedAt: "desc" },
        take: 10,
        select: {
          id: true,
          usedAt: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!coupon) {
    throw new CouponError("COUPON_NOT_FOUND", "Coupon not found");
  }

  return {
    id: coupon.id,
    code: coupon.code,
    usageCount: coupon.usageCount,
    usageLimit: coupon.usageLimit,
    recentUsages: coupon.couponUsages.map((usage) => ({
      id: usage.id,
      usedAt: usage.usedAt.toISOString(),
      userName: usage.user.name,
      userEmail: usage.user.email,
    })),
  };
}

export async function recordCouponUsage(
  tx: Pick<typeof db, "coupon" | "couponUsage">,
  couponId: string,
  userId: string,
  orderId: string
) {
  await tx.couponUsage.create({
    data: { couponId, userId, orderId },
  });

  await tx.coupon.update({
    where: { id: couponId },
    data: { usageCount: { increment: 1 } },
  });
}
