// Meilisearch removed for portfolio mode.
// meili and meiliAdmin are always null; search falls back to the DB ilike query.

export const PRODUCTS_INDEX = "products";

export const meili = null;
export const meiliAdmin = null;

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

export async function indexProducts(_docs: MeiliProductDoc[]) {
  // no-op
}

export async function deleteProductFromIndex(_productId: string) {
  // no-op
}
