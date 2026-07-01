# LUXORA — Project Context

## Project Overview
- **Name:** Luxora (Luxury Perfume E-Commerce Platform)
- **Type:** Full-stack e-commerce web application with admin dashboard
- **Target Audience:** Premium perfume consumers
- **Design Theme:** Luxury black and gold, dark mode primary
- **Status:** Phase 15 — Deployment (Portfolio $0 stack — ready to deploy)

## Business Goals
1. Premium luxury shopping experience
2. Fast-loading, mobile-first responsive design
3. SEO-optimized for organic discovery
4. Secure authentication and payment processing
5. Comprehensive admin dashboard for business operations
6. Scalable architecture for future AI features (deferred)

## MVP Budget Target
- **Maximum:** $30/month
- **Preferred:** $0–$15/month
- **Portfolio deployment:** **$0/month** (Vercel Hobby + Neon/Upstash/Cloudinary/Resend free tiers; Stripe test mode)
- **Strategy:** Free tiers everywhere, upgrade only at scale
- **Development Phase:** $0/month (all free tiers)
- **Production Launch:** ~$20/month (Vercel Pro only)
- **Growth Phase:** ~$60-90/month (add Neon Pro + Cloudinary Plus as needed)
- **AI Features:** Deferred until after full deployment and hosting

## Technology Stack (Approved)

| Category | Technology | Version | Tier | Cost |
|---|---|---|---|---|
| Frontend | Next.js (App Router) | 16.2.9 | Open Source | $0 |
| Styling | Tailwind CSS (Custom UI) | v4 | Open Source | $0 |
| Backend | Next.js API Routes + Server Actions | 16.2.9 | Open Source | $0 |
| Database | PostgreSQL (Neon) | 16 | Free (0.5 GB) | $0 |
| ORM | Prisma | v7.8.0 | Open Source | $0 |
| Auth | Auth.js (NextAuth.js) | v5 | Open Source | $0 |
| State (Client) | Zustand | Latest | Open Source | $0 |
| State (Server) | TanStack Query | v5 | Planned | $0 |
| Payments | Stripe (Embedded Checkout) | Latest | Pay-per-txn | $0 base |
| Images | Cloudinary | — | Free (25 credits) | $0 |
| Hosting | Vercel | — | Hobby → Pro | $0 → $20 |
| Cache | Upstash Redis | — | Free (10K cmd/day) | $0 |
| Search | Meilisearch Cloud | — | Free (100K docs) | $0 |
| Analytics | Vercel Analytics + PostHog | — | Free tiers | $0 |
| Email | Resend | — | Free (3K/month) | $0 |
| Error Monitoring | Sentry | — | Free (5K events) | $0 |

## Architecture Pattern
- **Monolith-first** with Next.js full-stack
- **Service layer** pattern (business logic in `src/services/`)
- **AI Features:** Deferred — Python FastAPI microservice will be added post-launch
- **API:** RESTful, versioned (`/api/v1/`)
- **Auth:** JWT + database sessions via Auth.js

## Development Phases
- ✅ Phase 1 — Architecture & Project Setup (Next.js 16, Tailwind v4, Prisma v7)
- ✅ Phase 2 — Authentication (Auth.js v5, JWT, Credentials + Google OAuth, email flows)
- ✅ Phase 3 — Homepage & Public APIs
- ✅ Phase 4 — Product Discovery (Shop, Search, Filtering)
- ✅ Phase 5 — Product Details (Immersive Product Page)
- ✅ Phase 6 — Wishlist (Authenticated Wishlist)
- ✅ Phase 7 — Cart (Guest + Authenticated Cart, full `/cart` page)
- ✅ Phase 8 — Checkout UI (shipping + summary mockup)
- ✅ Phase 9 — Stripe Embedded Checkout, webhooks, order fulfillment, confirmation email
- ✅ Phase 10 — User dashboard (orders, profile, addresses, password settings)
- ✅ Phase 11 — Admin dashboard (KPI home, sidebar nav, charts, real DB analytics)
- ✅ Phase 12 — Admin orders (list, detail, status workflow, CSV export) + inventory (stock adjust, low stock alerts, audit log)
- ✅ Phase 13 — Coupons (admin CRUD, checkout validation, usage tracking)
- ✅ Phase 14 — Reviews & Ratings (verified buyer submit, admin moderation, helpful votes, rating recalc)
- ✅ Phase 15 — Deployment prep (Vercel Hobby + Neon only required; optional services documented; `npm run deploy:check`)
- ⏳ Phase 16 (AI Features) — Deferred until after production launch

## Storefront Enhancements (Post-Phase-12)
- ✅ `/brands` — brand grid, Our Story hero panel, stats bar, shop filter via `?brand=`
- ✅ `/about` — hero (text-over-image), Our Story, Values, By The Numbers, service bar
- Nav trimmed to: Home, Shop, Brands, About Us

## Project Root
`c:\Users\user\Documents\e-commerce store\luxora\`

## Key URLs
- **Repo:** TBD
- **Live URL:** TBD
- **Admin:** `/admin`
- **Local dev:** `http://localhost:3000`

## Last Updated
2026-07-01 — Phase 15 portfolio deploy: minimal 2-account guide, deploy:check script, vercel.json, trustHost
