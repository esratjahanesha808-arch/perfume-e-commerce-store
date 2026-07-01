# LUXORA — Architecture Decisions Log

## Decision Format
Each decision is logged with: ID, Date, Decision, Rationale, Alternatives Considered, Status.

---

## ADR-001: Frontend Framework — Next.js 16 (App Router)
- **Date:** 2026-06-17
- **Decision:** Use Next.js 16 with App Router
- **Rationale:** Industry-standard for production e-commerce. Hybrid rendering (SSG/ISR/SSR), React Server Components (React 19), largest ecosystem and hiring pool.
- **Alternatives Rejected:** Remix (smaller ecosystem), Nuxt 3 (Vue), SvelteKit (immature e-commerce)
- **Status:** ✅ Approved

## ADR-002: Styling — Tailwind CSS v4 (Custom UI Components)
- **Date:** 2026-06-17
- **Decision:** Use Tailwind CSS v4 and build custom UI components from scratch
- **Rationale:** Utility-first CSS for pixel-perfect luxury designs. Custom components are built from scratch using Tailwind CSS v4 utilities for full design control and zero-runtime CSS.
- **Alternatives Rejected:** Vanilla CSS (slower dev), Chakra UI (opinionated), Styled Components (runtime CSS-in-JS)
- **Status:** ✅ Approved

## ADR-003: Backend — Next.js API Routes + Server Actions
- **Date:** 2026-06-17
- **Decision:** Monolith-first with Next.js API Routes and Server Actions
- **Rationale:** Full-stack TypeScript, shared Prisma types, single deployment. AI microservice (FastAPI) deferred until post-launch.
- **Alternatives Rejected:** Express/Fastify (unnecessary separation), NestJS (too heavy), tRPC (adds abstraction)
- **Status:** ✅ Approved

## ADR-004: Database — PostgreSQL 16 via Neon (Free Tier)
- **Date:** 2026-06-17
- **Decision:** Use PostgreSQL 16 on Neon serverless — Free tier (0.5 GB, 1 project)
- **Rationale:** ACID transactions for payments/inventory. JSONB for flexible attributes. Free tier sufficient for MVP. Upgrade to Pro ($19/month) only when storage exceeds 0.5 GB.
- **Alternatives Rejected:** MongoDB (poor for transactions), Supabase (ecosystem lock-in), PlanetScale (MySQL)
- **Status:** ✅ Approved

## ADR-005: ORM — Prisma v7
- **Date:** 2026-06-17
- **Decision:** Use Prisma ORM v7
- **Rationale:** Best DX for TypeScript + PostgreSQL. Schema-first, auto-generated types, declarative migrations, Prisma Studio. Prisma v7 introduces native support for Neon serverless drivers and optimized connection pooling.
- **Alternatives Rejected:** Drizzle (less mature tooling), TypeORM (less type-safe)
- **Status:** ✅ Approved

## ADR-006: Authentication — Auth.js v5
- **Date:** 2026-06-17
- **Decision:** Use Auth.js v5 (NextAuth.js) — Free, full data ownership
- **Rationale:** No per-MAU costs. Full data control for cart merging, custom user models. Battle-tested in Next.js ecosystem.
- **Alternatives Rejected:** Clerk ($25+/month + per-MAU), Better Auth (younger community), Supabase Auth (ecosystem lock-in)
- **Status:** ✅ Approved

## ADR-007: State Management — Zustand + TanStack Query
- **Date:** 2026-06-17
- **Decision:** Zustand for client state, TanStack Query for server state
- **Rationale:** Separation of concerns. Both free and tiny. Zustand persist middleware for cart.
- **Alternatives Rejected:** Redux Toolkit (too much boilerplate), Jotai (overkill)
- **Status:** ✅ Approved

## ADR-008: Payments — Stripe (Pay-per-transaction, no monthly fee)
- **Date:** 2026-06-17
- **Decision:** Use Stripe with Embedded Checkout — $0/month base, 2.9% + 30¢ per transaction
- **Rationale:** Best DX. Embedded Checkout keeps users on-domain. Webhook-driven. No monthly fee aligns with MVP budget.
- **Alternatives Rejected:** PayPal (worse DX), Square (weaker online APIs)
- **Status:** ✅ Approved

## ADR-009: Image Storage — Cloudinary (Free Tier)
- **Date:** 2026-06-17
- **Decision:** Cloudinary Free tier (25 credits/month). Upgrade to Plus ($89/month) only if needed.
- **Rationale:** Auto format conversion (WebP/AVIF), responsive transforms, CDN delivery. Free tier sufficient for MVP catalog.
- **Alternatives Rejected:** AWS S3 (no optimization), Uploadthing (no transforms)
- **Status:** ✅ Approved

## ADR-010: Hosting — Vercel (Hobby → Pro at launch)
- **Date:** 2026-06-17
- **Decision:** Vercel Hobby (free) during development. Upgrade to Pro ($20/month) at production launch.
- **Rationale:** Purpose-built for Next.js. Zero-config. $20/month is the only mandatory paid service for production.
- **Alternatives Rejected:** Railway ($5+ base), AWS (needs DevOps)
- **Status:** ✅ Approved

