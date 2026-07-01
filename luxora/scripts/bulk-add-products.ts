/**
 * Bulk import products from image analysis batch.
 * Run: npm run db:bulk-add
 */

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

type ProductInput = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDesc: string;
  price: number;
  comparePrice: number;
  costPrice: number;
  volume: string;
  brandSlug: string;
  categorySlug: string;
  scentNotes: { top: string[]; middle: string[]; base: string[] };
  attributes: Record<string, string | string[]>;
  isFeatured: boolean;
  quantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  imagePath: string;
  imagePublicId: string;
};

const PRODUCTS: ProductInput[] = [
  {
    name: "Miss Dior Rose N'Roses",
    slug: "miss-dior-rose-nroses-50ml",
    sku: "DIOR-MISS-ROSE-50",
    description:
      "A fresh and floral fragrance celebrating the rose in full bloom. Miss Dior Rose N'Roses opens with vibrant rose petals and bergamot, layered with damask rose and white musk for a radiant, feminine scent.",
    shortDesc: "Fresh floral rose fragrance for women",
    price: 118,
    comparePrice: 138,
    costPrice: 62,
    volume: "50ml",
    brandSlug: "dior",
    categorySlug: "womens-fragrances",
    scentNotes: {
      top: ["Rose", "Bergamot", "Mandarin"],
      middle: ["Damask Rose", "Peony", "Geranium"],
      base: ["White Musk", "Cedar", "Amber"],
    },
    attributes: {
      gender: "Women",
      season: ["Spring", "Summer"],
      intensity: "Moderate",
      longevity: "6-8 hours",
      sillage: "Moderate",
    },
    isFeatured: true,
    quantity: 42,
    lowStockThreshold: 10,
    reorderPoint: 20,
    imagePath: "/products/miss-dior-rose-nroses.png",
    imagePublicId: "luxora/miss-dior-rose-nroses",
  },
  {
    name: "Coco Mademoiselle Eau de Parfum",
    slug: "coco-mademoiselle-edp-100ml",
    sku: "CHANEL-COCO-MAD-100",
    description:
      "A modern classic from Chanel. Coco Mademoiselle blends fresh orange with jasmine and rose, grounded by patchouli and vetiver for an elegant, spirited fragrance that embodies confident femininity.",
    shortDesc: "Elegant orange-jasmine floral for women",
    price: 168,
    comparePrice: 195,
    costPrice: 92,
    volume: "100ml",
    brandSlug: "chanel",
    categorySlug: "womens-fragrances",
    scentNotes: {
      top: ["Orange", "Mandarin", "Bergamot"],
      middle: ["Jasmine", "Rose", "Lychee"],
      base: ["Patchouli", "Vetiver", "White Musk"],
    },
    attributes: {
      gender: "Women",
      season: ["All Seasons"],
      intensity: "Moderate to Strong",
      longevity: "8-10 hours",
      sillage: "Moderate to Heavy",
    },
    isFeatured: true,
    quantity: 35,
    lowStockThreshold: 8,
    reorderPoint: 15,
    imagePath: "/products/coco-mademoiselle.png",
    imagePublicId: "luxora/coco-mademoiselle",
  },
  {
    name: "Chanel Chance Eau de Toilette",
    slug: "chanel-chance-edt-100ml",
    sku: "CHANEL-CHANCE-EDT-100",
    description:
      "A whimsical, unpredictable fragrance in Chanel's iconic round bottle. Chance combines pink pepper and pineapple with jasmine and patchouli for a sparkling, youthful scent full of possibility.",
    shortDesc: "Sparkling unpredictable floral fragrance",
    price: 142,
    comparePrice: 165,
    costPrice: 78,
    volume: "100ml",
    brandSlug: "chanel",
    categorySlug: "unisex-fragrances",
    scentNotes: {
      top: ["Pink Pepper", "Pineapple", "Hyacinth"],
      middle: ["Jasmine", "Iris", "Citrus"],
      base: ["Patchouli", "Musk", "Vetiver"],
    },
    attributes: {
      gender: "Unisex",
      season: ["Spring", "Summer"],
      intensity: "Moderate",
      longevity: "6-8 hours",
      sillage: "Moderate",
    },
    isFeatured: false,
    quantity: 28,
    lowStockThreshold: 6,
    reorderPoint: 12,
    imagePath: "/products/chanel-chance.png",
    imagePublicId: "luxora/chanel-chance",
  },
  {
    name: "Tom Ford Grey Vetiver Eau de Parfum",
    slug: "tom-ford-grey-vetiver-edp-50ml",
    sku: "TF-GREY-VETIVER-50",
    description:
      "A refined vetiver fragrance that captures the essence of masculine elegance. Grey Vetiver opens with citrus and spice, developing into a heart of iris and vetiver, finishing with oakmoss and amber.",
    shortDesc: "Refined citrus-vetiver masculine elegance",
    price: 195,
    comparePrice: 225,
    costPrice: 105,
    volume: "50ml",
    brandSlug: "tom-ford",
    categorySlug: "mens-fragrances",
    scentNotes: {
      top: ["Grapefruit", "Sage", "Nutmeg"],
      middle: ["Iris", "Vetiver", "Orris"],
      base: ["Oakmoss", "Amber", "Woody Notes"],
    },
    attributes: {
      gender: "Men",
      season: ["Spring", "Fall"],
      intensity: "Moderate",
      longevity: "8-10 hours",
      sillage: "Moderate",
    },
    isFeatured: false,
    quantity: 18,
    lowStockThreshold: 5,
    reorderPoint: 10,
    imagePath: "/products/tom-ford-grey-vetiver.png",
    imagePublicId: "luxora/tom-ford-grey-vetiver",
  },
  {
    name: "Tom Ford Tobacco Vanille Eau de Parfum",
    slug: "tom-ford-tobacco-vanille-edp-50ml",
    sku: "TF-TOBACCO-VANILLE-50",
    description:
      "An opulent oriental masterpiece. Tobacco Vanille weaves tobacco leaf and tonka bean with vanilla, cocoa, and dried fruit accords for a warm, sensual fragrance of unapologetic luxury.",
    shortDesc: "Opulent warm tobacco and vanilla",
    price: 285,
    comparePrice: 320,
    costPrice: 155,
    volume: "50ml",
    brandSlug: "tom-ford",
    categorySlug: "mens-fragrances",
    scentNotes: {
      top: ["Tobacco Leaf", "Spicy Notes"],
      middle: ["Tonka Bean", "Vanilla", "Cacao"],
      base: ["Dried Fruits", "Woody Notes", "Sweet Woods"],
    },
    attributes: {
      gender: "Men",
      season: ["Fall", "Winter"],
      intensity: "Strong",
      longevity: "10-12 hours",
      sillage: "Heavy",
    },
    isFeatured: true,
    quantity: 12,
    lowStockThreshold: 4,
    reorderPoint: 8,
    imagePath: "/products/tom-ford-tobacco-vanille.png",
    imagePublicId: "luxora/tom-ford-tobacco-vanille",
  },
  {
    name: "Dior Sauvage Parfum",
    slug: "dior-sauvage-parfum-100ml",
    sku: "DIOR-SAUVAGE-PARFUM-100",
    description:
      "The most concentrated expression of Sauvage. This parfum intensifies the iconic freshness with bergamot and Sichuan pepper, enriched with deeper woody and ambery notes for lasting power and sophistication.",
    shortDesc: "Intense concentrated Sauvage parfum",
    price: 155,
    comparePrice: 178,
    costPrice: 82,
    volume: "100ml",
    brandSlug: "dior",
    categorySlug: "unisex-fragrances",
    scentNotes: {
      top: ["Bergamot", "Mandarin"],
      middle: ["Sichuan Pepper", "Lavender", "Star Anise"],
      base: ["Ambroxan", "Cedar", "Labdanum", "Vanilla"],
    },
    attributes: {
      gender: "Unisex",
      season: ["All Seasons"],
      intensity: "Strong",
      longevity: "10-12 hours",
      sillage: "Heavy",
    },
    isFeatured: true,
    quantity: 55,
    lowStockThreshold: 12,
    reorderPoint: 25,
    imagePath: "/products/dior-sauvage-parfum.png",
    imagePublicId: "luxora/dior-sauvage-parfum",
  },
  {
    name: "Creed Spice and Wood",
    slug: "creed-spice-and-wood-75ml",
    sku: "CREED-SPICE-WOOD-75",
    description:
      "A luxurious woody fragrance from the House of Creed. Spice and Wood balances apple and bergamot with clove, pimento, and cedar, finishing with oak and iris for a refined, aristocratic scent.",
    shortDesc: "Luxurious apple-wood niche parfum",
    price: 620,
    comparePrice: 680,
    costPrice: 340,
    volume: "75ml",
    brandSlug: "creed",
    categorySlug: "mens-fragrances",
    scentNotes: {
      top: ["Apple", "Bergamot", "Lemon"],
      middle: ["Clove", "Pimento", "Jasmine"],
      base: ["Cedar", "Oak", "Iris", "Ambergris"],
    },
    attributes: {
      gender: "Men",
      season: ["Fall", "Winter"],
      intensity: "Moderate to Strong",
      longevity: "8-10 hours",
      sillage: "Moderate to Heavy",
    },
    isFeatured: false,
    quantity: 8,
    lowStockThreshold: 3,
    reorderPoint: 5,
    imagePath: "/products/creed-spice-and-wood.png",
    imagePublicId: "luxora/creed-spice-and-wood",
  },
  {
    name: "Creed Green Irish Tweed",
    slug: "creed-green-irish-tweed-100ml",
    sku: "CREED-GIT-100",
    description:
      "An iconic fresh fougère from Creed, beloved since 1985. Green Irish Tweed opens with lemon and verbena, layered with violet and iris over a base of sandalwood and ambergris — timeless masculine elegance.",
    shortDesc: "Iconic fresh fougère masculine classic",
    price: 435,
    comparePrice: 480,
    costPrice: 225,
    volume: "100ml",
    brandSlug: "creed",
    categorySlug: "mens-fragrances",
    scentNotes: {
      top: ["Lemon", "Verbena", "Peppermint"],
      middle: ["Violet", "Iris", "Floral Notes"],
      base: ["Sandalwood", "Ambergris", "Cedar"],
    },
    attributes: {
      gender: "Men",
      season: ["Spring", "Summer", "Fall"],
      intensity: "Moderate",
      longevity: "8-10 hours",
      sillage: "Moderate",
    },
    isFeatured: false,
    quantity: 22,
    lowStockThreshold: 5,
    reorderPoint: 10,
    imagePath: "/products/creed-green-irish-tweed.png",
    imagePublicId: "luxora/creed-green-irish-tweed",
  },
];

