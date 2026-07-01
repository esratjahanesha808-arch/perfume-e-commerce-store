# LUXORA — Backend State

## Overview
- **Runtime:** Next.js API Routes + Server Actions (Next.js 16.2.9)
- **Language:** TypeScript (strict mode)
- **ORM:** Prisma v7.8.0
- **Database:** PostgreSQL 16 (Neon)
- **Cache:** Upstash Redis
- **Status:** Phase 15 — Deployment (Free portfolio stack ready)

## Architecture Pattern
```
Client Request
  → Edge Middleware (auth/geo check)
    → API Route / Server Action
      → Service Layer (business logic)
        → Prisma ORM → PostgreSQL
        → Upstash Redis (cache)
        → External APIs (Stripe, Cloudinary, etc.)
```

## Service Layer Design

### Services (src/services/)
| Service | Responsibility |
|---|---|
| product.service.ts | Product CRUD, search sync, featured logic |
| order.service.ts | Order creation, status management, refunds |
| cart.service.ts | Cart CRUD, merge, validation |
| user.service.ts | Profile management, address CRUD |
| coupon.service.ts | Coupon validation, admin CRUD, usage tracking, checkout discount calc |
| review.service.ts | Verified-buyer review submit, helpful votes, admin moderation, product rating recalc |
| review.service.ts | Review CRUD, moderation, rating calculation |
| wishlist.service.ts | Wishlist CRUD, move-to-cart |
| inventory.service.ts | Stock management, reservation, alerts |
| payment.service.ts | Stripe session creation, webhook processing |
| search.service.ts | Meilisearch indexing and querying |
| email.service.ts | Transactional email via Resend |

## API Route Summary

### Public APIs (No Auth Required)
- Products listing, detail, search, featured
- Categories and brands listing
- Auth (register, login, OAuth, password reset)

### Protected APIs (Auth Required)
- Cart CRUD and merge
- Wishlist CRUD
- Order history and creation
- Checkout session creation
- Review submission
- Profile and address management
- Coupon validation

### Admin APIs (Admin Role Required)
- Dashboard analytics
- Product/Category/Brand CRUD
- Order management and status updates
- Inventory management
- Coupon CRUD
- Review moderation
- Customer management
- Data export

## External Integrations

### Stripe
- **SDK:** stripe (Node.js), @stripe/stripe-js (client)
- **Pattern:** Embedded Checkout
- **Webhooks:** checkout.session.completed, payment_intent.succeeded, charge.refunded
- **Config:** src/lib/stripe.ts (singleton)

### Cloudinary
- **SDK:** cloudinary (Node.js)
- **Usage:** Product image upload, transformation, deletion
- **Config:** src/lib/cloudinary.ts
- **Transforms:** Auto format (WebP/AVIF), auto quality, responsive widths

### Meilisearch
- **SDK:** meilisearch (JS client)
- **Index:** products (name, description, brand, category, scent_notes, price)
- **Sync:** On product create/update/delete via service layer
- **Config:** src/lib/meilisearch.ts

### Upstash Redis
- **SDK:** @upstash/redis, @upstash/ratelimit
- **Usage:**
  - API response caching (product listings)
  - Rate limiting (auth endpoints, API routes)
  - Inventory locks during checkout
  - Session caching
- **Config:** src/lib/redis.ts

### Resend (Email)
- **SDK:** resend
- **Templates:** Order confirmation, password reset, email verification, shipping notification
- **Config:** src/lib/email.ts

### Auth.js v5
- **Config:** src/lib/auth.ts, src/lib/auth.config.ts
- **Adapter:** Prisma adapter
- **Providers:** Credentials, Google OAuth
- **Callbacks:** session, jwt (add role to token)

## Middleware (src/middleware.ts)
```
1. Auth check (redirect to /login if protected route)
2. Admin role check (redirect to / if not admin for /admin routes)
3. Rate limiting (via Upstash)
```

