const REQUIRED_IN_PRODUCTION = ["DATABASE_URL", "AUTH_SECRET"] as const;

const RECOMMENDED_IN_PRODUCTION = [
  "NEXT_PUBLIC_APP_URL",
  "AUTH_URL",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const;

function hasPublicAppUrl() {
  return Boolean(
    process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.VERCEL_URL?.trim()
  );
}

export function getProductionEnvIssues() {
  const missingRequired = REQUIRED_IN_PRODUCTION.filter(
    (key) => !process.env[key]?.trim()
  ) as string[];

  if (!hasPublicAppUrl()) {
    missingRequired.push("NEXT_PUBLIC_APP_URL");
  }

  const missingRecommended = RECOMMENDED_IN_PRODUCTION.filter((key) => {
    if (key === "NEXT_PUBLIC_APP_URL" || key === "AUTH_URL") return false;
    return !process.env[key]?.trim();
  });

  return { missingRequired, missingRecommended };
}

export function assertProductionEnv() {
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { missingRequired } = getProductionEnvIssues();
  if (missingRequired.length === 0) return;

  throw new Error(
    `Missing required production environment variables: ${missingRequired.join(", ")}`
  );
}

export function getAppOrigin() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

export function getServerActionAllowedOrigins() {
  const origins = new Set<string>(["localhost:3000"]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    try {
      origins.add(new URL(appUrl).host);
    } catch {
      // ignore invalid URL
    }
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    origins.add(vercelUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""));
  }

  return [...origins];
}