async function addProduct(input: ProductInput) {
  const brand = await prisma.brand.findUnique({
    where: { slug: input.brandSlug },
  });
  if (!brand) throw new Error(`Brand not found: ${input.brandSlug}`);

  const category = await prisma.category.findUnique({
    where: { slug: input.categorySlug },
  });
  if (!category) throw new Error(`Category not found: ${input.categorySlug}`);

  const existing = await prisma.product.findFirst({
    where: { OR: [{ slug: input.slug }, { sku: input.sku }] },
  });
  if (existing) {
    console.log(`  ⏭️  Skipped (exists): ${input.name}`);
    return null;
  }

  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      shortDesc: input.shortDesc,
      price: input.price,
      comparePrice: input.comparePrice,
      costPrice: input.costPrice,
      sku: input.sku,
      volume: input.volume,
      brandId: brand.id,
      categoryId: category.id,
      scentNotes: input.scentNotes,
      attributes: input.attributes,
      isActive: true,
      isFeatured: input.isFeatured,
    },
  });

  await prisma.inventory.create({
    data: {
      productId: product.id,
      quantity: input.quantity,
      reserved: 0,
      lowStockThreshold: input.lowStockThreshold,
      reorderPoint: input.reorderPoint,
      lastRestocked: new Date(),
    },
  });

  await prisma.productImage.create({
    data: {
      productId: product.id,
      url: input.imagePath,
      publicId: input.imagePublicId,
      altText: input.name,
      sortOrder: 1,
      isPrimary: true,
    },
  });

  return product;
}

async function main() {
  console.log(`🌸 Bulk importing ${PRODUCTS.length} products...\n`);

  const added: { name: string; slug: string; price: number; quantity: number }[] = [];

  for (const input of PRODUCTS) {
    console.log(`Adding: ${input.name}`);
    const product = await addProduct(input);
    if (product) {
      added.push({
        name: product.name,
        slug: product.slug,
        price: input.price,
        quantity: input.quantity,
      });
      console.log(`  ✅ $${input.price} | stock: ${input.quantity} | /products/${product.slug}`);
    }
  }

  console.log(`\n✅ Done! Added ${added.length} new products.\n`);
  console.log("Summary:");
  console.log("─".repeat(70));
  for (const p of added) {
    console.log(
      `  ${p.name.padEnd(38)} $${String(p.price).padStart(4)}  stock:${String(p.quantity).padStart(3)}  /products/${p.slug}`
    );
  }
}

main()
  .catch((err) => {
    console.error("❌ Failed:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
