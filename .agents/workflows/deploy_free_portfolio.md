---
description: Deploy Luxora portfolio site for $0/month — beginner guide (only Vercel + Neon required)
---

# Deploy Luxora — Beginner Guide ($0 Portfolio)

You only need **2 free accounts** to put this site online. Everything else is optional.

---

## What each service is (and whether you need it)

| Service | What it does in Luxora | Need it for portfolio? |
|---|---|---|
| **Vercel** | Hosts the website on the internet (like publishing your project). Gives you `https://your-name.vercel.app` + free SSL. | **YES — required** |
| **Neon** | Cloud PostgreSQL database. Stores users, products, orders, reviews. | **YES — required** |
| **Stripe** | Payment checkout. Test mode = fake cards, $0 cost. | Optional — copy keys from your `.env.local` if you want live checkout demo |
| **Upstash** | Redis cache for rate limiting (blocks spam on login/register). | **Skip** — app works without it |
| **Cloudinary** | Image hosting/CDN for uploads. | **Skip** — seed data already uses image URLs |
| **Meilisearch** | Fast product search engine. | **Skip** — not connected in code yet; shop uses database search |
| **Resend** | Sends emails (order confirmation, password reset). | **Skip** — site works; emails just won't send |
| **Sentry** | Error monitoring in production. | **Skip** — not set up in this project |

**Total cost for portfolio: $0/month**

---

## What the AI already did for you (in code)

- Production build config (`vercel.json`, security headers, sitemap, robots.txt)
- Auth works on Vercel (`trustHost`, auto URL from `VERCEL_URL`)
- Deploy checklist script: `npm run deploy:check`
- Template env file: `luxora/.env.vercel.minimal`

---

## YOUR steps (about 20 minutes)

### Step 1 — Run the checklist locally

```powershell
cd luxora
npm run deploy:check
```

Copy the **AUTH_SECRET** it prints. Keep that tab open.

---

### Step 2 — Create Neon database (free)

1. Go to [neon.tech](https://neon.tech) → Sign up (GitHub is fine)
2. **Create project** → name it `luxora`
3. On the dashboard, copy the **Pooled connection** string  
   (host contains `-pooler` — important for Vercel)
4. In PowerShell, run migrations + seed **once**:

```powershell
cd luxora
$env:DATABASE_URL="PASTE_YOUR_NEON_POOLED_URL_HERE"
npx prisma migrate deploy
npm run db:seed
```

You should see “Seed completed” at the end.

---

### Step 3 — Push code to GitHub (if not already)

1. Create a repo on [github.com](https://github.com)
2. Push your project (the folder that contains `luxora/`)

Vercel needs GitHub to deploy automatically.

---

### Step 4 — Deploy on Vercel (free Hobby)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. **Add New → Project** → import your repo
3. **Root Directory:** click Edit → set to `luxora` → Continue
4. **Environment Variables** → add these for **Production**:

| Name | Value |
|---|---|
| `DATABASE_URL` | Your Neon pooled URL |
| `AUTH_SECRET` | From `npm run deploy:check` |
| `AUTH_TRUST_HOST` | `true` |

5. Click **Deploy** and wait ~2 minutes
6. Copy your live URL (e.g. `https://luxora-abc123.vercel.app`)

---

### Step 5 — Add URL env vars + redeploy

Back in Vercel → Settings → Environment Variables, add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-URL.vercel.app` |
| `AUTH_URL` | same URL |

Then **Deployments → … → Redeploy** (so Next.js picks up the public URL).

---

### Step 6 — Test your live site

- [ ] Homepage loads
- [ ] `/shop` shows products
- [ ] Login: `admin@luxora.com` / `Admin123!`
- [ ] `/admin` dashboard works

**Optional checkout:** add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` from your local `.env.local`, redeploy, use test card `4242 4242 4242 4242`.

---

## Later (only if you want)

| Want | Do this |
|---|---|
| Custom domain | Vercel → Domains → add yours (free on Hobby) |
| Emails | [resend.com](https://resend.com) → API key → `RESEND_API_KEY` |
| Rate limiting | [upstash.com](https://upstash.com) → Redis → copy URL + token |
| Stripe orders on live site | Stripe webhook → `https://your-url.vercel.app/api/v1/webhooks/stripe` |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Build failed | Check Vercel build logs; ensure `DATABASE_URL` and `AUTH_SECRET` are set |
| Login redirect loop | Set `AUTH_URL` and `NEXT_PUBLIC_APP_URL` to exact live URL, redeploy |
| Database error | Use Neon **pooled** URL, not direct connection |
| Empty shop | Run `npm run db:seed` against Neon (Step 2) |
| Images broken | Re-run seed; Cloudinary not required |

---

## Quick reference files

- `luxora/.env.vercel.minimal` — copy-paste template for Vercel
- `luxora/.env.example` — full list with comments
- `npm run deploy:check` — re-run anytime before deploy
