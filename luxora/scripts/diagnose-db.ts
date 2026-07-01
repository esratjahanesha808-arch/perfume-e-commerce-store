import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

config({ path: ".env.local" });

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      isFeatured: true,
      createdAt: true,
      brand: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { url: true, isPrimary: true } },
      inventory: { select: { quantity: true } },
    },
  });

  const active = products.filter((p) => p.isActive);
  const inactive = products.filter((p) => !p.isActive);
  const noImages = active.filter((p) => p.images.length === 0);
  const noPrimary = active.filter((p) => p.images.length > 0 && !p.images.some((i) => i.isPrimary));

  console.log("\n=== LUXORA DATABASE DIAGNOSTIC ===\n");
  console.log(`Database: ${process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] ?? "unknown"}`);
  console.log(`Total products:     ${products.length}`);
  console.log(`Active (on shop):   ${active.length}`);
  console.log(`Inactive (hidden):  ${inactive.length}`);
  console.log(`Missing images:     ${noImages.length}`);
  console.log(`No primary image:   ${noPrimary.length}`);
  console.log(`Featured (homepage): ${active.filter((p) => p.isFeatured).length}`);

  const imageGroups = new Map<string, string[]>();
  for (const p of active) {
    const url = p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url ?? "(none)";
    const group = imageGroups.get(url) ?? [];
    group.push(p.slug);
    imageGroups.set(url, group);
  }

  const duplicateImages = [...imageGroups.entries()].filter(([, slugs]) => slugs.length > 1);
  if (duplicateImages.length > 0) {
    console.log("\n⚠️  Products sharing the SAME image (look identical on site):");
    for (const [url, slugs] of duplicateImages) {
      console.log(`   ${url}`);
      slugs.forEach((s) => console.log(`      - ${s}`));
    }
  }

  console.log("\n--- All products ---");
  for (const p of products) {
    const primary = p.images.find((i) => i.isPrimary) ?? p.images[0];
    const flags = [
      p.isActive ? "ACTIVE" : "INACTIVE",
      p.isFeatured ? "FEATURED" : null,
      p.images.length === 0 ? "NO IMAGE" : null,
    ]
      .filter(Boolean)
      .join(", ");

    console.log(`\n[${flags}] ${p.name}`);
    console.log(`  slug: ${p.slug}`);
    console.log(`  brand: ${p.brand?.name ?? "—"}`);
    console.log(`  image: ${primary?.url ?? "(none)"}`);
    console.log(`  stock: ${p.inventory?.quantity ?? 0}`);
  }

  if (inactive.length > 0) {
    console.log("\n💡 Inactive products are hidden from the website. Set is_active = true in Neon.");
  }
  if (noImages.length > 0) {
    console.log("\n💡 Add a row in product_images with is_primary = true for each product.");
  }
  console.log("\n💡 Homepage Best Sellers shows up to 10 featured products.");
  console.log("   Shop page (/shop) shows ALL active products.\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
