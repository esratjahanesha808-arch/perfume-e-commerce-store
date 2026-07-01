# LUXORA — Database Schema (Updated)

## Overview
- **Database:** PostgreSQL 16 (Neon Serverless — Free tier)
- **ORM:** Prisma v7
- **Connection:** Configured in `prisma.config.ts` (Prisma v7 requirement)
- **ID Strategy:** CUID (Prisma default — URL-safe, no enumeration)
- **Timestamps:** All tables have `created_at` and `updated_at`
- **Status:** Schema created, Prisma client generated ✅

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Separate `inventory` table | Avoids row lock contention on products during checkout |
| `order_items` snapshot fields | Preserves price/name at time of order |
| `verificationToken` for password reset | Reuses Auth.js table with `reset:email` prefix |
| CUID over UUID | URL-safe, sortable, good for cursor pagination |
| `@@unique([userId, productId])` on cart/wishlist | One item per product per user |
| `@@unique([userId, productId])` on reviews | One review per product per user |

## Schema File Location
- `luxora/prisma/schema.prisma`

## Tables (19 total)

### Auth.js Tables (4)
| Table | Purpose |
|---|---|
| `users` | Core user table with role, isActive, loyaltyPoints, notificationPrefs (JSON), lastLoginAt |
| `accounts` | OAuth provider accounts (Google, etc.) |
| `sessions` | JWT session records |
| `verification_tokens` | Email verification + password reset tokens |

### Product Catalog (4)
| Table | Purpose |
|---|---|
| `products` | Core product with JSONB scent_notes + attributes |
| `categories` | Self-referential hierarchy (parent_id) |
| `brands` | Brand management |
| `product_images` | Multi-image per product with Cloudinary public_id |

### Commerce (4)
| Table | Purpose |
|---|---|
| `addresses` | User shipping addresses |
| `orders` | Orders with status workflow |
| `order_items` | Snapshot of product at order time |
| `payments` | Stripe payment record |

### Engagement (4)
| Table | Purpose |
|---|---|
| `reviews` | 1-5 star rating, moderation workflow |
| `coupon_usages` | Per-user coupon usage tracking |
| `wishlist_items` | Saved products |
| `cart_items` | Active cart with quantity |

### Operations (3)
| Table | Purpose |
|---|---|
| `coupons` | PERCENTAGE/FIXED_AMOUNT/FREE_SHIPPING types |
| `inventory` | Stock with reservation + low stock threshold |
| `inventory_logs` | Audit trail for manual stock adjustments |

## Enums
```
Role: CUSTOMER | ADMIN | SUPER_ADMIN
OrderStatus: PENDING | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED
PaymentStatus: PENDING | SUCCEEDED | FAILED | REFUNDED | PARTIALLY_REFUNDED
CouponType: PERCENTAGE | FIXED_AMOUNT | FREE_SHIPPING
InventoryChangeType: ADJUSTMENT | RESTOCK | CORRECTION
```

## Migration Status
- Phase 2: Schema designed, Prisma client generated ✅
- **Database Migration:** Complete ✅ (Latest: `20260629093028_add_inventory_logs` — `inventory_logs` audit table)
- All 19 tables created in Neon PostgreSQL database
- Connection: ep-lucky-mud-aoto0yov.c-2.ap-southeast-1.aws.neon.tech
- **Seed Data:** Complete ✅ (6 products, 5 brands, 3 categories, inventory, images, admin user)
- **Catalog Import:** 8 additional products added via image analysis (2026-06-18)

## Seed Credentials (dev only)
- Admin: `admin@luxora.com` / `Admin123!`
- Customer: `customer@test.com` / `Customer123!`

## Last Updated
2026-06-18 — Catalog synced: 11 active products with unique PNG photos; 7 legacy products deactivated
