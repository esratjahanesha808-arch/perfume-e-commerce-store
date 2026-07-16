import { MeiliSearch } from "meilisearch";

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST ?? "";
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY ?? "";
const MEILISEARCH_ADMIN_KEY = process.env.MEILISEARCH_ADMIN_KEY ?? MEILISEARCH_API_KEY;

export const PRODUCTS_INDEX = "products";

function createClient(apiKey: string) {
  if (!MEILISEARCH_HOST) return null;
  return new MeiliSearch({ host: MEILISEARCH_HOST, apiKey });
}

/** Read-only search client (uses the public search API key). */
export const meili = createClient(MEILISEARCH_API_KEY);

/** Admin client for indexing operations (uses the master/admin key). */
export const meiliAdmin = createClient(MEILISEARCH_ADMIN_KEY);

export type MeiliProductDoc = {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  categoryName: string;
  price: number;
  volume: string | null;
  isActive: boolean;
  imageUrl: string | null;
  avgRating: number;
};

/**
 * Index or update a batch of product documents in Meilisearch.
 * Safe no-op when MEILISEARCH_HOST is not configured.
 */
export async function indexProducts(docs: MeiliProductDoc[]) {
  if (!meiliAdmin || docs.length === 0) return;
  try {
    const index = meiliAdmin.index(PRODUCTS_INDEX);
    await index.addDocuments(docs, { primaryKey: "id" });
  } catch (err) {
    console.error("[meilisearch] indexProducts failed:", err);
  }
}

/**
 * Remove a product from the index.
 * Safe no-op when MEILISEARCH_HOST is not configured.
 */
export async function deleteProductFromIndex(productId: string) {
  if (!meiliAdmin) return;
  try {
    await meiliAdmin.index(PRODUCTS_INDEX).deleteDocument(productId);
  } catch (err) {
    console.error("[meilisearch] deleteProductFromIndex failed:", err);
  }
}
