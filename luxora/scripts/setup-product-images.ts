/**
 * Generates a unique SVG product card image per slug and syncs DB URLs.
 * Run: npm run db:setup-images
 */

import { config } from "dotenv";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString?.startsWith("postgres")) {
  console.error("❌ DATABASE_URL missing");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const PUBLIC_PRODUCTS = join(process.cwd(), "public", "products");
const CARD_BG = "#D2C0AA";
const GOLD = "#A97636";
const DARK = "#362C1D";
const MUTED = "#938775";

/** Prefer real photos when we have a unique image file */
const REAL_IMAGE_BY_SLUG: Record<string, string> = {
  "dior-sauvage-edt": "/images/sauvage.png",
  "creed-aventus": "/images/eclat-noir.png",
  "tom-ford-oud-wood": "/images/oud-eternal.png",
  "chanel-no-5-edp": "/images/valentino-donna.png",
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function generateSvg(slug: string, name: string, brand: string): string {
  const nameLines = wrapText(name, 18);
  const nameY = 520;
  const lineHeight = 36;

  const nameSvg = nameLines
    .map(
      (line, i) =>
        `<text x="400" y="${nameY + i * lineHeight}" text-anchor="middle" font-family="Georgia, serif" font-size="28" font-weight="600" fill="${DARK}">${escapeXml(line)}</text>`
    )
    .join("\n    ");

  // Unique accent bar colour per slug
  const hue = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="${CARD_BG}"/>
  <rect x="60" y="60" width="680" height="8" rx="4" fill="hsl(${hue}, 35%, 42%)"/>
  <text x="400" y="110" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="6" fill="${GOLD}">${escapeXml(brand.toUpperCase())}</text>
  <!-- Bottle silhouette -->
  <g transform="translate(400, 300)">
    <rect x="-55" y="-120" width="110" height="200" rx="12" fill="rgba(54,44,29,0.12)" stroke="${DARK}" stroke-width="3"/>
    <rect x="-35" y="-155" width="70" height="40" rx="6" fill="rgba(54,44,29,0.18)" stroke="${DARK}" stroke-width="3"/>
    <rect x="-20" y="-175" width="40" height="25" rx="4" fill="${DARK}" opacity="0.7"/>
    <ellipse cx="0" cy="60" rx="55" ry="12" fill="rgba(54,44,29,0.08)"/>
  </g>
  ${nameSvg}
  <text x="400" y="660" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" letter-spacing="4" fill="${MUTED}">LUXORA</text>
</svg>`;
}

async function main() {
  mkdirSync(PUBLIC_PRODUCTS, { recursive: true });

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      brand: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`\n🖼️  Setting up unique images for ${products.length} products...\n`);

  let updated = 0;

  for (const product of products) {
    const brand = product.brand?.name ?? "Luxora";
    let imageUrl: string;

    const realImage = REAL_IMAGE_BY_SLUG[product.slug];
    if (realImage) {
      imageUrl = realImage;
      console.log(`  📷 ${product.slug} → ${imageUrl} (photo)`);
    } else {
      const svgPath = join(PUBLIC_PRODUCTS, `${product.slug}.svg`);
      const svg = generateSvg(product.slug, product.name, brand);
      writeFileSync(svgPath, svg, "utf-8");
      imageUrl = `/products/${product.slug}.svg`;
      console.log(`  ✨ ${product.slug} → ${imageUrl} (generated)`);
    }

    const primary = product.images.find((i) => i.isPrimary) ?? product.images[0];

    if (primary) {
      if (primary.url !== imageUrl) {
        await prisma.productImage.update({
          where: { id: primary.id },
          data: { url: imageUrl, altText: product.name },
        });
        updated++;
      }
    } else {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imageUrl,
          publicId: `luxora/${product.slug}`,
          altText: product.name,
          sortOrder: 1,
          isPrimary: true,
        },
      });
      updated++;
    }
  }

  try {
    const { invalidateProductCaches } = await import("../src/services/product.service");
    await invalidateProductCaches();
    console.log("\n✅ Cache cleared.");
  } catch {
    console.log("\n⚠️  Restart dev server to see changes.");
  }

  console.log(`✅ Done — ${updated} database image URLs updated.`);
  console.log("   Visit /shop to see all products with unique images.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
