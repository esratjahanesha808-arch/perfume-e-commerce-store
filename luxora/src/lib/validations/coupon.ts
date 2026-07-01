import { z } from "zod";

const couponTypeValues = ["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"] as const;

const couponBaseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Code must be at least 3 characters")
    .max(50)
    .transform((value) => value.toUpperCase()),
  description: z.string().trim().max(500).optional(),
  type: z.enum(couponTypeValues),
  value: z.coerce.number().positive("Value must be greater than zero"),
  minOrderValue: z.coerce.number().min(0).optional().default(0),
  maxDiscount: z.coerce.number().positive().optional().nullable(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  perUserLimit: z.coerce.number().int().min(1).optional().default(1),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  isActive: z.boolean().optional().default(true),
});

export const adminCouponListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  search: z.string().trim().max(120).optional(),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
});

export const createCouponSchema = couponBaseSchema
  .refine((data) => data.validUntil > data.validFrom, {
    message: "End date must be after start date",
    path: ["validUntil"],
  })
  .refine(
    (data) => data.type !== "PERCENTAGE" || data.value <= 100,
    { message: "Percentage cannot exceed 100", path: ["value"] }
  );

export const updateCouponSchema = couponBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })
  .refine(
    (data) =>
      !data.validFrom ||
      !data.validUntil ||
      data.validUntil > data.validFrom,
    {
      message: "End date must be after start date",
      path: ["validUntil"],
    }
  )
  .refine(
    (data) =>
      data.type !== "PERCENTAGE" ||
      data.value == null ||
      data.value <= 100,
    { message: "Percentage cannot exceed 100", path: ["value"] }
  );

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1).max(50),
  subtotal: z.coerce.number().min(0),
  shippingMethod: z.enum(["standard", "express"]).optional().default("standard"),
});

export type AdminCouponListQuery = z.infer<typeof adminCouponListQuerySchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
