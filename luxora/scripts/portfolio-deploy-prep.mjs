#!/usr/bin/env node
/**
 * Portfolio deploy helper — run from luxora/: npm run deploy:check
 * Generates secrets and reports which services you still need to set up.
 */

import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env.local");

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const vars = {};
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function isReal(value, placeholders = ["placeholder", "HOST/", "your-"]) {
  if (!value?.trim()) return false;
  const lower = value.toLowerCase();
  return !placeholders.some((p) => lower.includes(p.toLowerCase()));
}

const env = parseEnvFile(envPath);
const authSecret = randomBytes(32).toString("base64");

console.log("");
console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  LUXORA — Portfolio deploy checklist (free, $0/month)         ║");
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log("");
console.log("WHAT YOU MUST DO (2 free accounts):");
console.log("  1. Neon     → https://neon.tech        (database)");
console.log("  2. Vercel   → https://vercel.com       (hosting)");
console.log("");
console.log("SKIP FOR PORTFOLIO (not required):");
console.log("  • Cloudinary  — product images already use CDN URLs in seed data");
console.log("  • Upstash     — rate limits optional; app works without it");
console.log("  • Meilisearch — not wired in this project yet");
console.log("  • Resend      — emails optional; login still works without it");
console.log("  • Sentry      — not configured; skip for portfolio");
console.log("");
console.log("─── Copy this AUTH_SECRET into Vercel ───");
console.log(authSecret);
console.log("");
console.log("─── Your .env.local status ───");

if (!existsSync(envPath)) {
  console.log("  ⚠ No .env.local found. Copy .env.example → .env.local for local dev.");
} else {
  const checks = [
    ["DATABASE_URL", isReal(env.DATABASE_URL, ["HOST/"]), "Required — use Neon pooled URL on Vercel"],
    ["AUTH_SECRET", isReal(env.AUTH_SECRET, ["your-auth"]), "Required on Vercel"],
    ["STRIPE_SECRET_KEY", isReal(env.STRIPE_SECRET_KEY, ["sk_test_..."]), "Optional — checkout demo"],
    ["UPSTASH_REDIS_REST_URL", isReal(env.UPSTASH_REDIS_REST_URL), "Optional — rate limiting"],
    ["RESEND_API_KEY", isReal(env.RESEND_API_KEY, ["re_..."]), "Optional — emails"],
    ["CLOUDINARY_CLOUD_NAME", isReal(env.CLOUDINARY_CLOUD_NAME, ["your-cloud"]), "Optional — not needed for portfolio"],
    ["MEILISEARCH_HOST", isReal(env.MEILISEARCH_HOST, ["your-instance"]), "Optional — unused in code"],
  ];

  for (const [key, ok, note] of checks) {
    console.log(`  ${ok ? "✓" : "○"} ${key.padEnd(28)} ${note}`);
  }
}

console.log("");
console.log("─── Vercel env vars (minimum) ───");
console.log("  DATABASE_URL          = Neon pooled connection string");
console.log("  AUTH_SECRET           = (generated above)");
console.log("  AUTH_TRUST_HOST       = true");
console.log("  NEXT_PUBLIC_APP_URL   = https://YOUR-PROJECT.vercel.app  (after 1st deploy)");
console.log("  AUTH_URL              = same as NEXT_PUBLIC_APP_URL");
console.log("");
console.log("Optional — copy from .env.local if you want checkout on live site:");
console.log("  STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
console.log("");
console.log("─── After Neon database is created, run once ───");
console.log('  $env:DATABASE_URL="postgresql://..."; npx prisma migrate deploy');
console.log('  $env:DATABASE_URL="postgresql://..."; npm run db:seed');
console.log("");
console.log("Full guide: .agents/workflows/deploy_free_portfolio.md");
console.log("");
