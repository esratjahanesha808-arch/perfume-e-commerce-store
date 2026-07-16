# LUXORA — Master Regression Checklist

Last Updated: 2026-07-16

Status legend: Pass | Fail | Pending

## Phase 1 — Architecture & Planning
- Checklist item: `/api/health` responds with service status
  - Status: Fail
  - Evidence: `GET /api/health -> 404`
  - Notes: Required checklist endpoint is missing (`ISSUE-003`).
- Checklist item: `npm run build` succeeds
  - Status: Pass
  - Evidence: Build completed successfully during audit
  - Notes: Build success alone does not clear production gate.

## Phase 2 — Database Design
- Checklist item: Prisma migration state is clean
  - Status: Pass
  - Evidence: `npx prisma migrate status` reported "Database schema is up to date"
  - Notes: Structural integrity gaps still open (`ISSUE-011`, `ISSUE-012`).
- Checklist item: Referential integrity on coupon usage records
  - Status: Fail
  - Evidence: Audit review found no FK from `coupon_usages.order_id` to `orders.id`
  - Notes: Add relation and migration.

## Phase 3 — Backend
- Checklist item: Protected routes reject unauthenticated requests
  - Status: Pass
  - Evidence: `/api/v1/cart -> 401`, `/api/v1/admin/dashboard -> 401`
  - Notes: Base auth guard works.
- Checklist item: Sensitive debug routes blocked in production
  - Status: Fail
  - Evidence: `/api/test-db -> 200` with business payload
  - Notes: Critical blocker (`ISSUE-001`).
- Checklist item: Helpful vote route requires authenticated user
  - Status: Fail
  - Evidence: Route handler has no `requireAuth()` call
  - Notes: High-risk abuse vector (`ISSUE-002`).

## Phase 4 — Frontend
- Checklist item: Frontend lint gate passes
  - Status: Fail
  - Evidence: `npm run lint` returned 16 errors, 11 warnings
  - Notes: Blocking quality issue (`ISSUE-004`).
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
  - Status: Fail
  - Evidence: No `/api/v1/products/search` route found
  - Notes: Requirement mismatch (`ISSUE-007`).

## Phase 6 — Integrations
- Checklist item: Stripe checkout flow endpoints available
  - Status: Pass
  - Evidence: Build includes checkout session + webhook routes
  - Notes: Webhook signature verification is implemented.
- Checklist item: Cloudinary and Meilisearch integration modules available
  - Status: Fail
  - Evidence: No `src/lib/cloudinary.ts`, no search service
  - Notes: Integration scope mismatch (`ISSUE-007`, `ISSUE-008`).
- Checklist item: Monitoring integration active
  - Status: Fail
  - Evidence: No effective Sentry/PostHog integration found in runtime code
  - Notes: Deployment observability gap (`ISSUE-009`).

## Phase 7 — Admin Dashboard
- Checklist item: Existing admin modules (orders/inventory/products/coupons/reviews) are reachable
  - Status: Pass
  - Evidence: Routes present in build manifest
  - Notes: Base admin functionality works.
- Checklist item: Required admin modules (users/categories/brands/customers/reports/settings) implemented
  - Status: Fail
  - Evidence: Pages render `AdminComingSoon`
  - Notes: Scope incomplete (`ISSUE-006`).

## Phase 8 — QA
- Checklist item: Automated test command exists
  - Status: Fail
  - Evidence: `npm run test` -> Missing script
  - Notes: Add test baseline (`ISSUE-010`).
- Checklist item: Security critical/high issues resolved before retest
  - Status: Pending
  - Evidence: Open issues list
  - Notes: Must resolve `ISSUE-001` and `ISSUE-002` first.

## Phase 9 — Deployment
- Checklist item: Security headers present
  - Status: Pass (partial)
  - Evidence: Response includes XFO, XCTO, Referrer-Policy, Permissions-Policy, HSTS
  - Notes: CSP still missing.
- Checklist item: Content Security Policy header present
  - Status: Fail
  - Evidence: No `Content-Security-Policy` in `curl -I /`
  - Notes: Deployment hardening blocker (`ISSUE-005`).
- Checklist item: `robots.txt` and `sitemap.xml` served
  - Status: Pass
  - Evidence: `/robots.txt -> 200`, `/sitemap.xml -> 200`
  - Notes: SEO artifacts are correctly wired.
