/**
 * Sync the full product catalog from uploaded product images.
 * Run: npm run db:sync-catalog
 */

import { config } from "dotenv";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

config({ path: ".env.local" });

const ASSETS_DIR = join(
  process.cwd(),
  "..",
  "..",
  ".cursor",
  "projects",
  "c-Users-USER-OneDrive-Documents-e-commerce-store",
  "assets"
);

// Fallback: images saved in workspace assets folder
const WORKSPACE_ASSETS = join(
  "C:",
  "Users",
  "USER",
  ".cursor",
  "projects",
  "c-Users-USER-OneDrive-Documents-e-commerce-store",
  "assets"
);

const PREFIX =
  "c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_24b87b90564b302f70092948a4595d2b_images_";

type CatalogItem = {
  sourceFile: string;
  slug: string;
  name: string;
  sku: string;
  shortDesc: string;
  description: string;
  price: number;
  comparePrice: number | null;
  costPrice: number;
  volume: string;
  brandSlug: string;
  categorySlug: string;
  isFeatured: boolean;
  quantity: number;
  scentNotes: { top: string[]; middle: string[]; base: string[] };
  attributes: Record<string, string | string[]>;
};

const CATALOG: CatalogItem[] = [
  {
    sourceFile: `${PREFIX}ChatGPT_Image_Jun_18__2026__03_57_32_PM-959fdf0c-333e-4e90-8736-85fde994236e.png`,
    slug: "creed-green-irish-tweed-100ml",
    name: "Creed Green Irish Tweed Eau de Cologne",
    sku: "CREED-GIT-100",
    shortDesc: "Iconic fresh fougère masculine classic",
    description:
      "An iconic fresh fougère from Creed. Green Irish Tweed opens with lemon and verbena, layered with violet and iris over sandalwood and ambergris.",
    price: 435,
    comparePrice: 480,
    costPrice: 225,
    volume: "100ml",
    brandSlug: "creed",
    categorySlug: "mens-fragrances",
    isFeatured: true,
    quantity: 22,
    scentNotes: {
      top: ["Lemon", "Verbena", "Peppermint"],
      middle: ["Violet", "Iris"],
      base: ["Sandalwood", "Ambergris", "Cedar"],
    },
    attributes: { gender: "Men", season: ["Spring", "Summer"], intensity: "Moderate", longevity: "6-8 hours" },
  },
  {
    sourceFile: `${PREFIX}ChatGPT_Image_Jun_18__2026__03_57_39_PM-e862633d-dc68-445d-8487-e5ed4a5bb313.png`,
    slug: "creed-spice-and-wood-75ml",
    name: "Creed Spice and Wood",
    sku: "CREED-SPICE-WOOD-75",
    shortDesc: "Luxurious apple-wood niche parfum",
    description:
      "A luxurious woody fragrance from Creed. Spice and Wood balances apple and bergamot with clove, pimento, and cedar.",
    price: 620,
    comparePrice: 680,
    costPrice: 340,
    volume: "75ml",
    brandSlug: "creed",
    categorySlug: "mens-fragrances",
    isFeatured: false,
    quantity: 8,
    scentNotes: {
      top: ["Apple", "Bergamot", "Lemon"],
      middle: ["Clove", "Pimento", "Jasmine"],
      base: ["Cedar", "Oak", "Iris"],
    },
    attributes: { gender: "Men", season: ["Fall", "Winter"], intensity: "Strong", longevity: "8-10 hours" },
  },
  {
    sourceFile: `${PREFIX}ChatGPT_Image_Jun_18__2026__03_57_59_PM-60127bad-3990-40d7-ab8b-7b941617c15d.png`,
    slug: "dior-sauvage-parfum-100ml",
    name: "Dior Sauvage Parfum",
    sku: "DIOR-SAUVAGE-PARFUM-100",
    shortDesc: "Intense unisex Sauvage parfum",
    description:
      "The most concentrated expression of Sauvage — bergamot and Sichuan pepper with deep woody ambery notes.",
    price: 155,
    comparePrice: 178,
    costPrice: 82,
    volume: "100ml",
    brandSlug: "dior",
    categorySlug: "unisex-fragrances",
    isFeatured: true,
    quantity: 55,
    scentNotes: {
      top: ["Bergamot", "Mandarin"],
      middle: ["Sichuan Pepper", "Lavender"],
      base: ["Ambroxan", "Cedar", "Vanilla"],
    },
    attributes: { gender: "Unisex", season: ["All Seasons"], intensity: "Strong", longevity: "10-12 hours" },
  },
  {
    sourceFile: `${PREFIX}ChatGPT_Image_Jun_18__2026__03_59_53_PM-514a7c60-c8e2-40d9-817a-0dc354d951ca.png`,
    slug: "tom-ford-tobacco-vanille-edp-50ml",
    name: "Tom Ford Tobacco Vanille",
    sku: "TF-TOBACCO-VANILLE-50",
    shortDesc: "Opulent warm tobacco and vanilla",
    description:
      "An opulent oriental masterpiece weaving tobacco leaf, tonka bean, vanilla, and dried fruit accords.",
    price: 285,
    comparePrice: 320,
    costPrice: 155,
    volume: "50ml",
    brandSlug: "tom-ford",
    categorySlug: "mens-fragrances",
    isFeatured: true,
    quantity: 12,
    scentNotes: {
      top: ["Tobacco Leaf", "Spicy Notes"],
      middle: ["Tonka Bean", "Vanilla", "Cacao"],
      base: ["Dried Fruits", "Woody Notes"],
    },
    attributes: { gender: "Men", season: ["Fall", "Winter"], intensity: "Strong", longevity: "10-12 hours" },
  },
  {
    sourceFile: `${PREFIX}ChatGPT_Image_Jun_18__2026__04_00_02_PM-ecce2ef2-f75f-440f-b981-d12544b85225.png`,
    slug: "tom-ford-grey-vetiver-edp-50ml",
    name: "Tom Ford Grey Vetiver",
    sku: "TF-GREY-VETIVER-50",
    shortDesc: "Refined citrus-vetiver elegance",
    description:
      "A refined vetiver fragrance with citrus, iris, and vetiver finishing on oakmoss and amber.",
    price: 195,
    comparePrice: 225,
    costPrice: 105,
    volume: "50ml",
    brandSlug: "tom-ford",
    categorySlug: "mens-fragrances",
    isFeatured: false,
    quantity: 18,
    scentNotes: {
      top: ["Grapefruit", "Sage", "Nutmeg"],
      middle: ["Iris", "Vetiver"],
      base: ["Oakmoss", "Amber"],
    },
    attributes: { gender: "Men", season: ["Spring", "Fall"], intensity: "Moderate", longevity: "8-10 hours" },
  },
  {
    sourceFile: `${PREFIX}ChatGPT_Image_Jun_18__2026__05_28_07_PM-20bd1d79-e191-44af-9b3b-50cb6b27502b.png`,
    slug: "chanel-chance-edt-100ml",
    name: "Chanel Chance Eau de Toilette",
    sku: "CHANEL-CHANCE-EDT-100",
    shortDesc: "Sparkling unpredictable floral",
    description:
      "A whimsical fragrance combining pink pepper, pineapple, jasmine, and patchouli in Chanel's iconic round bottle.",
    price: 142,
    comparePrice: 165,
    costPrice: 78,
    volume: "100ml",
    brandSlug: "chanel",
    categorySlug: "womens-fragrances",
    isFeatured: true,
    quantity: 28,
    scentNotes: {
      top: ["Pink Pepper", "Pineapple", "Hyacinth"],
      middle: ["Jasmine", "Iris"],
      base: ["Patchouli", "Musk", "Vetiver"],
    },
    attributes: { gender: "Women", season: ["Spring", "Summer"], intensity: "Moderate", longevity: "6-8 hours" },
  },
  {
    sourceFile: `${PREFIX}ChatGPT_Image_Jun_18__2026__05_28_03_PM-975a6272-3688-4e95-899d-5026985f5fcb.png`,
    slug: "luxora-noir-absolu-50ml",
    name: "Luxora Noir Absolu",
    sku: "LUXORA-NOIR-ABSOLU-50",
    shortDesc: "Deep sophisticated extrait de parfum",
    description:
      "Luxora Noir Absolu — an intense extrait de parfum with dark woody amber depth and lasting sophistication.",
    price: 185,
    comparePrice: 210,
    costPrice: 95,
    volume: "50ml",
    brandSlug: "luxora",
    categorySlug: "unisex-fragrances",
    isFeatured: true,
    quantity: 30,
    scentNotes: {
      top: ["Bergamot", "Black Pepper"],
      middle: ["Iris", "Leather"],
      base: ["Oud", "Amber", "Musk"],
    },
    attributes: { gender: "Unisex", season: ["Fall", "Winter"], intensity: "Strong", longevity: "10-12 hours" },
  },
  {
    sourceFile: `${PREFIX}ChatGPT_Image_Jun_18__2026__05_27_58_PM-42156008-348a-4656-b289-d863f7324487.png`,
    slug: "luxora-eclat-noir",
    name: "Luxora Éclat Noir",
    sku: "LUXORA-ECLAT-NOIR",
    shortDesc: "Luminous dark extrait de parfum",
    description:
      "Luxora Éclat Noir — a bold extrait de parfum balancing radiant citrus with deep emerald woods.",
    price: 195,
    comparePrice: 220,
    costPrice: 100,
    volume: "100ml",
    brandSlug: "luxora",
    categorySlug: "unisex-fragrances",
    isFeatured: true,
    quantity: 25,
    scentNotes: {
      top: ["Mandarin", "Pink Pepper"],
      middle: ["Jasmine", "Green Notes"],
      base: ["Cedar", "Patchouli", "Musk"],
    },
    attributes: { gender: "Unisex", season: ["All Seasons"], intensity: "Moderate", longevity: "8-10 hours" },
  },
  {
    sourceFile: `${PREFIX}ChatGPT_Image_Jun_18__2026__05_27_54_PM-65220550-b97a-43ae-88aa-8aafd233a4ba.png`,
    slug: "luxora-oud-eternel-100ml",
    name: "Luxora Oud Éternel",
    sku: "LUXORA-OUD-ETERNEL-100",
    shortDesc: "Rich eternal oud parfum",
    description:
      "Luxora Oud Éternel — a luxurious 100ml parfum centered on rare oud, rose, and golden amber.",
    price: 245,
    comparePrice: 280,
    costPrice: 130,
    volume: "100ml",
    brandSlug: "luxora",
    categorySlug: "unisex-fragrances",
    isFeatured: true,
    quantity: 20,
    scentNotes: {
      top: ["Saffron", "Rose"],
      middle: ["Oud", "Amber"],
      base: ["Sandalwood", "Musk", "Vanilla"],
    },
    attributes: { gender: "Unisex", season: ["Fall", "Winter"], intensity: "Strong", longevity: "12+ hours" },
  },
  {
    sourceFile: `${PREFIX}ChatGPT_Image_Jun_18__2026__03_58_08_PM-1eec2c05-9042-49ab-8f9d-d7281e7d57ff.png`,
    slug: "miss-dior-rose-nroses-50ml",
    name: "Miss Dior Rose N'Roses",
    sku: "DIOR-MISS-ROSE-50",
    shortDesc: "Fresh floral rose for women",
    description:
      "A fresh floral fragrance celebrating the rose with bergamot, damask rose, and white musk.",
    price: 118,
    comparePrice: 138,
    costPrice: 62,
    volume: "50ml",
    brandSlug: "dior",
    categorySlug: "womens-fragrances",
    isFeatured: true,
    quantity: 42,
    scentNotes: {
      top: ["Rose", "Bergamot", "Mandarin"],
      middle: ["Damask Rose", "Peony"],
      base: ["White Musk", "Cedar"],
    },
    attributes: { gender: "Women", season: ["Spring", "Summer"], intensity: "Moderate", longevity: "6-8 hours" },
  },
  {
    sourceFile: `${PREFIX}ChatGPT_Image_Jun_18__2026__04_00_19_PM-a4bd7747-9823-44cc-a77b-494932fa6039.png`,
    slug: "coco-mademoiselle-edp-100ml",
    name: "Coco Mademoiselle Eau de Parfum",
    sku: "CHANEL-COCO-MAD-100",
    shortDesc: "Elegant orange-jasmine floral",
    description:
      "A modern Chanel classic blending fresh orange with jasmine, rose, patchouli, and vetiver.",
    price: 168,
    comparePrice: 195,
    costPrice: 92,
    volume: "100ml",
    brandSlug: "chanel",
    categorySlug: "womens-fragrances",
    isFeatured: true,
    quantity: 35,
    scentNotes: {
      top: ["Orange", "Mandarin", "Bergamot"],
      middle: ["Jasmine", "Rose"],
      base: ["Patchouli", "Vetiver", "White Musk"],
    },
    attributes: { gender: "Women", season: ["All Seasons"], intensity: "Moderate", longevity: "8-10 hours" },
  },
];

