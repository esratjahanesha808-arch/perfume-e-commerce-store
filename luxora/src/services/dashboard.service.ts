import { db, isDbConfigured } from "@/lib/prisma";
import {
  getInitials,
  getLoyaltyProgress,
} from "@/lib/loyalty";
import { getFeaturedProducts } from "@/services/product.service";
import { getUserProfile, resolveUserLoyaltyPoints } from "@/services/user.service";
import { toProductCard } from "@/lib/serialize-product";

const QUALIFYING_STATUSES = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

export async function getDashboardSidebarStats(userId: string) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const [profile, wishlistCount, reviewCount, loyaltyPoints] = await Promise.all([
    getUserProfile(userId),
    db.wishlistItem.count({ where: { userId } }),
    db.review.count({ where: { userId } }),
    resolveUserLoyaltyPoints(userId),
  ]);

  const orderAgg = await db.order.aggregate({
    where: {
      userId,
      status: { in: [...QUALIFYING_STATUSES] },
    },
    _count: { _all: true },
    _sum: { total: true },
  });

  const loyalty = getLoyaltyProgress(loyaltyPoints);

  return {
    name: profile.name || "Member",
    email: profile.email,
    initials: getInitials(profile.name, profile.email),
    tierName: loyalty.tier.name,
    wishlistCount,
    reviewCount,
    orderCount: orderAgg._count._all,
  };
}

export async function getDashboardOverview(userId: string) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const [profile, orderAgg, wishlistCount, recentOrders, featured, loyaltyPoints] =
    await Promise.all([
      getUserProfile(userId),
      db.order.aggregate({
        where: {
          userId,
          status: { in: [...QUALIFYING_STATUSES] },
        },
        _count: { _all: true },
        _sum: { total: true },
      }),
      db.wishlistItem.count({ where: { userId } }),
      db.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          items: {
            select: {
              productName: true,
              productImage: true,
              quantity: true,
            },
            take: 1,
          },
        },
      }),
      getFeaturedProducts(2),
      resolveUserLoyaltyPoints(userId),
    ]);

  const totalSpent = Number(orderAgg._sum.total ?? 0);
  const loyalty = getLoyaltyProgress(loyaltyPoints);

  return {
    user: {
      name: profile.name || "Member",
      email: profile.email,
      initials: getInitials(profile.name, profile.email),
      memberSince: profile.memberSince,
    },
    stats: {
      totalOrders: orderAgg._count._all,
      loyaltyPoints,
      wishlistCount,
      totalSpent,
    },
    loyalty,
    recentOrders: recentOrders.map((order) => ({
      ...order,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
    })),
    recommendations: featured.map((product) => toProductCard(product)),
  };
}

export async function getUserReviewsForDashboard(userId: string) {
  if (!isDbConfigured) return [];

  const reviews = await db.review.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      isApproved: true,
      isVerified: true,
      createdAt: true,
      product: {
        select: {
          name: true,
          slug: true,
          images: {
            orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }],
            select: { url: true, altText: true },
            take: 1,
          },
        },
      },
    },
  });

  return reviews;
}
