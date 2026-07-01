import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getFeaturedProducts } from "@/services/product.service";
import {
  getUserReviewForProduct,
  userHasPurchasedProduct,
} from "@/services/review.service";
import { auth } from "@/lib/auth";
import { ProductPage } from "@/components/product/ProductPage";
import { serializeProductDetail, type DbProductDetailInput } from "@/lib/serialize-product";
import {
  getDisplayName,
  getDisplayBrand,
  getDisplayPrice,
  getDisplayRating,
  getDisplayReviewCount,
  getShortDescription,
} from "@/lib/product-display";

interface ProductRouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found — Luxora",
      description: "The requested fragrance could not be found.",
    };
  }

  const detail = serializeProductDetail(product as DbProductDetailInput);
  const name = getDisplayName(detail);
  const brand = getDisplayBrand(detail);

  return {
    title: `${name} — ${brand}`,
    description: getShortDescription(detail) || `Discover ${name} at Luxora.`,
    openGraph: {
      title: `${name} — ${brand}`,
      description: getShortDescription(detail) || `Discover ${name} at Luxora.`,
      images: detail.images?.[0]?.url ? [{ url: detail.images[0].url }] : [],
    },
  };
}

export default async function ProductRoutePage({ params }: ProductRouteProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getFeaturedProducts(5);
  const detail = serializeProductDetail(product as DbProductDetailInput);
  const related = relatedProducts.map((p) => serializeProductDetail(p as DbProductDetailInput));

  const session = await auth();
  let reviewEligibility = {
    isLoggedIn: false,
    canReview: false,
    hasReview: false,
    isApproved: false,
  };

  if (session?.user?.id) {
    const existingReview = await getUserReviewForProduct(session.user.id, product.id);
    const purchased = await userHasPurchasedProduct(session.user.id, product.id);
    reviewEligibility = {
      isLoggedIn: true,
      canReview: purchased && !existingReview,
      hasReview: Boolean(existingReview),
      isApproved: existingReview?.isApproved ?? false,
    };
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: getDisplayName(detail),
    image: detail.images?.[0]?.url || "",
    description: getShortDescription(detail),
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: getDisplayBrand(detail),
    },
    offers: {
      "@type": "Offer",
      url: `https://luxora.com/products/${product.slug}`,
      priceCurrency: "USD",
      price: getDisplayPrice(detail),
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: getDisplayRating(detail),
      reviewCount: getDisplayReviewCount(detail),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPage
        product={detail}
        relatedProducts={related}
        reviewEligibility={reviewEligibility}
      />
    </>
  );
}
