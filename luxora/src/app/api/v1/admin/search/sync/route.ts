import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { meiliAdmin, PRODUCTS_INDEX, indexProducts } from "@/lib/meilisearch";
import { db, isDbConfigured } from "@/lib/prisma";

// POST /api/v1/admin/search/sync
// Pushes all active products into the Meilisearch index.
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  if (!meiliAdmin) {
    return NextResponse.json(
      {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Meilisearch is not configured. Set MEILISEARCH_HOST and MEILISEARCH_ADMIN_KEY.",
        },
      },
      { status: 503 }
    );
  }

  if (!isDbConfigured) {
    return NextResponse.json(
      { error: { code: "DB_NOT_CONFIGURED", message: "Database not configured." } },
      { status: 503 }
    );
  }

  try {
    // Ensure the index has the correct filterable attributes
    const index = meiliAdmin.index(PRODUCTS_INDEX);
    await index.updateFilterableAttributes(["isActive", "brandName", "categoryName", "price"]);
    await index.updateSortableAttributes(["price", "avgRating"]);

    // Fetch all products in batches
    const BATCH = 100;
    let skip = 0;
    let synced = 0;

    while (true) {
      const products = await db.product.findMany({
        skip,
        take: BATCH,
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          avgRating: true,
          volume: true,
          isActive: true,
          brand: { select: { name: true } },
          category: { select: { name: true } },
          images: {
            where: { isPrimary: true },
            select: { url: true },
            take: 1,
          },
        },
      });

      if (products.length === 0) break;

      const docs = products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        avgRating: Number(p.avgRating),
        volume: p.volume,
        isActive: p.isActive,
        brandName: p.brand?.name ?? "",
        categoryName: p.category?.name ?? "",
        imageUrl: p.images[0]?.url ?? null,
      }));

      await indexProducts(docs);
      synced += products.length;
      skip += BATCH;

      if (products.length < BATCH) break;
    }

    return NextResponse.json({ data: { synced } });
  } catch (err) {
    console.error("[POST /api/v1/admin/search/sync]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Sync failed." } },
      { status: 500 }
    );
  }
}
