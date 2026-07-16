import { defineConfig, devices } from "@playwright/test";

/**
 * Luxora — Playwright E2E + A11y smoke test config.
 * Run against the production build: `npm run build && npm start`
 * or a running dev server: `npm run dev`
 *
 * CI: set BASE_URL env var to override the default.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
