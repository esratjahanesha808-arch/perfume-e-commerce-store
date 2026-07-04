import { getAllProducts } from "@/services/product.service";
import { getActiveBrands } from "@/services/brand.service";
import {
  toShopProduct,
  getUniqueConcentrations,
} from "@/lib/serialize-product";
import { ShopPageClient } from "@/components/shop/ShopPageClient";

export const dynamic = "force-dynamic";

function resolveBrandFilter(
  brandParam: string,
  brands: Awaited<ReturnType<typeof getActiveBrands>>,
): string | undefined {
  const decoded = decodeURIComponent(brandParam).trim();
  if (!decoded) return undefined;

  const bySlug = brands.find((b) => b.slug.toLowerCase() === decoded.toLowerCase());
  if (bySlug) return bySlug.name.toUpperCase();

  const byName = brands.find((b) => b.name.toUpperCase() === decoded.toUpperCase());
  if (byName) return byName.name.toUpperCase();

  return decoded.toUpperCase();
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const brandParam = typeof params.brand === "string" ? params.brand : undefined;
  const qParam = typeof params.q === "string" ? params.q : undefined;

  const [dbProducts, brands] = await Promise.all([
    getAllProducts(),
    getActiveBrands(),
  ]);

  const products = dbProducts.map(toShopProduct);
  const brandsList = brands.map((b) => b.name);
  const concentrationsList = getUniqueConcentrations(products);
  const maxPrice = Math.max(500, ...products.map((p) => p.price), 0);
  const initialBrand = brandParam ? resolveBrandFilter(brandParam, brands) : undefined;

  return (
    <ShopPageClient
      key={(initialBrand ?? "all") + "-" + (qParam ?? "")}
      products={products}
      brandsList={brandsList}
      concentrationsList={concentrationsList}
      maxPrice={maxPrice}
      initialBrand={initialBrand}
      initialSearchQuery={qParam}
    />
  );
}
