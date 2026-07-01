import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

config({ path: ".env.local" });

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      slug: true,
      isFeatured: true,
      createdAt: true,
      images: { orderBy: { sortOrder: "asc" }, select: { url: true, isPrimary: true } },
    },
  });

  console.log("Total active products:", products.length);
  for (const p of products) {
    const primary = p.images.find((i) => i.isPrimary) ?? p.images[0];
    console.log({
      name: p.name,
      slug: p.slug,
      featured: p.isFeatured,
      created: p.createdAt.toISOString().slice(0, 10),
      imageUrl: primary?.url ?? "(none)",
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
