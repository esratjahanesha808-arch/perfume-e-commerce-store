import { db, isDbConfigured } from "@/lib/prisma";
import { getInitials } from "@/lib/loyalty";
import type { OrderStatus } from "@prisma/client";

const QUALIFYING_STATUSES: OrderStatus[] = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

const DAY_MS = 86_400_000;

export type AdminDateRange = {
  from: Date;
  to: Date;
};

export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function parseAdminDateRange(params: {
  from?: string;
  to?: string;
}): AdminDateRange {
  const to = params.to ? endOfDay(new Date(params.to)) : endOfDay(new Date());
  const from = params.from
    ? startOfDay(new Date(params.from))
    : startOfDay(new Date(to.getTime() - 6 * DAY_MS));
  return { from, to };
}

function getPreviousPeriod(range: AdminDateRange): AdminDateRange {
  const duration = range.to.getTime() - range.from.getTime();
  return {
    from: new Date(range.from.getTime() - duration - DAY_MS),
    to: new Date(range.from.getTime() - DAY_MS),
  };
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function orderWhereInRange(range: AdminDateRange) {
  return {
    status: { in: QUALIFYING_STATUSES },
    createdAt: { gte: range.from, lte: range.to },
  };
}

async function getPeriodMetrics(range: AdminDateRange) {
  const [orderAgg, newCustomers] = await Promise.all([
    db.order.aggregate({
      where: orderWhereInRange(range),
      _count: { _all: true },
      _sum: { total: true },
    }),
    db.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: range.from, lte: range.to },
      },
    }),
  ]);

  return {
    totalOrders: orderAgg._count._all,
    totalSales: Number(orderAgg._sum.total ?? 0),
    newCustomers,
  };
}

