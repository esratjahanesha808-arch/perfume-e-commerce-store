import { db, isDbConfigured } from "@/lib/prisma";

const PER_PAGE = 20;

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  parentName: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
};

export async function getAdminCategories(params: { page?: number; search?: string }) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const safePage = Math.max(1, params.page ?? 1);
  const skip = (safePage - 1) * PER_PAGE;

  const where = params.search
    ? {
        OR: [
          { name: { contains: params.search, mode: "insensitive" as const } },
          { slug: { contains: params.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [categories, total] = await Promise.all([
    db.category.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      skip,
      take: PER_PAGE,
      select: {
        id: true,
        name: true,
        slug: true,
        sortOrder: true,
        isActive: true,
        parent: { select: { name: true } },
        _count: { select: { products: { where: { isActive: true } } } },
      },
    }),
    db.category.count({ where }),
  ]);

  return {
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentName: c.parent?.name ?? null,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      productCount: c._count.products,
    })) satisfies AdminCategoryRow[],
    total,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
  };
}
