import { z } from "zod";

export const adminCollectionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  search: z.string().trim().max(120).optional(),
});

export const adminCollectionUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
});

export type AdminCollectionListQuery = z.infer<typeof adminCollectionListQuerySchema>;
export type AdminCollectionUpdateInput = z.infer<typeof adminCollectionUpdateSchema>;
