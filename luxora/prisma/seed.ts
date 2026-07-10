import { config } from "dotenv";
import { hash } from "bcryptjs";
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

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data (optional - comment out if you want to preserve data)
  console.log("Cleaning existing data...");
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin User (SUPER_ADMIN — full access)
  console.log("Creating admin user...");
  const adminPassword = await hash("Admin123!", 12);
  const admin = await prisma.user.create({
    data: {
      email: "admin@luxora.com",
      name: "Luxora Admin",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
      isActive: true,
    },
  });

  // Create Demo Admin (ADMIN role, isDemo flag blocks writes)
  console.log("Creating demo admin user...");
  const demoAdminPassword = await hash("DemoAdmin123!", 12);
  await prisma.user.create({
    data: {
      email: "demo-admin@luxora.com",
      name: "Demo Admin",
      passwordHash: demoAdminPassword,
      role: "ADMIN",
      notificationPrefs: { isDemo: true },
      emailVerified: new Date(),
      isActive: true,
    },
  });

  // Create Test Customer
  console.log("Creating test customer...");
  const customerPassword = await hash("Customer123!", 12);
  const customer = await prisma.user.create({
    data: {
      email: "customer@test.com",
      name: "John Doe",
      passwordHash: customerPassword,
      role: "CUSTOMER",
      emailVerified: new Date(),
      isActive: true,
    },
  });

  // Create Demo Customer
  console.log("Creating demo customer user...");
  const demoCustomerPassword = await hash("Demo123!", 12);
  await prisma.user.create({
    data: {
      email: "demo@luxora.com",
      name: "Demo Customer",
      passwordHash: demoCustomerPassword,
      role: "CUSTOMER",
      emailVerified: new Date(),
      isActive: true,
    },
  });

  // Create Brands
  console.log("Creating luxury brands...");
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: "Chanel",
        slug: "chanel",
        description: "French luxury fashion and beauty house",
        country: "France",
        isActive: true,
      },
    }),
    prisma.brand.create({
      data: {
        name: "Dior",
        slug: "dior",
        description: "French luxury goods company",
        country: "France",
        isActive: true,
      },
    }),
    prisma.brand.create({
      data: {
        name: "Tom Ford",
        slug: "tom-ford",
        description: "American luxury fashion house",
        country: "United States",
        isActive: true,
      },
    }),
    prisma.brand.create({
      data: {
        name: "Creed",
        slug: "creed",
        description: "Anglo-French perfume house",
        country: "France",
        isActive: true,
      },
    }),
    prisma.brand.create({
      data: {
        name: "Maison Francis Kurkdjian",
        slug: "maison-francis-kurkdjian",
        description: "French luxury perfume house",
        country: "France",
        isActive: true,
      },
    }),
  ]);

  // Create Categories
  console.log("Creating categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Men's Fragrances",
        slug: "mens-fragrances",
        description: "Luxury perfumes for men",
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Women's Fragrances",
        slug: "womens-fragrances",
        description: "Luxury perfumes for women",
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Unisex Fragrances",
        slug: "unisex-fragrances",
        description: "Gender-neutral luxury perfumes",
        sortOrder: 3,
        isActive: true,
      },
    }),
  ]);

  // Create Products
  console.log("Creating luxury products...");
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Bleu de Chanel Eau de Parfum",
        slug: "bleu-de-chanel-edp",
        description:
          "A woody aromatic fragrance that embodies independence and determination. The scent opens with fresh citrus notes, complemented by a heart of cedar and labdanum, finishing with a sophisticated blend of sandalwood and tonka bean.",
        shortDesc: "Woody aromatic fragrance for the modern man",
        price: 165.0,
        comparePrice: 185.0,
        costPrice: 95.0,
        sku: "CHANEL-BLEU-EDP-100",
        volume: "100ml",
        brandId: brands[0].id,
        categoryId: categories[0].id,
        scentNotes: {
          top: ["Citrus", "Mint", "Pink Pepper"],
          middle: ["Ginger", "Jasmine", "Melon"],
          base: ["Cedar", "Sandalwood", "Patchouli", "Labdanum"],
        },
        attributes: {
          gender: "Men",
          season: ["Fall", "Winter"],
          intensity: "Moderate",
          longevity: "8-10 hours",
          sillage: "Moderate to Heavy",
        },
        isActive: true,
        isFeatured: true,
        avgRating: 4.8,
        reviewCount: 247,
      },
    }),
    prisma.product.create({
      data: {
        name: "Chanel No. 5 Eau de Parfum",
        slug: "chanel-no-5-edp",
        description:
          "The iconic fragrance that defined modern perfumery. A timeless floral aldehyde composition with notes of jasmine, rose, and vanilla. Created in 1921 by Ernest Beaux, it remains one of the world's most recognizable perfumes.",
        shortDesc: "The iconic timeless floral fragrance",
        price: 150.0,
        comparePrice: 175.0,
        costPrice: 85.0,
        sku: "CHANEL-NO5-EDP-100",
        volume: "100ml",
        brandId: brands[0].id,
        categoryId: categories[1].id,
        scentNotes: {
          top: ["Aldehydes", "Neroli", "Ylang-Ylang", "Bergamot"],
          middle: ["Jasmine", "Rose", "Lily of the Valley", "Iris"],
          base: ["Sandalwood", "Vanilla", "Amber", "Patchouli"],
        },
        attributes: {
          gender: "Women",
          season: ["All Seasons"],
          intensity: "Strong",
          longevity: "10-12 hours",
          sillage: "Heavy",
        },
        isActive: true,
        isFeatured: true,
        avgRating: 4.9,
        reviewCount: 892,
      },
    }),
    prisma.product.create({
      data: {
        name: "Sauvage Eau de Toilette",
        slug: "dior-sauvage-edt",
        description:
          "Inspired by wide-open spaces and raw nature. Sauvage is a fresh and powerful fragrance featuring notes of bergamot, Sichuan pepper, and ambroxan. A bold interpretation of masculinity.",
        shortDesc: "Fresh and powerful masculine fragrance",
        price: 135.0,
        comparePrice: 160.0,
        costPrice: 75.0,
        sku: "DIOR-SAUVAGE-EDT-100",
        volume: "100ml",
        brandId: brands[1].id,
        categoryId: categories[0].id,
        scentNotes: {
          top: ["Calabrian Bergamot", "Pepper"],
          middle: ["Sichuan Pepper", "Lavender", "Pink Pepper", "Vetiver"],
          base: ["Ambroxan", "Cedar", "Labdanum"],
        },
        attributes: {
          gender: "Men",
          season: ["Spring", "Summer", "Fall"],
          intensity: "Moderate to Strong",
          longevity: "8-10 hours",
          sillage: "Moderate to Heavy",
        },
        isActive: true,
        isFeatured: true,
        avgRating: 4.7,
        reviewCount: 1456,
      },
    }),
    prisma.product.create({
      data: {
        name: "Tom Ford Oud Wood",
        slug: "tom-ford-oud-wood",
        description:
          "An exotic blend of rare oud wood, sandalwood, and Chinese pepper. Complemented by tonka bean, vanilla, and amber. A sophisticated interpretation of one of perfumery's most revered ingredients.",
        shortDesc: "Exotic oud fragrance with rare ingredients",
        price: 295.0,
        comparePrice: 320.0,
        costPrice: 165.0,
        sku: "TOMFORD-OUD-EDP-100",
        volume: "100ml",
        brandId: brands[2].id,
        categoryId: categories[2].id,
        scentNotes: {
          top: ["Oud Wood", "Rosewood", "Cardamom"],
          middle: ["Sichuan Pepper", "Vetiver", "Sandalwood"],
          base: ["Tonka Bean", "Vanilla", "Amber"],
        },
        attributes: {
          gender: "Unisex",
          season: ["Fall", "Winter"],
          intensity: "Strong",
          longevity: "10-14 hours",
          sillage: "Heavy",
        },
        isActive: true,
        isFeatured: true,
        avgRating: 4.6,
        reviewCount: 523,
      },
    }),
    prisma.product.create({
      data: {
        name: "Aventus",
        slug: "creed-aventus",
        description:
          "A legendary fragrance celebrating strength, vision, and success. Inspired by Napoleon Bonaparte. Features top notes of pineapple, bergamot, and blackcurrant with a base of oakmoss, musk, and vanilla.",
        shortDesc: "Legendary masculine fragrance celebrating success",
        price: 445.0,
        comparePrice: 495.0,
        costPrice: 245.0,
        sku: "CREED-AVENTUS-EDP-100",
        volume: "100ml",
        brandId: brands[3].id,
        categoryId: categories[0].id,
        scentNotes: {
          top: ["Pineapple", "Bergamot", "Blackcurrant", "Apple"],
          middle: ["Birch", "Patchouli", "Moroccan Jasmine", "Rose"],
          base: ["Oakmoss", "Musk", "Ambergris", "Vanilla"],
        },
        attributes: {
          gender: "Men",
          season: ["Spring", "Summer", "Fall"],
          intensity: "Strong",
          longevity: "10-12 hours",
          sillage: "Heavy",
        },
        isActive: true,
        isFeatured: true,
        avgRating: 4.9,
        reviewCount: 2134,
      },
    }),
    prisma.product.create({
      data: {
        name: "Baccarat Rouge 540",
        slug: "mfk-baccarat-rouge-540",
        description:
          "An iconic fragrance that has become a modern classic. The luminous woody floral scent features jasmine, saffron, cedarwood, and ambergris creating an airy, transparent, and radiant aura.",
        shortDesc: "Luminous woody floral modern classic",
        price: 325.0,
        comparePrice: 365.0,
        costPrice: 180.0,
        sku: "MFK-BACCARAT-EDP-70",
        volume: "70ml",
        brandId: brands[4].id,
        categoryId: categories[2].id,
        scentNotes: {
          top: ["Jasmine", "Saffron"],
          middle: ["Amberwood", "Ambergris"],
          base: ["Fir Resin", "Cedar"],
        },
        attributes: {
          gender: "Unisex",
          season: ["All Seasons"],
          intensity: "Moderate to Strong",
          longevity: "10-12 hours",
          sillage: "Heavy",
        },
        isActive: true,
        isFeatured: true,
        avgRating: 4.8,
        reviewCount: 1876,
      },
    }),
  ]);

  // Create Inventory for each product
  console.log("Creating inventory records...");
  await Promise.all(
    products.map((product) =>
      prisma.inventory.create({
        data: {
          productId: product.id,
          quantity: 50,
          reserved: 0,
          lowStockThreshold: 10,
          reorderPoint: 20,
          lastRestocked: new Date(),
        },
      })
    )
  );

  // Create Product Images
  console.log("Creating product images...");
  await prisma.productImage.createMany({
    data: [
      {
        productId: products[0].id,
        url: "https://via.placeholder.com/800x800/1a1a1a/C49A45?text=Bleu+de+Chanel",
        publicId: "luxora/bleu-de-chanel-1",
        altText: "Bleu de Chanel Eau de Parfum",
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: products[1].id,
        url: "https://via.placeholder.com/800x800/1a1a1a/C49A45?text=Chanel+No.5",
        publicId: "luxora/chanel-no5-1",
        altText: "Chanel No. 5 Eau de Parfum",
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: products[2].id,
        url: "https://via.placeholder.com/800x800/1a1a1a/C49A45?text=Dior+Sauvage",
        publicId: "luxora/dior-sauvage-1",
        altText: "Dior Sauvage Eau de Toilette",
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: products[3].id,
        url: "https://via.placeholder.com/800x800/1a1a1a/C49A45?text=Tom+Ford+Oud",
        publicId: "luxora/tom-ford-oud-1",
        altText: "Tom Ford Oud Wood",
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: products[4].id,
        url: "https://via.placeholder.com/800x800/1a1a1a/C49A45?text=Creed+Aventus",
        publicId: "luxora/creed-aventus-1",
        altText: "Creed Aventus",
        sortOrder: 1,
        isPrimary: true,
      },
      {
        productId: products[5].id,
        url: "https://via.placeholder.com/800x800/1a1a1a/C49A45?text=Baccarat+Rouge",
        publicId: "luxora/baccarat-rouge-1",
        altText: "Baccarat Rouge 540",
        sortOrder: 1,
        isPrimary: true,
      },
    ],
  });

  // Create Sample Coupons
  console.log("Creating coupons...");
  await Promise.all([
    prisma.coupon.create({
      data: {
        code: "WELCOME10",
        description: "10% off your first order",
        type: "PERCENTAGE",
        value: 10,
        minOrderValue: 100,
        usageLimit: 1000,
        perUserLimit: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true,
      },
    }),
    prisma.coupon.create({
      data: {
        code: "LUXURY50",
        description: "$50 off orders over $300",
        type: "FIXED_AMOUNT",
        value: 50,
        minOrderValue: 300,
        usageLimit: 500,
        perUserLimit: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    }),
    prisma.coupon.create({
      data: {
        code: "FREESHIP",
        description: "Free standard shipping on orders over $75",
        type: "FREE_SHIPPING",
        value: 1,
        minOrderValue: 75,
        usageLimit: 1000,
        perUserLimit: 2,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    }),
  ]);

  // Create Sample Reviews
  console.log("Creating reviews...");
  await Promise.all([
    prisma.review.create({
      data: {
        userId: customer.id,
        productId: products[0].id,
        rating: 5,
        title: "Absolutely magnificent!",
        comment:
          "This is by far the best fragrance I've ever owned. The longevity is incredible and I receive compliments every time I wear it. Well worth the investment!",
        isVerified: true,
        isApproved: true,
        helpfulCount: 12,
      },
    }),
    prisma.review.create({
      data: {
        userId: customer.id,
        productId: products[4].id,
        rating: 5,
        title: "Lives up to the hype",
        comment:
          "Aventus truly is a masterpiece. The pineapple opening is perfect and it develops beautifully throughout the day. Expensive but worth every penny.",
        isVerified: true,
        isApproved: true,
        helpfulCount: 24,
      },
    }),
  ]);

  console.log("✅ Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - ${brands.length} brands created`);
  console.log(`   - ${categories.length} categories created`);
  console.log(`   - ${products.length} products created`);
  console.log(`   - Admin: admin@luxora.com (password: Admin123!)`);
  console.log(`   - Customer: customer@test.com (password: Customer123!)`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
