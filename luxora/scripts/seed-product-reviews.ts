/**
 * Seeds approved reviews for products that have none.
 * Updates product avgRating + reviewCount from inserted rows.
 *
 * Run: npx tsx scripts/seed-product-reviews.ts
 */

import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString?.startsWith("postgres")) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const REVIEW_TEMPLATES = [
  {
    rating: 5,
    title: "Absolutely exquisite",
    comment:
      "The projection is refined yet noticeable — exactly what I expect from a luxury parfum. It lasts all day on my skin.",
  },
  {
    rating: 5,
    title: "My signature scent",
    comment:
      "Beautifully balanced from the first spray to the dry down. The packaging and presentation feel truly premium.",
  },
  {
    rating: 4,
    title: "Worth every penny",
    comment:
      "I was hesitant at this price point, but the quality is undeniable. Rich, elegant, and unmistakably luxurious.",
  },
];

const REVIEWERS = [
  { email: "alexandra.review@luxora.test", name: "Alexandra M." },
  { email: "james.review@luxora.test", name: "James R." },
  { email: "sophie.review@luxora.test", name: "Sophie L." },
];

async function ensureReviewers() {
  const users = [];
  for (const reviewer of REVIEWERS) {
    const user = await prisma.user.upsert({
      where: { email: reviewer.email },
      create: {
        email: reviewer.email,
        name: reviewer.name,
        role: "CUSTOMER",
        isActive: true,
      },
      update: { name: reviewer.name },
    });
    users.push(user);
  }
  return users;
}

async function main() {
  const reviewers = await ensureReviewers();

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { reviews: { where: { isApproved: true }, select: { id: true } } },
  });

  let seeded = 0;

  for (const product of products) {
    if (product.reviews.length > 0) continue;

    for (const [i, template] of REVIEW_TEMPLATES.entries()) {
      await prisma.review.create({
        data: {
          userId: reviewers[i].id,
          productId: product.id,
          rating: template.rating,
          title: template.title,
          comment: `${template.comment} (${product.name})`,
          isVerified: true,
          isApproved: true,
          helpfulCount: 6 + i * 4,
          createdAt: new Date(Date.now() - (i + 1) * 14 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const avg = REVIEW_TEMPLATES.reduce((s, r) => s + r.rating, 0) / REVIEW_TEMPLATES.length;

    await prisma.product.update({
      where: { id: product.id },
      data: {
        reviewCount: REVIEW_TEMPLATES.length,
        avgRating: Math.round(avg * 10) / 10,
      },
    });

    seeded++;
    console.log(`✓ ${product.slug} — ${REVIEW_TEMPLATES.length} reviews`);
  }

  console.log(`\nDone. Seeded reviews for ${seeded} product(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
