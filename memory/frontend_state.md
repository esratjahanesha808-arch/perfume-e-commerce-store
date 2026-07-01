# LUXORA — Frontend State

## Overview
- **Framework:** Next.js 16.2.9 (App Router)
- **Styling:** Tailwind CSS v4 (Custom UI Components)
- **State (Client):** Zustand (cart + wishlist)
- **State (Server):** TanStack Query v5 (Planned for shop/search caching)
- **Status:** Phase 14 — Reviews & Ratings (Complete)

## Route Structure

### Storefront (Customer-Facing)
```
/(storefront)/
├── /                           → Homepage (Implemented ✅)
├── /shop                       → Product listing (Implemented ✅)
├── /brands                     → Brand directory + Our Story panel (Implemented ✅)
├── /about                      → About Us page (Implemented ✅)
├── /products/[slug]            → Product detail page (Implemented ✅)
├── /wishlist                   → User wishlist (Implemented ✅)
├── /cart                       → Full cart page (Implemented ✅)
├── /checkout                   → Checkout shipping + summary (Implemented ✅)
├── /checkout/payment           → Stripe Embedded Checkout (Implemented ✅)
├── /checkout/success           → Payment confirmation (Implemented ✅)
├── /checkout/cancel            → Payment cancelled (Implemented ✅)
├── /dashboard                  → Redirects to orders (Implemented ✅)
├── /dashboard/orders           → Order history (Implemented ✅)
├── /dashboard/orders/[id]      → Order detail (Implemented ✅)
├── /dashboard/profile          → Profile editor (Implemented ✅)
├── /dashboard/addresses        → Address management (Implemented ✅)
├── /dashboard/settings         → Password change (Implemented ✅)
```

### Authentication (Implemented ✅)
```
/(auth)/
├── /login                      → Login page ✅ (shared auth spacing: `.auth-shell`, `.auth-card`, `.auth-form`)
├── /register                   → Registration page ✅
├── /forgot-password            → Password reset request ✅
├── /reset-password             → New password form ✅
├── /verify-email               → Email verification ✅
```
Auth UI uses shared classes in `globals.css` (`.auth-shell`, `.auth-card`, `.auth-header`, `.auth-form`, `.auth-field`, `.auth-footer`) for consistent vertical rhythm and card padding.

### Admin Dashboard (Implemented ✅ — Phases 11–12)
```
/admin/
├── /                           → KPI dashboard (orders, sales, customers, products, rating)
├── /orders                     → Order list, filters, CSV export ✅
├── /orders/[id]                → Order detail + status workflow ✅
├── /inventory                  → Inventory dashboard + stock adjustment ✅
├── /products                   → Product list, active/featured toggles ✅
├── /collections                → Category-based collections management ✅
├── /brands                     → Coming soon
├── /categories                 → Coming soon
├── /customers                  → Coming soon
├── /coupons                    → Coupon list + create/edit (Phase 13 ✅)
├── /reviews                    → Review moderation (Phase 14 ✅)
├── /marketing/banners          → Coming soon
├── /marketing/subscribers      → Coming soon
├── /reports/sales              → Coming soon
├── /reports/products           → Coming soon
├── /reports/customers          → Coming soon
└── /settings/*                 → Coming soon
```
- Separate from storefront layout (no Header/Footer)
- `AdminShell`, `AdminSidebar`, `AdminTopbar`, KPI cards, sales line chart, category donut, recent orders table, top products/customers lists
- Cream cards on dark shell matching design reference
- Date range picker (7/14/30 day presets) filters KPIs + charts via URL params

### Admin Dashboard (Planned — was empty)
```
/admin/
├── /                           → Admin dashboard (KPIs, charts)
├── /products                   → Product list
├── /products/new               → Create product
├── /products/[id]/edit         → Edit product
├── /orders                     → Order management
├── /orders/[id]                → Order detail
├── /customers                  → Customer list
├── /categories                 → Category management
├── /brands                     → Brand management
├── /inventory                  → Inventory management
├── /coupons                    → Coupon list
├── /coupons/new                → Create coupon
├── /reviews                    → Review moderation
├── /settings                   → Admin settings
```

## Component Architecture

### Shared Components
- Header, Footer, MobileNav, Logo (Implemented ✅)
- ThemeProvider, Toaster (Implemented ✅)

### Product Components
- ProductCard (Implemented ✅)
- ProductPage, ProductGallery, ProductInfo, SizeSelector, QuantitySelector (Implemented ✅)
- ProductTabs, TrustFeatures, Breadcrumb (Implemented ✅)
- product-display.ts helpers + product types (Implemented ✅)

