import type { Metadata } from "next";
import { getActiveBrands } from "@/services/brand.service";
import { BrandsPageClient } from "@/components/brands/BrandsPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Brands — Luxora",
  description:
    "Explore the world's most prestigious fragrance houses and niche perfumers at Luxora.",
};

export default async function BrandsPage() {
  const brands = await getActiveBrands();

  const dbBrands = brands.map((b) => ({
    name: b.name,
    slug: b.slug,
    logoUrl: b.logoUrl,
  }));

  return <BrandsPageClient dbBrands={dbBrands} />;
}
