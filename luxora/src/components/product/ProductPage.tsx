"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { ProductDetail, ProductTab } from "@/types/product";
import { useCart } from "@/components/cart/CartProvider";
import {
  getDisplayName,
  getDisplayBrand,
  getDisplayPrice,
  getDisplayRating,
  getDisplayReviewCount,
  getShortDescription,
  getLongDescription,
  getGalleryImages,
  getSizeOptions,
  getScentNotes,
  getIngredients,
  isInStock,
} from "@/lib/product-display";
import { Breadcrumb } from "./Breadcrumb";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";
import { TrustFeatures } from "./TrustFeatures";
import { ProductTabs } from "./ProductTabs";
import { ProductReviews } from "./ProductReviews";
import { PdpSection } from "./PdpSection";
import { ProductCard } from "@/components/shared/ProductCard";
import { SiteContainer } from "@/components/shared/SiteContainer";
import { toProductCard } from "@/lib/serialize-product";

interface ProductPageProps {
  product: ProductDetail;
  relatedProducts: ProductDetail[];
  reviewEligibility: {
    isLoggedIn: boolean;
    canReview: boolean;
    hasReview: boolean;
    isApproved: boolean;
  };
}

const SHIPPING_TEXT =
  "Complimentary standard shipping on all orders over $99. Standard delivery takes 3–5 business days. Express shipping is available at checkout. Returns are accepted within 14 days of purchase.";

export function ProductPage({ product, relatedProducts, reviewEligibility }: ProductPageProps) {
  const sizeOptions = useMemo(() => getSizeOptions(product), [product]);
  const sizes = sizeOptions.map((s) => s.label);
  const defaultSize = sizes.includes("100ml") ? "100ml" : sizes[0];

  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<ProductTab>("description");

  const displayName = getDisplayName(product);
  const displayBrand = getDisplayBrand(product);
  const currentPrice = getDisplayPrice(product, selectedSize);
  const inStock = isInStock(product);
  const galleryImages = getGalleryImages(product);
  const scentNotes = getScentNotes(product);

  const relatedCards = useMemo(
    () => relatedProducts.filter((p) => p.id !== product.id).map(toProductCard),
    [relatedProducts, product.id]
  );

  const { addItem } = useCart();

  const handleAddToCart = () => {
    void addItem(
      {
        id: product.id,
        name: displayName,
        slug: product.slug,
        shortDesc: product.shortDesc ?? null,
        price: currentPrice,
        comparePrice: product.comparePrice ?? null,
        volume:
          parseInt(selectedSize, 10) ||
          (typeof product.volume === "number" ? product.volume : null),
        avgRating: getDisplayRating(product),
        reviewCount: getDisplayReviewCount(product),
        brand: { name: displayBrand },
        images: galleryImages.map((img) => ({
          url: img.url,
          altText: img.altText ?? displayName,
        })),
      },
      quantity
    );
  };

  return (
    <div className="pdp-page w-full min-w-0 overflow-x-clip bg-[#090909] text-[#F5F5F5]">
      <SiteContainer className="pb-[var(--sp-24)]">
        {/* Breadcrumb — above upper hero line */}
        <div className="pdp-breadcrumb-band">
          <Breadcrumb
            brand={product.brand?.name ?? displayBrand}
            brandSlug={product.brand?.slug}
            productName={displayName}
          />
        </div>

        {/* Hero — gallery + info between upper & lower gold lines */}
        <div className="pdp-hero-band">
          <div className="pdp-hero-grid w-full grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-14 2xl:gap-16 items-start">
            <div className="xl:col-span-7 w-full min-w-0">
              <ProductGallery
                images={galleryImages}
                productName={displayName}
                slug={product.slug}
              />
            </div>
            <div className="xl:col-span-5 w-full min-w-0 xl:pt-2">
              <ProductInfo
                productId={product.id}
                brand={displayBrand}
                name={displayName}
                rating={getDisplayRating(product)}
                reviewCount={getDisplayReviewCount(product)}
                price={currentPrice}
                inStock={inStock}
                description={getShortDescription(product)}
                sizes={sizes}
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>
        </div>

        {/* Trust badges — starts after lower hero line */}
        <PdpSection>
          <TrustFeatures />
        </PdpSection>

        {/* Detail tabs */}
        <PdpSection>
          <ProductTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            description={getLongDescription(product)}
            scentNotes={scentNotes}
            ingredients={getIngredients(product)}
            shippingText={SHIPPING_TEXT}
          />
        </PdpSection>

        {/* Reviews — gold line below when section ends */}
        <PdpSection borderedTop borderedBottom>
          <ProductReviews product={product} reviewEligibility={reviewEligibility} />
        </PdpSection>

        {/* Related — restored bottom spacing */}
        {relatedCards.length > 0 && (
          <div className="pdp-related-band">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              aria-labelledby="related-heading"
            >
              <h2
                id="related-heading"
                className="font-serif text-xl md:text-2xl tracking-[0.15em] text-[#F3EFE6] uppercase text-center pdp-headline-gap"
              >
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8 items-stretch">
                {relatedCards.slice(0, 4).map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </motion.section>
          </div>
        )}
      </SiteContainer>
    </div>
  );
}