## Validation (Zod Schemas)
- src/lib/validations/auth.ts (register, login, password reset)
- src/lib/validations/product.ts (create, update)
- src/lib/validations/order.ts (create, status update)
- src/lib/validations/coupon.ts (create, validate)
- src/lib/validations/review.ts (create, update)
- src/lib/validations/address.ts (create, update)

## Environment Variables Required
```
# Database
DATABASE_URL=

# Auth.js
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Meilisearch
MEILISEARCH_HOST=
MEILISEARCH_API_KEY=

# Resend
RESEND_API_KEY=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=

# Sentry
SENTRY_DSN=
```

## Build Status
- [x] API Routes scaffolded (auth: register, forgot-password, reset-password, verify-email)
- [x] Service layer created (auth.service.ts)
- [x] Prisma client singleton configured (src/lib/prisma.ts)
- [x] External service clients initialized (redis.ts, email.ts, utils.ts)
- [x] Proxy configured (src/proxy.ts — Next.js 16 equivalent of middleware)
- [x] Zod validation schemas defined (auth.ts)
- [x] Environment variables documented (.env.example + .env.local)
- [x] Auth.js v5 configured (auth.ts + auth.config.ts)
- [x] All auth UI pages (login, register, forgot-password, reset-password, verify-email)
- [x] Auth.js route handler (/api/auth/[...nextauth])
- [x] TypeScript type augmentation for session/JWT
- [x] Root layout with Inter + Playfair fonts, SEO metadata, Sonner toaster
- [x] Design system (globals.css with black/gold tokens, glass effects, animations)
- [x] **Phase 3**: Homepage built with fully responsive layout systems (Hero, Marquee, Shop by Brands, Best Sellers, Benefits)
- [x] **Phase 3**: Custom header and footer components with responsive navigation and newsletter
- [x] **Phase 3**: Public API endpoints for brands, categories, products (featured, new arrivals), and newsletter subscription
- [x] **Database Setup**: Neon PostgreSQL configured and Prisma migration complete (18 tables created)
- [x] **Database Seed**: Sample catalog seeded (6 products, brands, categories, inventory, images)
- [x] **Add Product Script**: `scripts/add-product.ts` for adding products without wiping data
- [x] **Bulk Import Script**: `scripts/bulk-add-products.ts` — 8 products from image batch
- [x] **Product listing API**: `GET /api/v1/products` — shop + homepage use real DB slugs
- [x] **Frontend DB wiring**: Homepage (`getFeaturedProducts`) + Shop (`getAllProducts` + `getActiveBrands`) via server components
- [x] **brand.service.ts**: Active brands query with Redis cache
- [x] **wishlist.service.ts**: getUserWishlist, add/remove, product ID lookup
- [x] **Wishlist API**: `GET/POST/DELETE /api/v1/wishlist`, `DELETE /api/v1/wishlist/:productId`
- [x] **cart.service.ts**: getUserCart, add/update/remove, clear, mergeGuestCart, inventory stock flag
- [x] **Cart API**: `GET/DELETE/POST /api/v1/cart` (merge), `POST /api/v1/cart/items`, `PUT/DELETE /api/v1/cart/items/[productId]`
- [x] **cart validations**: `src/lib/validations/cart.ts`
- [x] Google OAuth optional — provider + login button only when `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` set
- [x] Auth registration — skips Upstash/Resend when placeholders; auto-verifies in dev; normalizes email; auto sign-in after register; clear duplicate-email errors; Neon retry

