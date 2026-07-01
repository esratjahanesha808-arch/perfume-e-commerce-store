import { z } from "zod";

export const adminInventoryListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  search: z.string().trim().max(120).optional(),
  lowStockOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

export const adminInventoryAdjustSchema = z.object({
  quantityChange: z.coerce
    .number()
    .int()
    .refine((value) => value !== 0, "Adjustment cannot be zero"),
  reason: z.string().trim().min(1, "Reason is required").max(500),
  changeType: z.enum(["ADJUSTMENT", "RESTOCK", "CORRECTION"]).optional().default("ADJUSTMENT"),
});

export type AdminInventoryListQuery = z.infer<typeof adminInventoryListQuerySchema>;
export type AdminInventoryAdjustInput = z.infer<typeof adminInventoryAdjustSchema>;
