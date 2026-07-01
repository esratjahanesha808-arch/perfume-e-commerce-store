import { db, isDbConfigured } from "@/lib/prisma";
import type { AdminProductListQuery, AdminProductUpdateInput } from "@/lib/validations/product";

const PRODUCTS_PER_PAGE = 20;

export async function getAdminProducts(params: AdminProductListQuery) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const safePage = Math.max(1, params.page);
  const skip = (safePage - 1) * PRODUCTS_PER_PAGE;

  const where = {
    ...(params.status === "active"
      ? { isActive: true }
      : params.status === "inactive"
        ? { isActive: false }
        : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { sku: { contains: params.search, mode: "insensitive" as const } },
            { slug: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PRODUCTS_PER_PAGE,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        volume: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        brand: { select: { name: true } },
        category: { select: { name: true } },
        images: {
          orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }],
          select: { url: true },
          take: 1,
        },
        inventory: { select: { quantity: true, reserved: true } },
      },
    }),
    db.product.count({ where }),
  ]);

  return {
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: Number(product.price),
      volume: product.volume,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      brandName: product.brand?.name ?? "—",
      categoryName: product.category?.name ?? "—",
      imageUrl: product.images[0]?.url ?? null,
      stock: product.inventory?.quantity ?? 0,
      available: (product.inventory?.quantity ?? 0) - (product.inventory?.reserved ?? 0),
      createdAt: product.createdAt.toISOString(),
    })),
    total,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)),
    perPage: PRODUCTS_PER_PAGE,
  };
}

export async function updateAdminProduct(productId: string, input: AdminProductUpdateInput) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const product = await db.product.update({
    where: { id: productId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
      ...(input.volume !== undefined ? { volume: input.volume } : {}),
    },
    select: { id: true, name: true, isActive: true, isFeatured: true, price: true },
  });

  return {
    ...product,
    price: Number(product.price),
  };
}
