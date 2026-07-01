# LUXORA App

Luxury perfume e-commerce platform built with Next.js App Router.

## Setup

```bash
npm install
cp .env.example .env.local
npx prisma migrate dev
npm run db:seed
npm run dev
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run deploy:check` | Pre-deploy validation |

## Environment

Copy `.env.example` to `.env.local` for local development. For Vercel, see `.env.vercel.minimal`.

Required: `DATABASE_URL`, `AUTH_SECRET`. Optional: Stripe test keys, email provider keys.