function resolveAssetsDir(): string {
  if (existsSync(WORKSPACE_ASSETS)) return WORKSPACE_ASSETS;
  if (existsSync(ASSETS_DIR)) return ASSETS_DIR;
  throw new Error("Could not find uploaded image assets folder");
}

const connectionString = process.env.DATABASE_URL!;
const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

async function ensureBrand(slug: string, name: string) {
  return prisma.brand.upsert({
    where: { slug },
    update: { isActive: true },
    create: { name, slug, isActive: true, description: `${name} luxury fragrances` },
  });
}

async function upsertProduct(item: CatalogItem, imageUrl: string) {
  const brand = await prisma.brand.findUnique({ where: { slug: item.brandSlug } });
  const category = await prisma.category.findUnique({ where: { slug: item.categorySlug } });
  if (!brand) throw new Error(`Brand missing: ${item.brandSlug}`);
  if (!category) throw new Error(`Category missing: ${item.categorySlug}`);

  const product = await prisma.product.upsert({
    where: { slug: item.slug },
    update: {
      name: item.name,
      description: item.description,
      shortDesc: item.shortDesc,
      price: item.price,
      comparePrice: item.comparePrice,
      costPrice: item.costPrice,
      volume: item.volume,
      brandId: brand.id,
      categoryId: category.id,
      scentNotes: item.scentNotes,
      attributes: item.attributes,
      isActive: true,
      isFeatured: item.isFeatured,
    },
    create: {
      name: item.name,
      slug: item.slug,
      sku: item.sku,
      description: item.description,
      shortDesc: item.shortDesc,
      price: item.price,
      comparePrice: item.comparePrice,
      costPrice: item.costPrice,
      volume: item.volume,
      brandId: brand.id,
      categoryId: category.id,
      scentNotes: item.scentNotes,
      attributes: item.attributes,
      isActive: true,
      isFeatured: item.isFeatured,
    },
  });

  await prisma.inventory.upsert({
    where: { productId: product.id },
    update: {
      quantity: item.quantity,
      lowStockThreshold: 5,
      reorderPoint: 10,
      lastRestocked: new Date(),
    },
    create: {
      productId: product.id,
      quantity: item.quantity,
      reserved: 0,
      lowStockThreshold: 5,
      reorderPoint: 10,
      lastRestocked: new Date(),
    },
  });

  const existingImages = await prisma.productImage.findMany({ where: { productId: product.id } });
  if (existingImages.length === 0) {
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: imageUrl,
        publicId: `luxora/${item.slug}`,
        altText: item.name,
        sortOrder: 1,
        isPrimary: true,
      },
    });
  } else {
    await prisma.productImage.updateMany({
      where: { productId: product.id },
      data: { url: imageUrl, altText: item.name, isPrimary: true },
    });
  }

  return product;
}