function buildDailySalesSeries(
  range: AdminDateRange,
  orders: { createdAt: Date; total: unknown }[]
) {
  const days: { label: string; key: string; sales: number }[] = [];
  const cursor = startOfDay(range.from);
  const end = startOfDay(range.to);

  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({
      key,
      label: cursor.toLocaleDateString("en-US", { weekday: "short" }),
      sales: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const order of orders) {
    const key = startOfDay(order.createdAt).toISOString().slice(0, 10);
    const bucket = days.find((d) => d.key === key);
    if (bucket) bucket.sales += Number(order.total);
  }

  return days;
}

export async function getAdminSidebarMeta() {
  if (!isDbConfigured) {
    return { notificationCount: 0 };
  }

  const [pendingOrders, pendingReviews, lowStockCount] = await Promise.all([
    db.order.count({ where: { status: "PENDING" } }),
    db.review.count({ where: { isApproved: false } }),
    db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM inventory
      WHERE quantity <= low_stock_threshold
    `.then((rows) => Number(rows[0]?.count ?? 0)),
  ]);

  return { notificationCount: pendingOrders + pendingReviews + lowStockCount };
}

export async function getAdminDashboardOverview(range: AdminDateRange) {
  if (!isDbConfigured) {
    return getEmptyDashboardOverview(range);
  }

  const previousRange = getPreviousPeriod(range);

  const [
    currentMetrics,
    previousMetrics,
    totalCustomers,
    totalProducts,
    reviewAgg,
    currentOrders,
    previousOrders,
    recentOrders,
    topProductGroups,
    topCustomerGroups,
    categoryBreakdown,
  ] = await Promise.all([
    getPeriodMetrics(range),
    getPeriodMetrics(previousRange),
    db.user.count({ where: { role: "CUSTOMER", isActive: true } }),
    db.product.count({ where: { isActive: true } }),
    db.review.aggregate({
      where: { isApproved: true },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    db.order.findMany({
      where: orderWhereInRange(range),
      select: { createdAt: true, total: true },
    }),
    db.order.findMany({
      where: orderWhereInRange(previousRange),
      select: { createdAt: true, total: true },
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        items: {
          take: 1,
          select: {
            productName: true,
            productImage: true,
            quantity: true,
          },
        },
      },
    }),
    db.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: orderWhereInRange(range),
      },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { subtotal: "desc" } },
      take: 5,
    }),
    db.order.groupBy({
      by: ["userId"],
      where: orderWhereInRange(range),
      _sum: { total: true },
      _count: { _all: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
    db.orderItem.findMany({
      where: { order: orderWhereInRange(range) },
      select: {
        subtotal: true,
        product: {
          select: {
            category: { select: { id: true, name: true } },
          },
        },
      },
    }),
  ]);

  const avgRating = Number(reviewAgg._avg.rating ?? 0);

  const productIds = topProductGroups.map((g) => g.productId);
  const products =
    productIds.length > 0
      ? await db.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            name: true,
            slug: true,
            images: {
              orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }],
              select: { url: true },
              take: 1,
            },
          },
        })
      : [];

  const productMap = new Map(products.map((p) => [p.id, p]));

  const userIds = topCustomerGroups.map((g) => g.userId);
  const users =
    userIds.length > 0
      ? await db.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];

  const userMap = new Map(users.map((u) => [u.id, u]));

  const categoryTotals = new Map<string, { name: string; total: number }>();
  for (const item of categoryBreakdown) {
    const name = item.product.category?.name ?? "Uncategorized";
    const id = item.product.category?.id ?? "uncategorized";
    const existing = categoryTotals.get(id) ?? { name, total: 0 };
    existing.total += Number(item.subtotal);
    categoryTotals.set(id, existing);
  }

  const categorySalesTotal = [...categoryTotals.values()].reduce(
    (sum, c) => sum + c.total,
    0
  );

  const salesByCategory = [...categoryTotals.values()]
    .sort((a, b) => b.total - a.total)
    .map((c) => ({
      name: c.name,
      value: c.total,
      percent:
        categorySalesTotal > 0
          ? Number(((c.total / categorySalesTotal) * 100).toFixed(1))
          : 0,
    }));

  const thisWeekSeries = buildDailySalesSeries(range, currentOrders);
  const lastWeekSeries = buildDailySalesSeries(previousRange, previousOrders);

  const salesChart = thisWeekSeries.map((day, index) => ({
    day: day.label,
    thisPeriod: day.sales,
    lastPeriod: lastWeekSeries[index]?.sales ?? 0,
  }));

  return {
    dateRange: {
      from: range.from.toISOString(),
      to: range.to.toISOString(),
    },
    kpis: {
      totalOrders: {
        value: currentMetrics.totalOrders,
        change: percentChange(
          currentMetrics.totalOrders,
          previousMetrics.totalOrders
        ),
      },
      totalSales: {
        value: currentMetrics.totalSales,
        change: percentChange(
          currentMetrics.totalSales,
          previousMetrics.totalSales
        ),
      },
      totalCustomers: {
        value: totalCustomers,
        change: percentChange(
          currentMetrics.newCustomers,
          previousMetrics.newCustomers
        ),
      },
      totalProducts: {
        value: totalProducts,
        change: null,
      },
      averageRating: {
        value: avgRating,
        change: null,
      },
    },
    salesChart,
    salesChartTotal: currentMetrics.totalSales,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      productName: order.items[0]?.productName ?? "—",
      productImage: order.items[0]?.productImage ?? null,
    })),
    topProducts: topProductGroups.map((group) => {
      const product = productMap.get(group.productId);
      return {
        id: group.productId,
        name: product?.name ?? "Unknown Product",
        slug: product?.slug,
        imageUrl: product?.images[0]?.url ?? null,
        quantitySold: group._sum.quantity ?? 0,
        revenue: Number(group._sum.subtotal ?? 0),
      };
    }),
    topCustomers: topCustomerGroups.map((group) => {
      const user = userMap.get(group.userId);
      const name = user?.name ?? "Customer";
      const email = user?.email ?? "";
      return {
        id: group.userId,
        name,
        email,
        initials: getInitials(name, email),
        orderCount: group._count._all,
        totalSpent: Number(group._sum.total ?? 0),
      };
    }),
    salesByCategory,
    categorySalesTotal,
  };
}

function getEmptyDashboardOverview(range: AdminDateRange) {
  return {
    dateRange: {
      from: range.from.toISOString(),
      to: range.to.toISOString(),
    },
    kpis: {
      totalOrders: { value: 0, change: null },
      totalSales: { value: 0, change: null },
      totalCustomers: { value: 0, change: null },
      totalProducts: { value: 0, change: null },
      averageRating: { value: 0, change: null },
    },
    salesChart: [],
    salesChartTotal: 0,
    recentOrders: [],
    topProducts: [],
    topCustomers: [],
    salesByCategory: [],
    categorySalesTotal: 0,
  };
}
