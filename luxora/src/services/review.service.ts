import type { OrderStatus, Prisma } from "@prisma/client";
import { db, isDbConfigured } from "@/lib/prisma";
import { sanitizePlainText } from "@/lib/sanitize-text";
import type {
  AdminReviewListQuery,
  CreateReviewInput,
} from "@/lib/validations/review";

const REVIEWS_PER_PAGE = 20;

const VERIFIED_PURCHASE_STATUSES: OrderStatus[] = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export class ReviewError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function formatReviewRow(review: {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: Date;
  user: { id: string; name: string | null; email: string };
  product: {
    id: string;
    name: string;
    slug: string;
    images: { url: string; altText: string | null }[];
  };
}) {
  return {
    id: review.id,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    isVerified: review.isVerified,
    isApproved: review.isApproved,
    helpfulCount: review.helpfulCount,
    createdAt: review.createdAt.toISOString(),
    user: {
      id: review.user.id,
      name: review.user.name,
      email: review.user.email,
    },
    product: {
      id: review.product.id,
      name: review.product.name,
      slug: review.product.slug,
      imageUrl: review.product.images[0]?.url ?? null,
    },
  };
}

export async function userHasPurchasedProduct(userId: string, productId: string) {
  if (!isDbConfigured) return false;

  const item = await db.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: { in: VERIFIED_PURCHASE_STATUSES },
        payment: { status: "SUCCEEDED" },
      },
    },
    select: { id: true },
  });

  return Boolean(item);
}

export async function getUserReviewForProduct(userId: string, productId: string) {
  if (!isDbConfigured) return null;

  return db.review.findUnique({
    where: { userId_productId: { userId, productId } },
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      isApproved: true,
      isVerified: true,
      createdAt: true,
    },
  });
}

export async function recalculateProductRating(productId: string) {
  if (!isDbConfigured) return;

  const agg = await db.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { id: true },
  });

  const avgRating = agg._avg.rating ?? 0;
  const reviewCount = agg._count.id;

  await db.product.update({
    where: { id: productId },
    data: {
      avgRating: Math.round(Number(avgRating) * 100) / 100,
      reviewCount,
    },
  });
}

export async function createReview(userId: string, input: CreateReviewInput) {
  if (!isDbConfigured) {
    throw new ReviewError("DB_UNAVAILABLE", "Database is not configured");
  }

  const product = await db.product.findFirst({
    where: { id: input.productId, isActive: true },
    select: { id: true },
  });

  if (!product) {
    throw new ReviewError("PRODUCT_NOT_FOUND", "Product not found");
  }

  const purchased = await userHasPurchasedProduct(userId, input.productId);
  if (!purchased) {
    throw new ReviewError(
      "NOT_VERIFIED_BUYER",
      "Only verified purchasers can submit a review"
    );
  }

  const existing = await db.review.findUnique({
    where: { userId_productId: { userId, productId: input.productId } },
    select: { id: true },
  });

  if (existing) {
    throw new ReviewError("REVIEW_EXISTS", "You have already reviewed this product");
  }

  const title = sanitizePlainText(input.title, 120);
  const comment = sanitizePlainText(input.comment, 2000);

  const review = await db.review.create({
    data: {
      userId,
      productId: input.productId,
      rating: input.rating,
      title,
      comment,
      isVerified: true,
      isApproved: false,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
            select: { url: true, altText: true },
          },
        },
      },
    },
  });

  return formatReviewRow(review);
}

export async function markReviewHelpful(reviewId: string) {
  if (!isDbConfigured) {
    throw new ReviewError("DB_UNAVAILABLE", "Database is not configured");
  }

  const review = await db.review.findFirst({
    where: { id: reviewId, isApproved: true },
    select: { id: true, helpfulCount: true },
  });

  if (!review) {
    throw new ReviewError("REVIEW_NOT_FOUND", "Review not found");
  }

  const updated = await db.review.update({
    where: { id: reviewId },
    data: { helpfulCount: { increment: 1 } },
    select: { helpfulCount: true },
  });

  return updated.helpfulCount;
}

export async function getAdminReviews(params: AdminReviewListQuery) {
  if (!isDbConfigured) {
    return {
      reviews: [],
      total: 0,
      page: params.page,
      totalPages: 0,
      stats: { pending: 0, approved: 0, distribution: [] as { star: number; count: number }[] },
    };
  }

  const where: Prisma.ReviewWhereInput = {};

  if (params.status === "pending") where.isApproved = false;
  if (params.status === "approved") where.isApproved = true;
  if (params.rating) where.rating = params.rating;

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { comment: { contains: params.search, mode: "insensitive" } },
      { product: { name: { contains: params.search, mode: "insensitive" } } },
      { user: { email: { contains: params.search, mode: "insensitive" } } },
      { user: { name: { contains: params.search, mode: "insensitive" } } },
    ];
  }

  const skip = (params.page - 1) * REVIEWS_PER_PAGE;

  const [reviews, total, pending, approved, distributionRows] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: REVIEWS_PER_PAGE,
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: {
              orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
              take: 1,
              select: { url: true, altText: true },
            },
          },
        },
      },
    }),
    db.review.count({ where }),
    db.review.count({ where: { isApproved: false } }),
    db.review.count({ where: { isApproved: true } }),
    db.review.groupBy({
      by: ["rating"],
      where: { isApproved: true },
      _count: { id: true },
      orderBy: { rating: "desc" },
    }),
  ]);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: distributionRows.find((row) => row.rating === star)?._count.id ?? 0,
  }));

  return {
    reviews: reviews.map(formatReviewRow),
    total,
    page: params.page,
    totalPages: Math.max(1, Math.ceil(total / REVIEWS_PER_PAGE)),
    stats: { pending, approved, distribution },
  };
}

export async function moderateReview(reviewId: string, isApproved: boolean) {
  if (!isDbConfigured) {
    throw new ReviewError("DB_UNAVAILABLE", "Database is not configured");
  }

  const review = await db.review.findUnique({
    where: { id: reviewId },
    select: { id: true, productId: true },
  });

  if (!review) {
    throw new ReviewError("REVIEW_NOT_FOUND", "Review not found");
  }

  const updated = await db.review.update({
    where: { id: reviewId },
    data: { isApproved },
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
            select: { url: true, altText: true },
          },
        },
      },
    },
  });

  await recalculateProductRating(review.productId);

  return formatReviewRow(updated);
}

export async function deleteReview(reviewId: string) {
  if (!isDbConfigured) {
    throw new ReviewError("DB_UNAVAILABLE", "Database is not configured");
  }

  const review = await db.review.findUnique({
    where: { id: reviewId },
    select: { id: true, productId: true },
  });

  if (!review) {
    throw new ReviewError("REVIEW_NOT_FOUND", "Review not found");
  }

  await db.review.delete({ where: { id: reviewId } });
  await recalculateProductRating(review.productId);
}