async function main() {
  const assetsDir = resolveAssetsDir();
  const publicProducts = join(process.cwd(), "public", "products");
  mkdirSync(publicProducts, { recursive: true });

  console.log("\n🌸 Syncing Luxora catalog from uploaded images...\n");

  await ensureBrand("luxora", "Luxora");

  const activeSlugs = CATALOG.map((c) => c.slug);

  for (const item of CATALOG) {
    const src = join(assetsDir, item.sourceFile);
    if (!existsSync(src)) {
      throw new Error(`Missing image file: ${src}`);
    }

    const destFile = `${item.slug}.png`;
    const dest = join(publicProducts, destFile);
    copyFileSync(src, dest);

    const imageUrl = `/products/${destFile}`;
    await upsertProduct(item, imageUrl);
    console.log(`  ✅ ${item.name}`);
    console.log(`     ${imageUrl}`);
  }

  const deactivated = await prisma.product.updateMany({
    where: { slug: { notIn: activeSlugs } },
    data: { isActive: false, isFeatured: false },
  });

  console.log(`\n  🚫 Deactivated ${deactivated.count} old products not in your image set.`);

  try {
    const { invalidateProductCaches } = await import("../src/services/product.service");
    await invalidateProductCaches();
    console.log("  ✅ Cache cleared.");
  } catch {
    /* non-fatal */
  }

  console.log(`\n✅ Catalog synced — ${CATALOG.length} products live with real photos.\n`);
}

main()
  .catch((e) => {
    console.error("❌", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
