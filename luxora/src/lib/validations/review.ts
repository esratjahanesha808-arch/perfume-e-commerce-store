import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().trim().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  comment: z
    .string()
    .trim()
    .min(10, "Review must be at least 10 characters")
    .max(2000),
});

export const adminReviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  search: z.string().trim().max(120).optional(),
  status: z.enum(["all", "pending", "approved"]).optional().default("all"),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

export const moderateReviewSchema = z.object({
  isApproved: z.boolean(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type AdminReviewListQuery = z.infer<typeof adminReviewListQuerySchema>;
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;
