# LUXORA — Luxury Perfume E-Commerce

Next.js storefront, admin dashboard, checkout, reviews, and user account area.

## Repository layout

| Path | Description |
|------|-------------|
| **`luxora/`** | Full Next.js application (source code, API routes, Prisma, UI) |
| `luxora/src/` | App pages, components, services |
| `luxora/prisma/` | Database schema and seed |
| `luxora/public/` | Static assets |

Open the **`luxora`** folder on GitHub to browse the code.

## Run locally

```bash
cd luxora
npm install
cp .env.example .env.local   # add DATABASE_URL, AUTH_SECRET, etc.
npx prisma migrate dev
npm run db:seed
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

Default admin (after seed): `admin@luxora.com` / `Admin123!`

## Deploy (Vercel)

1. Import this repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to **`luxora`**.
3. Add environment variables (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, then `NEXT_PUBLIC_APP_URL` and `AUTH_URL` after first deploy).

See `luxora/.env.vercel.minimal` for a minimal env template.

## Tech stack

Next.js 15 · TypeScript · Tailwind CSS · Prisma · PostgreSQL (Neon) · NextAuth · Stripe (test mode)
