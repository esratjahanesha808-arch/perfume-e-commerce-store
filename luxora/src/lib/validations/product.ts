import { z } from "zod";

export const adminProductListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  search: z.string().trim().max(120).optional(),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
});

export const adminProductUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  price: z.coerce.number().positive().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  volume: z.string().trim().max(20).optional().nullable(),
});

export type AdminProductListQuery = z.infer<typeof adminProductListQuerySchema>;
export type AdminProductUpdateInput = z.infer<typeof adminProductUpdateSchema>;
