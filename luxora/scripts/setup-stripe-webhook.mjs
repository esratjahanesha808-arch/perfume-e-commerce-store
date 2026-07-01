/**
 * Starts stripe listen and writes STRIPE_WEBHOOK_SECRET to .env.local.
 * Reads STRIPE_SECRET_KEY from .env.local via dotenv (no CLI args).
 */
import { config } from "dotenv";
import { spawn } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
if (!stripeKey?.startsWith("sk_")) {
  console.error("STRIPE_SECRET_KEY missing or invalid in .env.local");
  process.exit(1);
}

const stripeListen = spawn(
  "stripe",
  [
    "listen",
    "--forward-to",
    "http://localhost:3000/api/v1/webhooks/stripe",
    "--api-key",
    stripeKey,
    "--print-secret",
  ],
  { shell: true, stdio: ["ignore", "pipe", "pipe"] }
);

let output = "";

stripeListen.stdout.on("data", (chunk) => {
  output += chunk.toString();
});

stripeListen.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

stripeListen.on("close", (code) => {
  const match =
    output.match(/whsec_[a-zA-Z0-9]+/) ??
    output.match(/webhook signing secret is (whsec_[a-zA-Z0-9]+)/);

  if (!match) {
    console.error("Could not read webhook secret from stripe listen output.");
    console.error(output.slice(0, 500));
    process.exit(code ?? 1);
  }

  const secret = match[1] ?? match[0];
  const envPath = resolve(process.cwd(), ".env.local");
  let content = readFileSync(envPath, "utf8");

  content = content.replace(
    /^STRIPE_WEBHOOK_SECRET=.*/m,
    `STRIPE_WEBHOOK_SECRET="${secret}"`
  );

  writeFileSync(envPath, content, "utf8");
  console.log("STRIPE_WEBHOOK_SECRET updated in .env.local");
  console.log("Restart npm run dev, then run: npm run stripe:listen");
});

setTimeout(() => {
  stripeListen.kill();
}, 15000);
