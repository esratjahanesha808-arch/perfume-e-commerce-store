import { db, isDbConfigured } from "@/lib/prisma";

const PER_PAGE = 20;

export type AdminCustomerRow = {
  id: string;
  name: string | null;
  email: string;
  isActive: boolean;
  loyaltyPoints: number;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
};

export async function getAdminCustomers(params: { page?: number; search?: string }) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const safePage = Math.max(1, params.page ?? 1);
  const skip = (safePage - 1) * PER_PAGE;

  const where = {
    role: "CUSTOMER" as const,
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { email: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PER_PAGE,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        loyaltyPoints: true,
        createdAt: true,
        orders: {
          where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
          select: { total: true },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  return {
    customers: customers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      isActive: u.isActive,
      loyaltyPoints: u.loyaltyPoints,
      orderCount: u.orders.length,
      totalSpent: u.orders.reduce((sum, o) => sum + Number(o.total), 0),
      createdAt: u.createdAt.toISOString(),
    })) satisfies AdminCustomerRow[],
    total,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
  };
}
