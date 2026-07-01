import {
  getDefaultProductImage,
  getMappedProductImage,
  isBrokenOrStockImage,
} from "@/lib/product-image-map";
export function resolveProductImageUrl(
  url: string | undefined | null,
  productName: string,
  slug?: string
): string {
  if (url && !isBrokenOrStockImage(url)) {
    return url;
  }

  if (slug) {
    return getMappedProductImage(slug);
  }

  return getDefaultProductImage(productName, slug);
}

/** @deprecated Use resolveProductImageUrl */
export function getPlaceholderImage(productName: string, slug?: string): string {
  return getDefaultProductImage(productName, slug);
}

/** Gallery src — preserve valid remote URLs, resolve local/placeholder paths */
export function getGalleryImageSrc(
  url: string,
  productName: string,
  slug?: string
): string {
  if (url.startsWith("http") && !isBrokenOrStockImage(url)) {
    return url;
  }
  return resolveProductImageUrl(url, productName, slug);
}
