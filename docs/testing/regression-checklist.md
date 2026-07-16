# LUXORA — Master Regression Checklist

Last Updated: 2026-07-16

Status legend: Pass | Fail | Pending

## Phase 1 — Architecture & Planning
- Checklist item: `/api/health` responds with service status
  - Status: Pass
  - Evidence: Runtime check `curl --max-time 20 http://localhost:3000/api/health` returned `{"status":"ok"}` with `200` (2026-07-16).
  - Notes: `ISSUE-003` Fixed.
- Checklist item: `npm run build` succeeds
  - Status: Pass
  - Evidence: `npm run build` completed successfully (2026-07-16).
  - Notes: Build success alone does not clear production gate.

## Phase 2 — Database Design
- Checklist item: Prisma migration state is clean
  - Status: Pass
  - Evidence: `npx prisma migrate status` reported "Database schema is up to date" after `20260716120000_coupon_usage_fk_and_check_constraints`
  - Notes: FK + critical CHECK constraints deployed (`ISSUE-011`, `ISSUE-012` Fixed).
- Checklist item: Referential integrity on coupon usage records
  - Status: Pass
  - Evidence: `coupon_usages_order_id_fkey` present; `npx prisma migrate deploy` succeeded (2026-07-16)
  - Notes: Orphan coupon usage rows no longer possible.

## Phase 3 — Backend
- Checklist item: Protected routes reject unauthenticated requests
  - Status: Pass
  - Evidence: `/api/v1/cart -> 401`, `/api/v1/admin/dashboard -> 401`
  - Notes: Base auth guard works.
- Checklist item: Sensitive debug routes blocked in production
  - Status: Pass
  - Evidence: `/api/test-db` route removed; no handler on disk (2026-07-16)
  - Notes: `ISSUE-001` Fixed.
- Checklist item: Helpful vote route requires authenticated user
  - Status: Pass
  - Evidence: `requireAuth()` + rate limit + once-key dedupe on `POST .../helpful`
  - Notes: `ISSUE-002` Fixed; unauth 401, repeat 409, burst 429.
- Checklist item: Critical write/auth/admin endpoints rate-limited
  - Status: Pass
  - Evidence: Shared `enforceRateLimit` on auth, reviews, checkout, coupon validate, admin writes
  - Notes: In-memory fallback when Upstash unset.

## Phase 4 — Frontend
- Checklist item: Frontend lint gate passes
  - Status: Pass
  - Evidence: `npm run lint` exits 0 with 0 errors (13 warnings). Re-verified 2026-07-16.
  - Notes: `ISSUE-004` Fixed.
- Checklist item: Core routes render and navigate
  - Status: Pass
  - Evidence: Build route manifest includes storefront/auth/dashboard/admin pages
  - Notes: Functional depth still needs automated regression coverage.

## Phase 5 — Core Features
- Checklist item: Products API and featured products API respond successfully
  - Status: Pass
  - Evidence: `/api/v1/products -> 200`, `/api/v1/products/featured -> 200`
  - Notes: Baseline product feature works.
- Checklist item: Planned backend search endpoint exists
  - Status: Pass
  - Evidence: Runtime check `curl --max-time 20 http://localhost:3000/api/v1/products/search?q=rose` returned `200` with `meta.source = "db"` (2026-07-16).
  - Notes: `ISSUE-007` Fixed (portfolio mode uses DB search fallback).

## Phase 6 — Integrations
- Checklist item: Stripe checkout flow endpoints available
  - Status: Pass
  - Evidence: Build includes checkout session + webhook routes
  - Notes: Webhook signature verification is implemented.
- Checklist item: Cloudinary and Meilisearch integration modules available
  - Status: Pass (portfolio mode)
  - Evidence: `src/lib/cloudinary.ts` and `src/lib/meilisearch.ts` present as safe stubs; admin upload/search-sync routes fail closed with 503 where applicable.
  - Notes: `ISSUE-007` Fixed (DB search endpoint); `ISSUE-008` de-scoped by decision.
- Checklist item: Monitoring integration active
  - Status: Pass (partial)
  - Evidence: `sentry.client.config.ts` / `sentry.server.config.ts` + `src/instrumentation.ts` and `PostHogProvider` are wired; activation is env-gated.
  - Notes: `ISSUE-009` Fixed.

## Phase 7 — Admin Dashboard
- Checklist item: Existing admin modules (orders/inventory/products/coupons/reviews) are reachable
  - Status: Pass
  - Evidence: Routes present in build manifest
  - Notes: Base admin functionality works.
- Checklist item: Required admin modules (users/categories/brands/customers/reports/settings) implemented
  - Status: Pass
  - Evidence: No `AdminComingSoon` usage found in `src/app/admin`; required modules now render implemented pages.
  - Notes: `ISSUE-006` Fixed.

## Phase 8 — QA
- Checklist item: Automated test command exists
  - Status: Pass
  - Evidence: `npm run test:e2e` and `npm run test:a11y` both passed after targeted `/shop` a11y labeling fix (2026-07-16).
  - Notes: `ISSUE-010` Fixed. Requires running server — `npm run build && npm start` then `npm test`.
- Checklist item: Hook lint warnings eliminated
  - Status: Pass
  - Evidence: `useMemo` with missing deps in `CheckoutPageClient.tsx` removed; lint gate remains at 0 errors in current run (2026-07-16).
- Checklist item: Critical accessibility violations on `/shop` resolved
  - Status: Pass
  - Evidence: Added accessible names to sort `<select>` and price-range `<input type="range">`; Playwright a11y suite now passes critical gate on `/shop` (2026-07-16).
  - Notes: Serious color-contrast findings remain logged but are non-critical in current gate.
- Checklist item: Security critical/high issues resolved before retest
  - Status: Pass
  - Evidence: `ISSUE-001`, `ISSUE-002`, `ISSUE-003`, `ISSUE-005`, `ISSUE-006`, `ISSUE-007` all marked Fixed in tracker.
  - Notes: No open Critical/High issues remain.

## Phase 9 — Deployment
- Checklist item: Security headers present
  - Status: Pass (partial)
  - Evidence: Runtime header check `curl -I http://localhost:3000/` returns XFO, XCTO, Referrer-Policy, Permissions-Policy, HSTS, and `Content-Security-Policy` (2026-07-16).
  - Notes: Baseline hardening configured in global headers middleware.
- Checklist item: Content Security Policy header present
  - Status: Pass
  - Evidence: `Content-Security-Policy` added to `next.config.ts` `securityHeaders`; `npm run build` passes (2026-07-16)
  - Notes: `ISSUE-005` Fixed.
- Checklist item: `robots.txt` and `sitemap.xml` served
  - Status: Pass
  - Evidence: `/robots.txt -> 200`, `/sitemap.xml -> 200`
  - Notes: SEO artifacts are correctly wired.
- Checklist item: Release go/no-go decision recorded
  - Status: Pass
  - Evidence: Go decision documented with no open Critical/High issues; non-critical contrast findings moved to post-launch backlog (2026-07-16).
  - Notes: Optional monitoring/rate-limit env activation planning deferred by request; not treated as a current release blocker.
- Checklist item: Deployment handoff checklist fully synchronized
  - Status: Pass
  - Evidence: `handoff.md`, `qa-report.md`, `open-issues.md`, and `regression-checklist.md` all reflect GO state with 0 open Critical/High issues (2026-07-16).
  - Notes: Remaining work is explicitly post-launch/non-blocking.
