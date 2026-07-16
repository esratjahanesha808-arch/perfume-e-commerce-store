import { db, isDbConfigured } from "@/lib/prisma";
import { startOfDay, endOfDay } from "@/services/admin.service";

// ── Helpers ────────────────────────────────────────────────────

function monthKey(date: Date) {
  return date.toISOString().slice(0, 7); // "YYYY-MM"
}

function last12MonthKeys() {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

// ── Sales Report ───────────────────────────────────────────────

export type SalesReportData = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  newCustomers: number;
  ordersByStatus: { status: string; count: number }[];
  monthlySeries: { month: string; revenue: number; orders: number }[];
};

export async function getSalesReport(range: {
  from: Date;
  to: Date;
}): Promise<SalesReportData> {
  if (!isDbConfigured) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      newCustomers: 0,
      ordersByStatus: [],
      monthlySeries: last12MonthKeys().map((month) => ({ month, revenue: 0, orders: 0 })),
    };
  }

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [agg, newCustomers, statusGroups, recentOrders] = await Promise.all([
    db.order.aggregate({
      where: {
        status: { notIn: ["CANCELLED", "REFUNDED"] },
        createdAt: { gte: range.from, lte: range.to },
      },
      _count: { _all: true },
      _sum: { total: true },
    }),
    db.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: range.from, lte: range.to },
      },
    }),
    db.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
    }),
    db.order.findMany({
      where: {
        status: { notIn: ["CANCELLED", "REFUNDED"] },
        createdAt: { gte: twelveMonthsAgo },
      },
      select: { createdAt: true, total: true },
    }),
  ]);

  const totalRevenue = Number(agg._sum.total ?? 0);
  const totalOrders = agg._count._all;

  // Build monthly series
  const keys = last12MonthKeys();
  const monthly: Record<string, { revenue: number; orders: number }> = {};
  for (const k of keys) monthly[k] = { revenue: 0, orders: 0 };
  for (const o of recentOrders) {
    const k = monthKey(o.createdAt);
    if (monthly[k]) {
      monthly[k].revenue += Number(o.total);
      monthly[k].orders += 1;
    }
  }

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    newCustomers,
    ordersByStatus: statusGroups.map((g) => ({
      status: g.status,
      count: g._count._all,
    })),
    monthlySeries: keys.map((month) => ({
      month,
      revenue: Math.round(monthly[month].revenue * 100) / 100,
      orders: monthly[month].orders,
    })),
  };
}

// ── Products Report ────────────────────────────────────────────

export type ProductReportRow = {
  id: string;
  name: string;
  slug: string;
  brandName: string | null;
  unitsSold: number;
  revenue: number;
  avgRating: number;
  reviewCount: number;
};

export async function getProductsReport(): Promise<{
  byRevenue: ProductReportRow[];
  byUnits: ProductReportRow[];
}> {
  if (!isDbConfigured) return { byRevenue: [], byUnits: [] };

  // Aggregate order items (exclude cancelled/refunded orders)
  const orderItems = await db.orderItem.findMany({
    where: { order: { status: { notIn: ["CANCELLED", "REFUNDED"] } } },
    select: {
      productId: true,
      quantity: true,
      unitPrice: true,
    },
  });

  // Sum per product
  const productMap: Record<string, { units: number; revenue: number }> = {};
  for (const item of orderItems) {
    if (!productMap[item.productId]) {
      productMap[item.productId] = { units: 0, revenue: 0 };
    }
    productMap[item.productId].units += item.quantity;
    productMap[item.productId].revenue += Number(item.unitPrice) * item.quantity;
  }

  const productIds = Object.keys(productMap);
  if (productIds.length === 0) return { byRevenue: [], byUnits: [] };

  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      slug: true,
      avgRating: true,
      reviewCount: true,
      brand: { select: { name: true } },
    },
  });

  const rows: ProductReportRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brandName: p.brand?.name ?? null,
    unitsSold: productMap[p.id]?.units ?? 0,
    revenue: Math.round((productMap[p.id]?.revenue ?? 0) * 100) / 100,
    avgRating: Number(p.avgRating),
    reviewCount: p.reviewCount,
  }));

  const byRevenue = [...rows].sort((a, b) => b.revenue - a.revenue).slice(0, 20);
  const byUnits = [...rows].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 20);

  return { byRevenue, byUnits };
}

// ── Customers Report ───────────────────────────────────────────

export type CustomerReportRow = {
  id: string;
  name: string | null;
  email: string;
  orderCount: number;
  totalSpent: number;
  joinedAt: string;
};

export async function getCustomersReport(): Promise<{
  totalCustomers: number;
  newThisMonth: number;
  topBySpend: CustomerReportRow[];
  monthlyAcquisition: { month: string; count: number }[];
}> {
  if (!isDbConfigured) {
    return {
      totalCustomers: 0,
      newThisMonth: 0,
      topBySpend: [],
      monthlyAcquisition: last12MonthKeys().map((month) => ({ month, count: 0 })),
    };
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [totalCustomers, newThisMonth, customers, recentSignups] = await Promise.all([
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: monthStart } } }),
    db.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        orders: {
          where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
          select: { total: true },
        },
      },
    }),
    db.user.findMany({
      where: { role: "CUSTOMER", createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    }),
  ]);

  const rows: CustomerReportRow[] = customers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    orderCount: u.orders.length,
    totalSpent: u.orders.reduce((s, o) => s + Number(o.total), 0),
    joinedAt: u.createdAt.toISOString(),
  }));

  const topBySpend = rows.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 20);

  // Monthly acquisition
  const keys = last12MonthKeys();
  const monthly: Record<string, number> = {};
  for (const k of keys) monthly[k] = 0;
  for (const u of recentSignups) {
    const k = monthKey(u.createdAt);
    if (monthly[k] !== undefined) monthly[k] += 1;
  }

  return {
    totalCustomers,
    newThisMonth,
    topBySpend,
    monthlyAcquisition: keys.map((month) => ({ month, count: monthly[month] })),
  };
}

// ── Admin User List (for settings/users) ──────────────────────

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  if (!isDbConfigured) return [];

  const users = await db.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
  }));
}

// suppress unused import — startOfDay / endOfDay exported for reuse
export { startOfDay, endOfDay };
