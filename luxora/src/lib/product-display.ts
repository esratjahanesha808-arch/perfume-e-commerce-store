import type { ProductDetail, ProductImage, SizeOption } from "@/types/product";

import { resolveProductImageUrl } from "@/lib/product-images";
import { getDefaultProductImage, getMappedProductImage } from "@/lib/product-image-map";

const AVENTUS_MAIN_IMAGE =
  "https://cdn11.bigcommerce.com/s-ph0qpmxksl/images/stencil/1280x1280/products/4817/16725/Untitled_design_-_2025-12-30T180917.751__67780.1767082275.png?c=1";

const AVENTUS_GALLERY: ProductImage[] = [
  {
    id: "av-1",
    url: AVENTUS_MAIN_IMAGE,
    altText: "Creed Aventus Eau de Parfum 100ml",
  },
  {
    id: "av-2",
    url: AVENTUS_MAIN_IMAGE,
    altText: "Creed Aventus Detail View",
  },
  {
    id: "av-3",
    url: AVENTUS_MAIN_IMAGE,
    altText: "Creed Aventus Lifestyle View",
  },
];

export function isAventusProduct(slug: string) {
  return slug === "creed-aventus";
}

export function getDisplayName(product: ProductDetail) {
  return isAventusProduct(product.slug) ? "Aventus" : product.name;
}

export function getDisplayBrand(product: ProductDetail) {
  return isAventusProduct(product.slug)
    ? "CREED"
    : (product.brand?.name || "LUXORA").toUpperCase();
}

export function getDisplayPrice(product: ProductDetail, size?: string) {
  if (isAventusProduct(product.slug)) {
    if (size === "50ml") return 225;
    if (size === "250ml") return 650;
    return 325;
  }
  return product.price;
}

export function getDisplayRating(product: ProductDetail) {
  return isAventusProduct(product.slug) ? 5 : product.avgRating;
}

export function getDisplayReviewCount(product: ProductDetail) {
  return isAventusProduct(product.slug) ? 112 : product.reviewCount;
}

export function getShortDescription(product: ProductDetail) {
  if (isAventusProduct(product.slug)) {
    return "A bold and sophisticated fragrance for the modern man. Fresh, fruity and woody notes create an unforgettable scent.";
  }
  return product.shortDesc || product.description || "";
}

export function getLongDescription(product: ProductDetail) {
  if (isAventusProduct(product.slug)) {
    return "Aventus is a legendary fragrance that evades power, success and sophistication. It opens with fresh pineapple and bergamot, followed by a smoky birch and jasmine heart, and settles into a rich base of musk, oakmoss and ambergris.";
  }
  return product.description || "No description available.";
}

export function getGalleryImages(product: ProductDetail): ProductImage[] {
  if (isAventusProduct(product.slug)) return AVENTUS_GALLERY;
  if (product.images.length > 0) {
    return product.images.map((img) => ({
      ...img,
      url: resolveProductImageUrl(img.url, product.name, product.slug),
    }));
  }
  return [
    {
      id: "placeholder",
      url: getMappedProductImage(product.slug) ?? getDefaultProductImage(product.name, product.slug),
      altText: product.name,
    },
  ];
}

export function getSizeOptions(product: ProductDetail): SizeOption[] {
  if (isAventusProduct(product.slug)) {
    return [
      { label: "50ml", price: 225 },
      { label: "100ml", price: 325 },
      { label: "250ml", price: 650 },
    ];
  }
  const volume = product.volume || "100ml";
  return [{ label: volume, price: product.price }];
}

export function getScentNotes(product: ProductDetail) {
  if (isAventusProduct(product.slug)) {
    return {
      top: ["Pineapple", "Bergamot", "Blackcurrant", "Apple"],
      middle: ["Birch", "Patchouli", "Moroccan Jasmine", "Rose"],
      base: ["Oakmoss", "Musk", "Ambergris", "Vanilla"],
    };
  }
  return product.scentNotes;
}

export function getIngredients(product: ProductDetail) {
  if (isAventusProduct(product.slug)) {
    return "Alcohol, Parfum (Fragrance), Aqua (Water), Limonene, Linalool, BHT, Citral, Citronellol, Coumarin, Geraniol.";
  }
  return "Alcohol Denat., Fragrance (Parfum), Water\\Aqua\\Eau, Linalool, Coumarin, Limonene, Citronellol, Geraniol, Benzyl Benzoate, Citral, Cinnamal.";
}

export function isInStock(product: ProductDetail) {
  if (!product.inventory) return true;
  const qty = product.inventory.quantity ?? 0;
  const reserved = product.inventory.reserved ?? 0;
  return qty - reserved > 0;
}
