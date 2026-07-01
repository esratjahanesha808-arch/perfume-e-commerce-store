/**
 * Updates STRIPE_WEBHOOK_SECRET in .env.local from stripe listen output.
 * Usage: node scripts/set-webhook-secret.mjs whsec_xxxxx
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const secret = process.argv[2]?.trim();
if (!secret || !secret.startsWith("whsec_")) {
  console.error("Usage: node scripts/set-webhook-secret.mjs whsec_...");
  process.exit(1);
}

const envPath = resolve(process.cwd(), ".env.local");
let content = readFileSync(envPath, "utf8");

if (/^STRIPE_WEBHOOK_SECRET=.*/m.test(content)) {
  content = content.replace(
    /^STRIPE_WEBHOOK_SECRET=.*/m,
    `STRIPE_WEBHOOK_SECRET="${secret}"`
  );
} else {
  content += `\nSTRIPE_WEBHOOK_SECRET="${secret}"\n`;
}

writeFileSync(envPath, content, "utf8");
console.log("Updated STRIPE_WEBHOOK_SECRET in .env.local");
