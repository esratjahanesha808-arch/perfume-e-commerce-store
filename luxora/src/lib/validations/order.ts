import { z } from "zod";

const orderStatusValues = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export const adminOrderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  status: z.enum(orderStatusValues).optional(),
  search: z.string().trim().max(120).optional(),
  sort: z.enum(["createdAt", "total"]).optional().default("createdAt"),
  direction: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(orderStatusValues),
  note: z.string().trim().max(500).optional(),
});

export type AdminOrderListQuery = z.infer<typeof adminOrderListQuerySchema>;
export type AdminOrderStatusInput = z.infer<typeof adminOrderStatusSchema>;
