import type { ProductDetail, ProductReview } from "@/types/product";

const DUMMY_AUTHORS = [
  "Alexandra M.",
  "James R.",
  "Sophie L.",
  "Marcus T.",
  "Elena V.",
];

const DUMMY_TITLES = [
  "Absolutely exquisite",
  "My signature scent",
  "Worth every penny",
  "Luxurious and long-lasting",
  "Received so many compliments",
];

const DUMMY_COMMENTS = [
  "The projection is refined yet noticeable — exactly what I expect from a luxury parfum. It lasts all day on my skin.",
  "Beautifully balanced from the first spray to the dry down. The packaging and presentation feel truly premium.",
  "I was hesitant at this price point, but the quality is undeniable. Rich, elegant, and unmistakably luxurious.",
  "Fast shipping, authentic product, and a fragrance that turns heads. This has become my daily go-to.",
  "The scent develops beautifully over hours. Warm, sophisticated, and perfect for evening wear.",
];

/** Fallback reviews when a product has no approved DB rows yet */
export function getDummyReviews(product: ProductDetail, count = 3): ProductReview[] {
  const seed = product.slug.length + product.name.length;
  return Array.from({ length: count }, (_, i) => {
    const idx = (seed + i) % DUMMY_AUTHORS.length;
    const rating = i === 0 ? 5 : i === 1 ? 5 : 4;
    const daysAgo = (i + 1) * 12;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    return {
      id: `dummy-${product.id}-${i}`,
      rating,
      title: DUMMY_TITLES[idx],
      comment: DUMMY_COMMENTS[idx],
      isVerified: true,
      helpfulCount: 8 + i * 3,
      createdAt,
      user: { name: DUMMY_AUTHORS[idx], avatarUrl: null },
    };
  });
}

/** DB reviews first; dummy fallback for display when none exist */
export function resolveProductReviews(product: ProductDetail): ProductReview[] {
  if (product.reviews.length > 0) return product.reviews;
  return getDummyReviews(product);
}

export function formatReviewDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function getReviewSummary(product: ProductDetail, reviews: ProductReview[]) {
  const count = product.reviewCount > 0 ? product.reviewCount : reviews.length;
  const rating =
    product.avgRating > 0
      ? product.avgRating
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const starCount = reviews.filter((r) => r.rating === star).length;
    return { star, percent: reviews.length ? Math.round((starCount / reviews.length) * 100) : 0 };
  });

  return { rating, count, distribution };
}
