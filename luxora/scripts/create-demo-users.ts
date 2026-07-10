/**
 * LUXORA — Create Demo Users Script
 *
 * Run this to add/update the demo accounts without re-seeding all data:
 *   npx tsx scripts/create-demo-users.ts
 *
 * Accounts created:
 *   demo-admin@luxora.com  / DemoAdmin123!  (ADMIN role, isDemo: true)
 *   demo@luxora.com        / Demo123!       (CUSTOMER role)
 */

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
  console.log("🎭 Creating demo accounts...\n");

  // ── Demo Admin (read-only admin preview) ──────────────────────────────────
  const demoAdminEmail = "demo-admin@luxora.com";
  const demoAdminHash = await hash("DemoAdmin123!", 12);

  const demoAdmin = await prisma.user.upsert({
    where: { email: demoAdminEmail },
    update: {
      passwordHash: demoAdminHash,
      notificationPrefs: { isDemo: true },
      role: "ADMIN",
      isActive: true,
      emailVerified: new Date(),
    },
    create: {
      email: demoAdminEmail,
      name: "Demo Admin",
      passwordHash: demoAdminHash,
      role: "ADMIN",
      notificationPrefs: { isDemo: true },
      emailVerified: new Date(),
      isActive: true,
    },
  });

  console.log(`✅ Demo Admin created/updated`);
  console.log(`   Email   : ${demoAdmin.email}`);
  console.log(`   Password: DemoAdmin123!`);
  console.log(`   Role    : ADMIN (read-only demo)\n`);

  // ── Demo Customer ─────────────────────────────────────────────────────────
  const demoUserEmail = "demo@luxora.com";
  const demoUserHash = await hash("Demo123!", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: demoUserEmail },
    update: {
      passwordHash: demoUserHash,
      isActive: true,
      emailVerified: new Date(),
    },
    create: {
      email: demoUserEmail,
      name: "Demo Customer",
      passwordHash: demoUserHash,
      role: "CUSTOMER",
      emailVerified: new Date(),
      isActive: true,
    },
  });

  console.log(`✅ Demo Customer created/updated`);
  console.log(`   Email   : ${demoUser.email}`);
  console.log(`   Password: Demo123!`);
  console.log(`   Role    : CUSTOMER\n`);

  console.log("── Summary ─────────────────────────────────────────────────");
  console.log("Account                     | Email                      | Password");
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Your Admin (SUPER_ADMIN)    | admin@luxora.com           | Admin123!");
  console.log("Client Admin Demo (ADMIN)   | demo-admin@luxora.com      | DemoAdmin123!");
  console.log("Client User Demo (CUSTOMER) | demo@luxora.com            | Demo123!");
  console.log("Test Customer (CUSTOMER)    | customer@test.com          | Customer123!");
  console.log("─────────────────────────────────────────────────────────────\n");
}

main()
  .catch((err) => {
    console.error("❌ Script failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
