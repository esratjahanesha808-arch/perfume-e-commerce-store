import { Prisma, PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaUserFields?: string;
};

function getUserSchemaFingerprint() {
  return Object.keys(Prisma.UserScalarFieldEnum).sort().join(",");
}

// Create the adapter using Neon
const connectionString = process.env.DATABASE_URL || "";

// True only when DATABASE_URL points at a real database (not the .env.example
// placeholder). Used by services to skip queries that would otherwise hang
// forever on an unreachable host.
export const isDbConfigured =
  connectionString.startsWith("postgres") && !connectionString.includes("HOST/");

let prismaClientOptions: ConstructorParameters<typeof PrismaClient>[0] = {};

if (isDbConfigured) {
  const adapter = new PrismaNeon({ connectionString });
  prismaClientOptions = { adapter };
}

if (process.env.NODE_ENV === "development") {
  prismaClientOptions.log = ["query", "error", "warn"];
} else {
  prismaClientOptions.log = ["error"];
}

const currentUserFields = getUserSchemaFingerprint();

if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.prisma &&
  globalForPrisma.prismaUserFields &&
  globalForPrisma.prismaUserFields !== currentUserFields
) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const db =
  globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaUserFields = currentUserFields;
}
