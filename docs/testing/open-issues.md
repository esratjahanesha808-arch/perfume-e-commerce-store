# LUXORA — Open Issues Tracker

Last Updated: 2026-07-16

## ISSUE-001
- Unique ID: ISSUE-001
- Phase: Phase 3 Backend / Phase 9 Deployment
- Priority: P0
- Severity: Critical
- Description: Public debug endpoint exposes sensitive operational data.
- Expected behavior: Internal/debug analytics endpoint is disabled in production or admin-protected.
- Actual behavior: `GET /api/test-db` returns KPI totals, order data, and customer-identifiable fields without auth.
- Suggested fix: Remove route from production, or gate with admin auth plus environment flag.
- Affected files: `luxora/src/app/api/test-db/route.ts`
- Status: Open

## ISSUE-002
- Unique ID: ISSUE-002
- Phase: Phase 3 Backend / Phase 5 Core Features
- Priority: P1
- Severity: High
- Description: Helpful-vote API does not require authentication.
- Expected behavior: Only authenticated users can vote helpful, with abuse controls.
- Actual behavior: `POST /api/v1/reviews/[id]/helpful` is publicly callable.
- Suggested fix: Add `requireAuth()` and anti-abuse protection (rate limit + dedupe strategy).
- Affected files: `luxora/src/app/api/v1/reviews/[id]/helpful/route.ts`, `luxora/src/services/review.service.ts`
- Status: Open

## ISSUE-003
- Unique ID: ISSUE-003
- Phase: Phase 1 Architecture & Planning
- Priority: P1
- Severity: High
- Description: Required health endpoint is missing.
- Expected behavior: `/api/health` returns `200` with `{ "status": "ok" }`.
- Actual behavior: `/api/health` returns `404`.
- Suggested fix: Implement a lightweight health route and include it in deployment checks.
- Affected files: `luxora/src/app/api/health/route.ts` (missing)
- Status: Open

## ISSUE-004
- Unique ID: ISSUE-004
- Phase: Phase 8 QA
- Priority: P1
- Severity: High
- Description: Lint quality gate fails.
- Expected behavior: `npm run lint` exits successfully with zero errors.
- Actual behavior: Lint run reports 16 errors and 11 warnings.
- Suggested fix: Resolve all lint errors, then enforce lint pass in release workflow.
- Affected files: Multiple (`src/app`, `src/components`, `src/services`, `prisma/seed.js`)
- Status: Open

## ISSUE-005
- Unique ID: ISSUE-005
- Phase: Phase 9 Deployment
- Priority: P1
- Severity: High
- Description: Content Security Policy header is not configured.
- Expected behavior: Response headers include robust CSP aligned to app asset requirements.
- Actual behavior: `curl -I /` does not include `Content-Security-Policy`.
- Suggested fix: Add CSP in `next.config.ts`, verify compatibility on key routes.
- Affected files: `luxora/next.config.ts`
- Status: Open

## ISSUE-006
- Unique ID: ISSUE-006
- Phase: Phase 7 Admin Dashboard
- Priority: P1
- Severity: High
- Description: Admin scope is incomplete for required modules.
- Expected behavior: User management, category/brand/customer management, reports, and settings are functional.
- Actual behavior: Multiple admin pages render `AdminComingSoon`.
- Suggested fix: Implement required pages/APIs or explicitly re-scope and update project requirements.
- Affected files: `luxora/src/app/admin/**`, `luxora/src/components/admin/AdminComingSoon.tsx`, missing API modules
- Status: Open

## ISSUE-007
- Unique ID: ISSUE-007
- Phase: Phase 6 Integrations / Phase 5 Core Features
- Priority: P1
- Severity: High
- Description: Search integration and endpoint are not implemented as documented.
- Expected behavior: Backend search endpoint and service (Meilisearch or equivalent) exist.
- Actual behavior: No `search.service.ts` and no `/api/v1/products/search` route.
- Suggested fix: Implement search backend flow or update scope/docs to deferred.
- Affected files: `luxora/src/services/` (missing search module), `luxora/src/app/api/v1/products/` (missing search route), docs
- Status: Open

## ISSUE-008
- Unique ID: ISSUE-008
- Phase: Phase 6 Integrations
- Priority: P2
- Severity: Medium
- Description: Cloudinary upload pipeline is documented but not implemented.
- Expected behavior: Cloudinary service/config and upload path exist if feature is in scope.
- Actual behavior: No `src/lib/cloudinary.ts` or backend upload route.
- Suggested fix: Implement Cloudinary flow or mark deferred in docs.
- Affected files: `luxora/src/lib/` (missing), integration docs
- Status: Open

## ISSUE-009
- Unique ID: ISSUE-009
- Phase: Phase 6 Integrations / Phase 9 Deployment
- Priority: P2
- Severity: Medium
- Description: Monitoring integrations are not implemented.
- Expected behavior: Runtime monitoring/error tracking integration exists (Sentry/PostHog as planned).
- Actual behavior: No effective Sentry/PostHog integration found in app code.
- Suggested fix: Add instrumentation and environment-based enablement, then validate event flow.
- Affected files: `luxora/src/instrumentation.ts`, monitoring setup files (missing/incomplete)
- Status: Open

## ISSUE-010
- Unique ID: ISSUE-010
- Phase: Phase 8 QA
- Priority: P2
- Severity: Medium
- Description: Automated test suite is missing.
- Expected behavior: Unit/integration/e2e test scripts exist and run in CI.
- Actual behavior: `npm run test` is missing.
- Suggested fix: Add baseline test stack and scripts (`test`, optional `test:e2e`).
- Affected files: `luxora/package.json`, new test directories
- Status: Open

## ISSUE-011
- Unique ID: ISSUE-011
- Phase: Phase 2 Database Design
- Priority: P2
- Severity: Medium
- Description: `coupon_usages.order_id` has no foreign key to `orders`.
- Expected behavior: Referential integrity between coupon usage and order records.
- Actual behavior: `order_id` exists without FK constraint.
- Suggested fix: Add relation in Prisma schema and migration with FK constraint.
- Affected files: `luxora/prisma/schema.prisma`, migration SQL
- Status: Open

## ISSUE-012
- Unique ID: ISSUE-012
- Phase: Phase 2 Database Design
- Priority: P3
- Severity: Low
- Description: Several numeric bounds are validated only at application layer.
- Expected behavior: Critical range constraints enforced at DB level where feasible.
- Actual behavior: No DB-level CHECK constraints for some documented rules.
- Suggested fix: Add targeted SQL check constraints for critical columns.
- Affected files: `luxora/prisma/schema.prisma`, migration SQL
- Status: Open

## ISSUE-013
- Unique ID: ISSUE-013
- Phase: Cross-phase Documentation
- Priority: P2
- Severity: Medium
- Description: Documentation conflicts with actual implementation state.
- Expected behavior: Memory and plan docs reflect implemented behavior and remaining scope.
- Actual behavior: Multiple docs claim completed integrations/features that are missing.
- Suggested fix: Maintain `docs/handoff.md` and issue tracker as canonical release truth; update memory docs accordingly.
- Affected files: `memory/*.md`, `implementation_plan.md`, `docs/testing/*.md`, `docs/handoff.md`
- Status: Open
