import { db, isDbConfigured } from "@/lib/prisma";

const PER_PAGE = 20;

export type AdminBrandRow = {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  logoUrl: string | null;
  isActive: boolean;
  productCount: number;
};

export async function getAdminBrands(params: { page?: number; search?: string }) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const safePage = Math.max(1, params.page ?? 1);
  const skip = (safePage - 1) * PER_PAGE;

  const where = params.search
    ? {
        OR: [
          { name: { contains: params.search, mode: "insensitive" as const } },
          { slug: { contains: params.search, mode: "insensitive" as const } },
          { country: { contains: params.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [brands, total] = await Promise.all([
    db.brand.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take: PER_PAGE,
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        logoUrl: true,
        isActive: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    }),
    db.brand.count({ where }),
  ]);

  return {
    brands: brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      country: b.country,
      logoUrl: b.logoUrl,
      isActive: b.isActive,
      productCount: b._count.products,
    })) satisfies AdminBrandRow[],
    total,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(total / PER_PAGE)),
  };
}
