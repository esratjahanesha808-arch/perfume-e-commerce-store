# LUXORA — Luxury Perfume E-Commerce

Full-stack luxury perfume e-commerce platform — storefront, admin dashboard, Stripe checkout, reviews system, and user account area.

## Repository layout

| Path | Description |
|------|-------------|
| **`luxora/`** | Full Next.js 16 application (App Router, TypeScript) |
| `luxora/src/app/` | Pages, layouts, API routes |
| `luxora/src/components/` | UI components (storefront, admin, dashboard) |
| `luxora/src/services/` | Business logic service layer |
| `luxora/prisma/` | Database schema (18 tables) and seed data |
| `luxora/public/` | Static product images and assets |
| `luxora/scripts/` | Database and deployment helper scripts |

Browse the code in the **[`luxora/`](./luxora)** folder.

## Features

- 🛍️ Product catalog with shop, filtering, search
- 🛒 Guest + authenticated cart with session merge
- 💳 Stripe Embedded Checkout (test mode)
- ❤️ Wishlist, order history, user dashboard
- ⭐ Verified-buyer reviews with helpful votes
- 🎟️ Coupon / discount code system
- 🔐 Auth.js v5 — credentials + optional Google OAuth
- 📊 Full admin dashboard (KPIs, orders, inventory, products, reviews, coupons)
- 📧 Transactional emails via Resend (optional)
- 🎨 Luxury black & gold design with Tailwind CSS v4

## Run locally

```bash
cd luxora
npm install
cp .env.example .env.local   # fill in DATABASE_URL, AUTH_SECRET
npx prisma migrate dev
npm run db:seed
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000)

Default admin after seed: `admin@luxora.com` / `Admin123!`

## Deploy to Vercel (free portfolio)

1. Import this repo on [Vercel](https://vercel.com)
2. Set **Root Directory** → **`luxora`**
3. Add required env vars:

```
DATABASE_URL=<Neon pooled connection string>
AUTH_SECRET=<run: node -e "require('crypto').randomBytes(32).toString('base64')|console.log">
AUTH_TRUST_HOST=true
NEXT_PUBLIC_APP_URL=https://<your-project>.vercel.app    # set after first deploy
AUTH_URL=https://<your-project>.vercel.app               # set after first deploy
```

See [`luxora/.env.vercel.minimal`](./luxora/.env.vercel.minimal) for a copy-paste template.

Run the deploy checklist: `npm run deploy:check` (from inside `luxora/`)

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.9 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL 16 via Neon (serverless) |
| ORM | Prisma v7 |
| Auth | Auth.js v5 (NextAuth) |
| Payments | Stripe Embedded Checkout |
| Cache | Upstash Redis (optional) |
| Images | Cloudinary (optional) |
| Email | Resend (optional) |
| Hosting | Vercel |