## ADR-011: Caching — Upstash Redis (Free Tier)
- **Date:** 2026-06-17
- **Decision:** Upstash Redis Free tier (10K commands/day)
- **Rationale:** Serverless, works at Vercel Edge, pay-per-request after free limit. Rate limiting, cart cache, inventory locks.
- **Status:** ✅ Approved

## ADR-012: Search — Meilisearch Cloud (Free Tier)
- **Date:** 2026-06-17
- **Decision:** Meilisearch Cloud Free tier (100K documents)
- **Rationale:** Instant typo-tolerant search. Faceted filtering. Best DX. Free tier covers MVP catalog.
- **Alternatives Rejected:** Algolia ($1+/1K searches), PostgreSQL FTS (limited)
- **Status:** ✅ Approved

## ADR-013: Analytics — Vercel Analytics + PostHog (Free Tiers)
- **Date:** 2026-06-17
- **Decision:** Both on free tiers. Vercel Analytics for CWV. PostHog for product analytics.
- **Status:** ✅ Approved

## ADR-014: Email — Resend (Free Tier)
- **Date:** 2026-06-17
- **Decision:** Resend Free tier (100 emails/day, 3K/month)
- **Rationale:** Modern email API with React Email templates. Free tier sufficient for MVP transactional emails (order confirmation, password reset, shipping notifications).
- **Alternatives Rejected:** SendGrid (worse DX), Mailgun (no free tier)
- **Status:** ✅ Approved

## ADR-015: MVP Budget Strategy — $0–$30/month
- **Date:** 2026-06-17
- **Decision:** Use all free tiers during development ($0/month). Only mandatory paid service at launch: Vercel Pro ($20/month). Total production: $20/month.
- **Rationale:** User requirement to keep MVP infra under $30/month. All selected services have generous free tiers. Upgrade path clear for each service when limits are hit.
- **Status:** ✅ Approved

## ADR-016: AI Features — Deferred Post-Launch
- **Date:** 2026-06-17
- **Decision:** All AI features (recommendation engine, chatbot, personalization, BI dashboard) are deferred until after the full platform is deployed and hosted.
- **Rationale:** Focus on core e-commerce functionality first. AI features add complexity and cost (Python FastAPI microservice, AI API calls). Will be added as Phase 16+ after production validation.
- **Impact:** No FastAPI service setup needed now. Architecture is designed to accommodate it later without refactoring.
- **Status:** ✅ Approved

## ADR-017: Database Design — Separate Inventory Table
- **Date:** 2026-06-17
- **Decision:** Separate inventory table from products
- **Rationale:** Inventory is write-heavy (decremented on every purchase). Products are read-heavy. Avoids row locking conflicts.
- **Status:** ✅ Approved

## ADR-018: Order Items — Snapshot Pattern
- **Date:** 2026-06-17
- **Decision:** Snapshot product name, price, and image in order_items
- **Rationale:** Order history must reflect exact state at time of purchase. Product data changes over time.
- **Status:** ✅ Approved

## ADR-019: Brand Name — Luxora
- **Date:** 2026-06-17
- **Decision:** Project brand name is "Luxora"
- **Rationale:** User-confirmed brand name. Used across all UI, documentation, and order numbers (LUX-YYYYMMDD-XXX).
- **Status:** ✅ Approved

## ADR-020: Product Details Page Implementation
- **Date:** 2026-06-18
- **Decision:** Implement a premium, pixel-perfect Product Details Page matching the design specification.
- **Rationale:** Recreated the immersive customer-facing product detail page with vertical thumbnails, size/quantity selectors, trust badges, and tabbed details (Description, Notes, Ingredients, Shipping & Returns) to provide a visually indistinguishable luxury experience.
- **Status:** ✅ Approved

## ADR-021: Canonical Page Container — site-container / SiteContainer
- **Date:** 2026-06-18
- **Decision:** All storefront pages MUST use `.site-container` (CSS) or `<SiteContainer>` (React). Ad-hoc Tailwind `max-w-[…] mx-auto` is forbidden for page-level layout.
- **Rationale:** Product PDP was left-aligned because it used a one-off 1200px Tailwind container instead of the shared 1440px `site-container` used by Header/Footer/Homepage/Shop. Inconsistent patterns cause recurring layout bugs.
- **Status:** ✅ Approved

---

## ADR-022: User Loyalty Points + Notification Prefs in DB
- **Date:** 2026-06-29
- **Decision:** Store `loyalty_points` (Int) and `notification_prefs` (JSON) on `users`. Points increment on Stripe payment fulfillment; existing users backfilled from order totals on first dashboard read.
- **Rationale:** Dashboard loyalty tier and notification settings must persist across devices/sessions; localStorage-only prefs were not production-ready.
- **Status:** ✅ Approved

## ADR-023: Edge Auth Session Must Expose Role for Admin Proxy
- **Date:** 2026-06-29
- **Decision:** Add edge-safe `jwt` + `session` callbacks to `auth.config.ts` so `session.user.role` is available in `proxy.ts` admin guard.
- **Rationale:** Proxy uses `NextAuth(authConfig)` only; without session callback, JWT had `role` but middleware session did not — all `/admin` requests redirected to `/`.
- **Status:** ✅ Approved

## Last Updated
2026-06-29
