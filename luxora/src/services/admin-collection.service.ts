import { db, isDbConfigured } from "@/lib/prisma";
import { invalidateCategoryCache } from "@/services/category.service";
import type {
  AdminCollectionListQuery,
  AdminCollectionUpdateInput,
} from "@/lib/validations/collection";

const COLLECTIONS_PER_PAGE = 20;

export async function getAdminCollections(params: AdminCollectionListQuery) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const safePage = Math.max(1, params.page);
  const skip = (safePage - 1) * COLLECTIONS_PER_PAGE;

  const where = params.search
    ? {
        OR: [
          { name: { contains: params.search, mode: "insensitive" as const } },
          { slug: { contains: params.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [collections, total] = await Promise.all([
    db.category.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      skip,
      take: COLLECTIONS_PER_PAGE,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        isActive: true,
        sortOrder: true,
        _count: { select: { products: true } },
      },
    }),
    db.category.count({ where }),
  ]);

  return {
    collections: collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      imageUrl: collection.imageUrl,
      isActive: collection.isActive,
      sortOrder: collection.sortOrder,
      productCount: collection._count.products,
    })),
    total,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(total / COLLECTIONS_PER_PAGE)),
    perPage: COLLECTIONS_PER_PAGE,
  };
}

export async function updateAdminCollection(
  collectionId: string,
  input: AdminCollectionUpdateInput
) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const collection = await db.category.update({
    where: { id: collectionId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      sortOrder: true,
    },
  });

  await invalidateCategoryCache();

  return collection;
}