### Wishlist Components (Implemented ✅)
- WishlistProvider, WishlistButton, WishlistTableRow, EmptyWishlist, WishlistPageClient, WishlistYouMayAlsoLike
- `/wishlist` — table layout (Product / Price / Stock / Action), gold Add to Cart, You May Also Like carousel

### Cart Components (Implemented ✅)
- `CartProvider`, `CartPageClient`, `CartTableRow`, `CartSummary`, `CartQuantityControl`, `AddToCartButton`, `EmptyCart`, `CartTrustBar`
- `/cart` — cream table panel, totals sidebar, trust bar; mobile × top-right, no per-line total on mobile
- Wired: Header badge + link, ProductCard, PDP Add to Cart, Wishlist Add to Cart
- **Fix (2026-06-27):** Removed `clearLocal()` after API refresh/setItems — was wiping cart immediately after add/sync

### Shop Layout (2026-06-27)
- `.shop-page-header`, `.shop-page-layout`, `.shop-results-toolbar`, `.shop-product-grid-wrap` — cleaner header/toolbar/grid spacing

### Checkout Components (Implemented ✅ — Phase 8 + 9 + 13)
- `CheckoutPageClient`, `CheckoutStepper`, `CheckoutShippingForm`, `CheckoutMethodsColumn`, `CheckoutOrderSummary`, `CheckoutTrustBar`
- `CheckoutPaymentClient`, `StripeCheckout`, `CheckoutSuccessClient`
- `/checkout` — coupon code apply/remove in order summary; discount reflected in totals
- `/checkout` → **Continue to Payment** creates pending order + Stripe session (coupon applied server-side)
- `/checkout/payment` — embedded Stripe form (`createEmbeddedCheckoutPage`)
- `/checkout/success` — confirms payment + order number via session sync
- `/checkout/cancel` — abandoned payment fallback

### Dashboard Components (Implemented ✅ — Phase 10 mockup)
- `DashboardSidebar` — profile, nav, help, logout in one card
- `DashboardHome` — standard sidebar + main layout; upper + lower rows; promo shell-centered at lg+
- `OrderHistory`, `OrderDetail`, `OrderStatusBadge`, `ProfileForm`, `PasswordForm`, `AddressManager`
- `WishlistDashboardPanel`, `DashboardReviewsList`, `NotificationPreferencesForm`
- Routes: `/dashboard`, `/dashboard/orders`, `/wishlist`, `/addresses`, `/profile`, `/payment-methods`, `/reviews`, `/loyalty`, `/notifications`
- Loyalty: 2 pts/$1 spent; Silver / Gold / Platinum tiers

### Checkout Components (Planned)
- CheckoutWizard multi-step refactor (optional)

### Admin Components (Implemented ✅)
- AdminShell, AdminSidebar, AdminTopbar, AdminKPICards, AdminSalesChart, AdminCategoryChart
- AdminRecentOrders, AdminTopProducts, AdminTopCustomers, AdminOrderStatusBadge, AdminComingSoon
- AdminOrdersToolbar, AdminOrdersTable, AdminPagination, AdminOrderDetailClient, AdminInventoryClient
- AdminProductsClient, AdminCouponsClient (Phase 13), AdminReviewsClient (Phase 14)
- **ProductReviewForm** / **ProductReviewPrompt** — PDP verified-buyer submit; helpful votes on ProductReviews
- **OrderDetail** — Review button on line items when order status is `DELIVERED` → `/products/[slug]#reviews-heading`
- **AdminCategoryChart** — donut center label via Recharts `Label` (true pie center); darker center text `#473826` / `#362c1d`

### User dashboard typography (Jul 2026)
- `.dashboard-page` tokens: `--dashboard-text-body` `#ded6cc`, `--dashboard-text-muted` `#c4bab0`, `--dashboard-text-gold` `#ddb868`
- All `.dashboard-*` secondary copy uses dashboard tokens (orders, loyalty, reviews, notifications, wishlist panel)

### Admin Components (Planned)
- AdminLayout, AdminSidebar, AdminTopbar
- KPICards, RevenueChart, DataTable
- ProductForm, CouponForm, ImageUploader

## Zustand Stores
1. **cart-store.ts** — cart items, quantities, totals (`persist` → localStorage `luxora-cart`); guest cart + API sync on login
2. **ui.store.ts** — modals, drawers, theme, sidebar state (Planned)
3. **auth.store.ts** — minimal client auth state (Planned)

## Design System

