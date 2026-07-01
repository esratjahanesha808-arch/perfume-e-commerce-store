import type { ProductDetail, ScentNotes } from "@/types/product";
import { resolveProductImageUrl } from "@/lib/product-images";

const CONCENTRATION_TYPES = [
  "Parfum",
  "Eau de Parfum",
  "Eau de Toilette",
  "Eau de Cologne",
] as const;

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  price: unknown;
  comparePrice: unknown;
  volume: string | null;
  avgRating: unknown;
  reviewCount: number;
  isFeatured?: boolean;
  createdAt?: Date | string;
  brand: { name: string; slug: string } | null;
  category?: { name: string; slug: string } | null;
  images: { url: string; altText: string | null }[];
};

export type ShopProduct = ReturnType<typeof toShopProduct>;

function isRecentProduct(createdAt?: Date | string): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return created.getTime() >= thirtyDaysAgo;
}

export function getConcentration(name: string): string {
  const lower = name.toLowerCase();
  for (const type of CONCENTRATION_TYPES) {
    if (lower.includes(type.toLowerCase())) return type;
  }
  return "Eau de Parfum";
}

function getProductBadge(product: DbProduct): "BEST SELLER" | "NEW" | undefined {
  if (product.isFeatured) return "BEST SELLER";
  if (isRecentProduct(product.createdAt)) return "NEW";
  return undefined;
}

function mapImages(product: DbProduct) {
  const raw = product.images?.[0];
  const url = resolveProductImageUrl(raw?.url, product.name, product.slug);
  return [{ url, altText: raw?.altText ?? product.name }];
}

/** Normalize Prisma product for ProductCard */
export function toProductCard(product: DbProduct) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDesc: product.shortDesc,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    volume: product.volume ? parseInt(product.volume, 10) || null : null,
    avgRating: Number(product.avgRating),
    reviewCount: product.reviewCount,
    brand: product.brand ? { name: product.brand.name.toUpperCase() } : { name: "LUXORA" },
    images: mapImages(product),
    badge: getProductBadge(product),
  };
}

/** Map DB category slug to shop filter label */
export function getShopCategory(categorySlug?: string | null): string {
  if (categorySlug === "mens-fragrances") return "Men";
  if (categorySlug === "womens-fragrances") return "Women";
  if (categorySlug === "unisex-fragrances") return "Unisex";
  return "Unisex";
}

/** Normalize Prisma product for shop page filters */
export function toShopProduct(product: DbProduct) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand?.name?.toUpperCase() || "LUXORA",
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    rating: Number(product.avgRating),
    reviews: product.reviewCount,
    image: resolveProductImageUrl(product.images[0]?.url, product.name, product.slug),
    category: getShopCategory(product.category?.slug),
    concentration: getConcentration(product.name),
    description: product.shortDesc || "",
    badge: getProductBadge(product),
  };
}

export function getUniqueConcentrations(products: ShopProduct[]): string[] {
  const fromProducts = [...new Set(products.map((p) => p.concentration))];
  return [...new Set([...CONCENTRATION_TYPES, ...fromProducts])];
}

export function serializeProducts<T extends DbProduct>(products: T[]) {
  return products.map(toProductCard);
}

export type DbProductDetailInput = Omit<DbProduct, "images"> & {
  description?: string | null;
  costPrice?: unknown;
  images: {
    id?: string;
    url: string;
    altText: string | null;
    isPrimary?: boolean;
  }[];
  inventory?: { quantity: number; reserved: number } | null;
  scentNotes?: unknown;
  attributes?: unknown;
  reviews?: {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    isVerified: boolean;
    helpfulCount: number;
    createdAt: Date | string;
    user: { name: string | null; avatarUrl: string | null };
  }[];
};

function parseScentNotes(value: unknown): ScentNotes | null {
  if (!value || typeof value !== "object") return null;
  const notes = value as Record<string, unknown>;
  if (!Array.isArray(notes.top) || !Array.isArray(notes.middle) || !Array.isArray(notes.base)) {
    return null;
  }
  return {
    top: notes.top as string[],
    middle: notes.middle as string[],
    base: notes.base as string[],
  };
}

/** Normalize Prisma product for ProductPage / ProductDetail */
export function serializeProductDetail(product: DbProductDetailInput): ProductDetail {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDesc: product.shortDesc,
    description: product.description ?? null,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    volume: product.volume,
    avgRating: Number(product.avgRating),
    reviewCount: product.reviewCount,
    scentNotes: parseScentNotes(product.scentNotes),
    attributes: (product.attributes as ProductDetail["attributes"]) ?? null,
    brand: product.brand,
    category: product.category ?? null,
    images: (product.images ?? []).map((img, index) => ({
      id: img.id ?? `${product.id}-img-${index}`,
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
    })),
    inventory: product.inventory ?? null,
    reviews: (product.reviews ?? []).map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerified: review.isVerified,
      helpfulCount: review.helpfulCount,
      createdAt:
        typeof review.createdAt === "string"
          ? review.createdAt
          : review.createdAt.toISOString(),
      user: review.user,
    })),
  };
}
