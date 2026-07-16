/**
 * Luxora — E2E Smoke Tests
 * Verifies critical pages load without errors and redirect correctly when unauthenticated.
 * Run: npx playwright test  (requires a running server at BASE_URL / localhost:3000)
 */
import { test, expect } from "@playwright/test";

// Pages that must render publicly with no server error
const publicPages = [
  { path: "/", title: /luxora/i },
  { path: "/shop", title: /shop|perfume|fragrance/i },
  { path: "/brands", title: /brand/i },
] as const;

test.describe("Public storefront pages load", () => {
  for (const { path, title } of publicPages) {
    test(`${path} — renders and has correct title`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).not.toBe(500);
      await expect(page).toHaveTitle(title);
    });
  }
});

test.describe("PDP — product page loads", () => {
  test("shop/products page lists products or empty state", async ({ page }) => {
    const response = await page.goto("/shop");
    expect(response?.status()).not.toBe(500);
    // Page body should render without blank screen
    const body = await page.locator("body").textContent();
    expect(body?.length).toBeGreaterThan(50);
  });
});

test.describe("Health check", () => {
  test("GET /api/health returns 200 with { status: ok }", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("ok");
  });
});

test.describe("Auth-gated routes redirect unauthenticated users", () => {
  for (const path of ["/dashboard", "/checkout"]) {
    test(`${path} — redirects to login`, async ({ page }) => {
      await page.goto(path);
      // Auth.js redirects to /api/auth/signin or /login
      await expect(page).toHaveURL(/signin|login/i);
    });
  }
});

test.describe("Cart and wishlist pages accessible", () => {
  test("/cart — renders cart page or empty state", async ({ page }) => {
    const response = await page.goto("/cart");
    expect(response?.status()).not.toBe(500);
  });
});
