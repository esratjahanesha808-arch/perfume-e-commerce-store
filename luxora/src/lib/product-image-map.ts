/**
 * Slug-based product image paths — one PNG per product in /public/products/
 */
export const PRODUCT_IMAGE_BY_SLUG: Record<string, string> = {};

export function getProductImagePath(slug: string): string {
  return PRODUCT_IMAGE_BY_SLUG[slug] ?? `/products/${slug}.png`;
}

export function getMappedProductImage(slug: string): string {
  return getProductImagePath(slug);
}

export function getDefaultProductImage(_productName: string, slug?: string): string {
  if (slug) return getProductImagePath(slug);
  return "/images/hero-bottle.png";
}

export function isBrokenOrStockImage(url: string | undefined | null): boolean {
  if (!url || url.trim() === "") return true;
  return (
    url.includes("via.placeholder.com") ||
    url.includes("images.unsplash.com") ||
    url.endsWith(".svg")
  );
}