### Color Palette (Black & Gold Luxury)
```css
/* CSS Variables in globals.css */
--background:     #0A0A0A;
--surface:        #141414;
--card:           #F3EFE6;
--gold:           #C49A45;
--gold-hover:     #DDB868;
--gold-muted:     #8C6C2E;
--text-primary:   #F5F5F5;
--text-secondary: #A3A3A3;
--text-muted:     #6B6B6B;
--noir-border:    rgba(255, 255, 255, 0.08);

/* Precise rgba() Palette (used directly in JS/CSS) */
--cream-card-bg:  rgba(210, 192, 170, 1);
--dark-brown:     rgba(54, 44, 29, 1);
--medium-brown:   rgba(71, 56, 38, 1);
--primary-gold:   rgba(169, 118, 54, 1);
--footer-gold:    rgba(172, 125, 69, 1);
--footer-muted:   rgba(109, 110, 108, 1);
--add-to-cart:    rgba(117, 96, 70, 1);
```

### Layout Container (MANDATORY)
- **Class:** `.site-container` — `width: 100%`, `max-width: 1440px`, `margin-inline: auto`, fluid padding
- **Component:** `<SiteContainer>` at `src/components/shared/SiteContainer.tsx`
- **Used by:** Header, Footer, Homepage, Shop, Product PDP
- **Never use:** ad-hoc `max-w-[…] mx-auto` for page-level sections (causes left-aligned content vs header)

### Section Spacing (MANDATORY)
- **Hero envelope:** breadcrumb line → `.pdp-hero-band` (gallery + info) → lower line → trust
- **Product info:** `.pdp-info-stack` — name → brand → rating → price → description → size → qty → ATC
- **Related:** `.pdp-related-band` — keep `--sp-32` bottom padding (do not reduce when editing hero)
- **Scope:** only change sections the user asked for — see SCOPE RULE in orchestration-rule.mdc

### PDP Responsiveness (MANDATORY)
- Hero columns: **`xl:` breakpoint** — stack below 1280px, side-by-side at 1280px+ (desktop design unchanged)
- Gallery: thumbnails at `xl+` only; swipe gallery below `xl`
- All hero columns: `min-w-0`; page root: `.pdp-page` + `overflow-x: clip`
- Test: 375 / 768 / 1024 / 1280 / 1440px before complete

### Product Components (PDP)
- ProductPage, PdpSection, ProductGallery, ProductInfo, ProductReviews, SizeSelector, QuantitySelector (Implemented ✅)
- ProductTabs, TrustFeatures, Breadcrumb (Implemented ✅)

### Typography
- **Headings:** Playfair Display (serif, luxury feel)
- **Body:** Inter (clean, modern readability)
- **Accent:** Cormorant Garamond (elegant details)

### Animations
- Page transitions: fade-in (200ms)
- Cart drawer: slide-right (300ms, ease-out)
- Button hover: scale(1.02) + gold glow
- Product card: lift shadow on hover
- Add to cart: pulse animation

## Build Status
- [x] Next.js project initialized
- [x] Tailwind CSS configured with design tokens (Tailwind CSS v4)
- [x] Fonts loaded (Playfair Display, Inter)
- [x] Root layout created
- [x] Global CSS with design tokens and custom utility classes
- [x] **Phase 3**: Storefront Layout + Homepage Components (Hero, Marquee, Shop by Brands, Best Sellers, Benefits)
- [x] **Phase 3**: Header & Footer (with announcement bar, mobile drawer navigation, responsive newsletter, payment methods, and SSL secured checkout)
- [x] **Phase 4**: Product Discovery (Shop, Search, Filtering) - Shop page with sidebar filters; filter UI uses shared `.shop-filter-*` spacing classes in `globals.css` (single panel, gold dividers between sections — no nested boxes).
- [x] **Phase 5**: Product Details - Implemented a pixel-perfect, highly immersive customer-facing product detail page featuring a vertical-thumbnail product gallery, custom size selector, quantity adjuster, trust badges, and tabbed details (Description, Notes, Ingredients, Shipping & Returns) matching the design specification exactly.
- [x] **DB Integration**: Homepage Best Sellers + Shop page load from Neon PostgreSQL via server components (`getFeaturedProducts`, `getAllProducts`, `getActiveBrands`)
- [x] **Phase 6**: Wishlist — authenticated save/remove, `/wishlist` page, heart on ProductCard + PDP, header badge count
- [x] **Phase 7**: Cart — Zustand guest cart, authenticated API + merge on login, `/cart` page, add from shop/PDP/wishlist, header badge
- [x] **Phase 8**: Checkout UI — `/checkout` mockup layout, shipping form, shipping/payment methods, order summary, trust bar
- [x] **Phase 9**: Stripe checkout + success/cancel pages
- [x] **Phase 10–12**: User dashboard + admin orders/inventory
- [x] **Storefront**: `/brands`, `/about` pages (2026-07-01)
- [x] **Phase 13**: Admin coupons CRUD + checkout coupon apply/validate
- [x] **Phase 14**: Reviews — PDP submit, helpful votes, admin moderation UI
- **Last Updated:** 2026-07-01 — Phase 14 Reviews & Ratings complete
