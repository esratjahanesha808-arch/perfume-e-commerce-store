import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { getServerActionAllowedOrigins } from "./src/lib/env";

// Next.js App Router requires 'unsafe-inline' for hydration scripts.
// In development HMR also requires 'unsafe-eval'; excluded from production builds.
const isDev = process.env.NODE_ENV === "development";

const cspDirectives = [
  "default-src 'self'",
  // Next.js hydration + Stripe.js + PostHog snippet
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://js.stripe.com https://us.i.posthog.com`,
  // Tailwind utility classes and framer-motion generate inline styles
  "style-src 'self' 'unsafe-inline'",
  // Product images: Cloudinary CDN, BigCommerce CDN, Google OAuth avatars, Next/Image blobs
  "img-src 'self' data: blob: https://res.cloudinary.com https://cdn11.bigcommerce.com https://lh3.googleusercontent.com",
  "font-src 'self'",
  // Stripe API calls, PostHog analytics, Sentry error ingestion
  "connect-src 'self' https://api.stripe.com https://us.i.posthog.com https://app.posthog.com https://*.ingest.sentry.io",
  // Stripe Embedded Checkout renders in an iframe served from js.stripe.com
  "frame-src https://js.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: cspDirectives,
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cdn11.bigcommerce.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: getServerActionAllowedOrigins(),
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

// Wrap with Sentry only when SENTRY_AUTH_TOKEN is present (source map uploads).
// When the token is absent the build proceeds exactly as before.
export default process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG ?? "",
      project: process.env.SENTRY_PROJECT ?? "luxora",
      silent: true,
      telemetry: false,
      disableLogger: true,
    })
  : nextConfig;
