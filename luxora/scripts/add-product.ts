/**
 * Add a single product to the database (does NOT wipe existing data).
 *
 * Usage:
 *   1. Edit the PRODUCT config below
 *   2. Run: npm run add-product
 *
 * Existing brands (from seed): chanel, dior, tom-ford, creed, maison-francis-kurkdjian
 * Existing categories: mens-fragrances, womens-fragrances, unisex-fragrances
 */

import "dotenv/config";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString?.startsWith("postgres")) {
  console.error("❌ DATABASE_URL is missing or invalid in .env.local");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

// ── Edit this block for each new product ───────────────────────
const PRODUCT = {
  name: "Yves Saint Laurent Libre Eau de Parfum",
  slug: "ysl-libre-edp",
  sku: "YSL-LIBRE-EDP-90",
  description:
    "A bold floral lavender fragrance for the modern woman. Libre combines French lavender with orange blossom and vanilla for a sensual, confident scent.",
  shortDesc: "Bold floral lavender for the modern woman",
  price: 142.0,
  comparePrice: 165.0,
  costPrice: 78.0,
  volume: "90ml",
  brandSlug: "dior", // use existing brand slug, or set brandCreate below
  categorySlug: "womens-fragrances",
  scentNotes: {
    top: ["Lavender", "Mandarin", "Blackcurrant"],
    middle: ["Orange Blossom", "Jasmine"],
    base: ["Vanilla", "Ambergris", "Cedar"],
  },
  attributes: {
    gender: "Women",
    season: ["Spring", "Summer"],
    intensity: "Moderate",
    longevity: "8-10 hours",
    sillage: "Moderate",
  },
  isActive: true,
  isFeatured: false,
  // Stock
  quantity: 40,
  lowStockThreshold: 8,
  reorderPoint: 15,
  imagePublicId: "luxora/ysl-libre-1",
  imageAlt: "Yves Saint Laurent Libre Eau de Parfum",
};

// Optional: create a new brand instead of using brandSlug
const brandCreate = null as {
  name: string;
  slug: string;
  description?: string;
  country?: string;
} | null;

// Optional: create a new category instead of using categorySlug
const categoryCreate = null as {
  name: string;
  slug: string;
  description?: string;
} | null;
// ──────────────────────────────────────────────────────────────

async function main() {
  console.log(`Adding product: ${PRODUCT.name}`);

  let brandId: string | null = null;
  if (brandCreate) {
    const brand = await prisma.brand.upsert({
      where: { slug: brandCreate.slug },
      update: {},
      create: { ...brandCreate, isActive: true },
    });
    brandId = brand.id;
    console.log(`  Brand: ${brand.name} (${brand.slug})`);
  } else if (PRODUCT.brandSlug) {
    const brand = await prisma.brand.findUnique({
      where: { slug: PRODUCT.brandSlug },
    });
    if (!brand) {
      throw new Error(
        `Brand "${PRODUCT.brandSlug}" not found. Check slug or set brandCreate.`
      );
    }
    brandId = brand.id;
    console.log(`  Brand: ${brand.name}`);
  }

  let categoryId: string | null = null;
  if (categoryCreate) {
    const category = await prisma.category.upsert({
      where: { slug: categoryCreate.slug },
      update: {},
      create: { ...categoryCreate, isActive: true },
    });
    categoryId = category.id;
    console.log(`  Category: ${category.name} (${category.slug})`);
  } else if (PRODUCT.categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: PRODUCT.categorySlug },
    });
    if (!category) {
      throw new Error(
        `Category "${PRODUCT.categorySlug}" not found. Check slug or set categoryCreate.`
      );
    }
    categoryId = category.id;
    console.log(`  Category: ${category.name}`);
  }

  const existing = await prisma.product.findFirst({
    where: { OR: [{ slug: PRODUCT.slug }, { sku: PRODUCT.sku }] },
  });
  if (existing) {
    throw new Error(
      `Product already exists with slug "${PRODUCT.slug}" or sku "${PRODUCT.sku}"`
    );
  }

  const product = await prisma.product.create({
    data: {
      name: PRODUCT.name,
      slug: PRODUCT.slug,
      description: PRODUCT.description,
      shortDesc: PRODUCT.shortDesc,
      price: PRODUCT.price,
      comparePrice: PRODUCT.comparePrice,
      costPrice: PRODUCT.costPrice,
      sku: PRODUCT.sku,
      volume: PRODUCT.volume,
      brandId,
      categoryId,
      scentNotes: PRODUCT.scentNotes,
      attributes: PRODUCT.attributes,
      isActive: PRODUCT.isActive,
      isFeatured: PRODUCT.isFeatured,
    },
  });

  await prisma.inventory.create({
    data: {
      productId: product.id,
      quantity: PRODUCT.quantity,
      reserved: 0,
      lowStockThreshold: PRODUCT.lowStockThreshold,
      reorderPoint: PRODUCT.reorderPoint,
      lastRestocked: new Date(),
    },
  });

  await prisma.productImage.create({
    data: {
      productId: product.id,
      url: `/products/${PRODUCT.slug}.svg`,
      publicId: PRODUCT.imagePublicId,
      altText: PRODUCT.imageAlt,
      sortOrder: 1,
      isPrimary: true,
    },
  });

  console.log("\n✅ Product added successfully!");
  console.log(`   ID:   ${product.id}`);
  console.log(`   Slug: ${product.slug}`);
  console.log(`   SKU:  ${product.sku}`);
  console.log(`   URL:  /products/${product.slug}`);

  try {
    const { invalidateProductCaches } = await import("../src/services/product.service");
    await invalidateProductCaches();
    console.log("   Cache cleared — product visible on site immediately.");
  } catch {
    console.log("   Note: restart dev server if product does not appear right away.");
  }

  // Generate unique SVG image for this product
  try {
    const { execSync } = await import("child_process");
    execSync("npm run db:setup-images", { stdio: "inherit", cwd: process.cwd() });
  } catch {
    console.log("   Run npm run db:setup-images to generate product image.");
  }
}

main()
  .catch((err) => {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
