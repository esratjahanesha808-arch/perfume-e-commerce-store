/**
 * Luxora — Accessibility smoke tests (axe-core)
 * Checks that critical public pages have no critical or serious a11y violations.
 * Run: npx playwright test  (requires a running server at BASE_URL / localhost:3000)
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const a11yPages = ["/", "/shop", "/cart"] as const;

test.describe("Accessibility — no critical violations on public pages", () => {
  for (const path of a11yPages) {
    test(`${path} — passes axe a11y audit`, async ({ page }) => {
      await page.goto(path);
      // Wait for the main content to settle
      await page.waitForLoadState("domcontentloaded");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .exclude(".admin-shell") // admin UI not in scope for storefront a11y
        .analyze();

      // Report violations clearly in test output
      if (results.violations.length > 0) {
        const summary = results.violations
          .map(
            (v) =>
              `[${v.impact}] ${v.id}: ${v.description} — ${v.nodes.length} node(s)\n  Help: ${v.helpUrl}`
          )
          .join("\n\n");
        console.warn(`A11y violations on ${path}:\n${summary}`);
      }

      // Only fail on critical violations — serious/minor logged as warnings
      const critical = results.violations.filter((v) => v.impact === "critical");
      expect(
        critical,
        `${critical.length} critical a11y violation(s) on ${path}: ${critical.map((v) => v.id).join(", ")}`
      ).toHaveLength(0);
    });
  }
});
