import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { getServerActionAllowedOrigins } from "./src/lib/env";

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
      hideSourceMaps: true,
      disableLogger: true,
    })
  : nextConfig;