## Phase 2 Files Created
- `src/lib/prisma.ts` — Prisma v7 singleton
- `src/lib/redis.ts` — Upstash Redis + rate limiters
- `src/lib/email.ts` — Resend email service
- `src/lib/utils.ts` — cn, formatPrice, slugify, generateOrderNumber
- `src/lib/auth.ts` — Auth.js full config (Prisma adapter, JWT, Credentials + Google)
- `src/lib/auth.config.ts` — Edge-compatible config for proxy
- `src/lib/validations/auth.ts` — Zod schemas for all auth forms
- `src/services/auth.service.ts` — Register, verify email, forgot/reset password
- `src/proxy.ts` — Route protection (Next.js 16 middleware equivalent)
- `src/types/next-auth.d.ts` — TypeScript module augmentation
- `src/app/api/auth/[...nextauth]/route.ts` — Auth.js handler
- `src/app/api/v1/auth/register/route.ts`
- `src/app/api/v1/auth/forgot-password/route.ts`
- `src/app/api/v1/auth/reset-password/route.ts`
- `src/app/api/v1/auth/verify-email/route.ts`
- `src/app/(auth)/layout.tsx` — Auth layout with gold orbs
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`
- `src/app/(auth)/verify-email/page.tsx`
- `prisma/schema.prisma` — Full 18-table schema
- `prisma.config.ts` — Prisma v7 connection config
- `.env.example` — All env vars documented
- `.env.local` — Local dev environment (gitignored)

- [x] **checkout.service.ts**: pending order creation (cart kept until payment)
- [x] **payment.service.ts**: Stripe embedded session, webhook fulfillment, inventory decrement, cart clear, idempotency
- [x] **Stripe API**: `POST /api/v1/checkout/session`, `GET /api/v1/checkout/session/[sessionId]`, `POST /api/v1/webhooks/stripe`
- [x] **email.ts**: order confirmation email via Resend
- [x] **src/lib/stripe.ts**: Stripe singleton + config guard

- [x] **order.service.ts**: paginated user orders, order detail with items/address/payment
- [x] **user.service.ts**: profile, password change, address CRUD, loyalty points resolve/backfill, notification prefs CRUD
- [x] **User APIs**: profile, password, addresses, notifications (`GET/PUT /api/v1/users/notifications`), orders list/detail
- [x] **validations/user.ts**: profile, password, address, notification prefs schemas
- [x] **payment.service.ts**: increments `users.loyalty_points` on successful payment fulfillment
- [x] **wishlist.service.ts**: includes inventory for live stock status on wishlist rows
- [x] **admin.service.ts**: KPI aggregations, sales chart, recent orders, top products/customers, category breakdown, notification count
- [x] **requireAdmin()** in `api-auth.ts`
- [x] **Admin API**: `GET /api/v1/admin/dashboard` (date-range query params)
- [x] **order.service.ts**: admin list/detail, status updates with customer email, CSV export
- [x] **inventory.service.ts**: admin inventory list, low stock count, stock adjustment + audit log
- [x] **Admin APIs**: orders list/export/detail/status, inventory list/adjust, products list/update, collections list/update
- [x] **email.ts**: order status update notification email
- [x] **validations**: `order.ts`, `inventory.ts`
- [x] **DB**: `inventory_logs` table + `InventoryChangeType` enum (migration `20260629093028_add_inventory_logs`)
- [x] **coupon.service.ts**: validate, compute discount (PERCENTAGE / FIXED_AMOUNT / FREE_SHIPPING), admin CRUD, usage stats, record usage on payment
- [x] **Coupon APIs**: `POST /api/v1/coupons/validate`, `GET/POST /api/v1/admin/coupons`, `PUT/DELETE /api/v1/admin/coupons/[id]`, `GET /api/v1/admin/coupons/[id]/usage`
- [x] **validations/coupon.ts**: admin list/create/update + checkout validate schemas
- [x] **checkout.service.ts**: optional `couponCode` on order creation; discount + couponId persisted
- [x] **payment.service.ts**: proportional Stripe line-item discount; coupon usage recorded on fulfillment
- [x] **review.service.ts**: verified purchase check, create/moderate/delete reviews, helpful votes, product rating recalc
- [x] **Review APIs**: `POST /api/v1/reviews`, `POST /api/v1/reviews/[id]/helpful`, `GET /api/v1/admin/reviews`, `PATCH/DELETE /api/v1/admin/reviews/[id]`
- [x] **validations/review.ts** + **sanitize-text.ts**
- [x] **Phase 15 deploy prep**: `sitemap.ts`, `robots.ts`, security headers in `next.config.ts`, `lib/env.ts`, `instrumentation.ts`, free deploy workflow

## Last Updated
2026-07-01 — Phase 15 free portfolio deployment config
