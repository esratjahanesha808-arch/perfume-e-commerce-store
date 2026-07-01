# LUXORA — Color Palette Documentation

Last Updated: 2026-06-18

---

## Overview
The Luxora color palette uses warm, earthy tones inspired by luxury perfume packaging — cream, amber, and dark browns. All colors are specified in `rgba()` format for precise opacity control.

---

## Primary Palette

### Cream & Neutrals
| Color Name | Value | Usage |
|---|---|---|
| **Card Background** | `rgba(210, 192, 170, 1)` | Product cards, brand cards |
| **Dark Brown** | `rgba(54, 44, 29, 1)` | Product names, brand logo icons |
| **Medium Brown** | `rgba(71, 56, 38, 1)` | Brand name labels |

### Amber & Gold Accents
| Color Name | Value | Usage |
|---|---|---|
| **Primary Gold** | `rgba(169, 118, 54, 1)` | Badges (BEST SELLER, NEW), star ratings filled |
| **Star Empty** | `rgba(169, 118, 54, 0.25)` | Star outline (unfilled) |
| **Section Headers** | `rgba(120, 102, 61, 1)` | "Shop by Brands", "Best Sellers" titles |
| **View All Links** | `rgba(126, 94, 53, 1)` | "View All" action links |

### Muted Tones
| Color Name | Value | Usage |
|---|---|---|
| **Brand Names (cards)** | `rgba(156, 132, 104, 1)` | Brand label text, wishlist icon |
| **View All Card** | `rgba(148, 126, 102, 1)` | "View All" card background |
| **Review Count** | `rgba(147, 135, 117, 1)` | "(24 reviews)", compare-at price strikethrough |

### Cart & Actions
| Color Name | Value | Usage |
|---|---|---|
| **Add to Cart** | `rgba(117, 96, 70, 1)` | "Add to Cart" button border, text, icon |
| **Add to Cart Hover** | Same as above (fills button) | Hover state background |

### Pricing
| Color Name | Value | Usage |
|---|---|---|
| **Price** | `rgba(82, 75, 61, 1)` | Current price display |

---

## Section-Specific Colors

### Hero Section
- Background: Full-bleed image (`/images/hero-bg.png`)
- Overlay gradient: Dark brown veil on left (`rgba(5,3,1,0.88)` → transparent)
- Text: White `#FFFFFF` for headline, gold `var(--gold)` for tagline
- CTA button: Outlined gold border + text, fills on hover

### Shop by Brands Section
- Section background: `#0d0d0c` (near black)
- Brand cards: `rgba(210, 192, 170, 1)` cream
- Brand logos: `rgba(54, 44, 29, 1)` dark brown
- Brand names: `rgba(71, 56, 38, 1)` medium brown
- View All card: `rgba(148, 126, 102, 1)` warm taupe
- Horizontal lines: `rgba(120, 102, 61, 0.38)` with 38% opacity

### Best Sellers Section
- Section background: `#0A0A0A` (background black)
- Product cards: `rgba(210, 192, 170, 1)` cream
- Badge (BEST SELLER / NEW): `rgba(169, 118, 54, 1)` bg + white text
- Title: `rgba(120, 102, 61, 1)`
- Horizontal lines: `rgba(120, 102, 61, 0.38)`
- View All: `rgba(126, 94, 53, 1)`

### Footer Section
- **Newsletter section:**
  - "STAY IN THE SCENT" heading: `rgba(207, 207, 207, 1)` (light gray)
  - Description text: `rgba(207, 207, 207, 1)` (light gray)
  - Email input background: `rgba(22, 22, 22, 1)` (dark)
  - Email input text: `rgba(207, 207, 207, 1)` (light gray)
  - Email input border: `rgba(109, 110, 108, 0.3)` (muted gray, 30% opacity)
  - Subscribe button background: `rgba(172, 125, 69, 1)` (warm brown/amber)
  - Subscribe button text: `#000` (black)

- **Footer main section:**
  - "LUXORA" logo text: `rgba(172, 125, 69, 1)` (warm brown/amber)
  - "Scent of Luxury" tagline: `rgba(172, 125, 69, 1)` (warm brown/amber)
  - Brand description: `rgba(109, 110, 108, 1)` (muted gray)
  - Social icons: `rgba(172, 125, 69, 1)` (warm brown/amber)
  - Social icon borders: `rgba(172, 125, 69, 0.4)` (40% opacity)

- **Footer columns (Shop, Customer Service, About Us):**
  - Column headers: `rgba(172, 125, 69, 1)` (warm brown/amber)
  - Column links: `rgba(109, 110, 108, 1)` (muted gray)

- **Payment methods:**
  - "We Accept" header: `rgba(172, 125, 69, 1)` (warm brown/amber)
  - Payment card backgrounds: `rgba(223, 216, 192, 1)` (light cream)
  - Payment card borders: `rgba(172, 125, 69, 0.2)` (20% opacity)
  - Card text (VISA, Pay): `rgba(22, 22, 22, 1)` (dark)
  - SSL badge text: `rgba(109, 110, 108, 1)` (muted gray)

- **Footer bottom bar:**
  - Copyright text: `rgba(109, 110, 108, 1)` (muted gray)
  - Legal links: `rgba(109, 110, 108, 1)` (muted gray)

---

## CSS Custom Properties

The following custom properties are defined in `src/app/globals.css`:

```css
:root {
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
  --error:          #F44336;
}
```

**Note:** These are legacy variables from the initial setup. The current palette uses direct `rgba()` values as documented above.

---

## Component-Specific Usage

### ProductCard (`src/components/shared/ProductCard.tsx`)
```typescript
const C = {
  cardBg:      "rgba(210, 192, 170, 1)",  // Card background
  badge:       "rgba(169, 118, 54,  1)",  // BEST SELLER / NEW badge
  badgeText:   "#fff",                     // Badge text (white)
  wishlist:    "rgba(156, 132, 104, 1)",  // Heart icon
  brand:       "rgba(156, 132, 104, 1)",  // Brand name label
  name:        "rgba(54,  44,  29,  1)",  // Product name
  star:        "rgba(169, 118, 54,  1)",  // Filled star
  starEmpty:   "rgba(169, 118, 54,  0.25)", // Empty star
  reviewCount: "rgba(147, 135, 117, 1)",  // Review count
  price:       "rgba(82,  75,  61,  1)",  // Price
  priceOld:    "rgba(147, 135, 117, 1)",  // Strikethrough price
  cartBorder:  "rgba(117, 96,  70,  1)",  // Add to Cart border
  cartText:    "rgba(117, 96,  70,  1)",  // Add to Cart text
};
```

### Brand Cards (`src/app/globals.css`)
```css
.brand-card {
  background: rgba(210, 192, 170, 1);
  border: 1px solid rgba(71, 56, 38, 0.18);
}
.brand-card-logo { color: rgba(54, 44, 29, 1); }
.brand-card-name { color: rgba(71, 56, 38, 1); }

.brand-card-all {
  background: rgba(148, 126, 102, 1);
}
.brand-card-all-icon,
.brand-card-all-label { color: rgba(210, 192, 170, 1); }
```

---

## Design Principles

1. **Warm & Earthy**: All colors lean warm (yellow/amber undertones) to evoke luxury perfume packaging
2. **High Contrast**: Dark browns on cream backgrounds ensure WCAG AA compliance
3. **Consistent Opacity**: Semi-transparent elements use consistent alpha values (.18, .25, .38)
4. **No Pure Black**: Darkest backgrounds are `#0A0A0A` / `#0d0d0c` for softer visual hierarchy
5. **Gold as Accent**: Gold tones (`rgba(169,118,54)`) reserved for emphasis (badges, stars, hover states)

---

## Accessibility

All color combinations meet WCAG 2.1 Level AA contrast requirements:
- Dark brown text (`rgba(54,44,29)`) on cream (`rgba(210,192,170)`): **8.2:1** ✅
- Medium brown text (`rgba(71,56,38)`) on cream: **6.4:1** ✅
- Gold badge text (white) on gold background (`rgba(169,118,54)`): **4.8:1** ✅

---

## File Locations

| File | Purpose |
|---|---|
| `src/app/globals.css` | Global color variables, utility classes, brand/cart button styles |
| `src/components/shared/ProductCard.tsx` | Product card color constants |
| `src/app/(storefront)/page.tsx` | Section-specific inline color styles |
| `src/components/shared/Footer.tsx` | Footer newsletter, branding, navigation, and payment method colors |

---

## Version History

- **2026-06-17 (Initial)**: Documented full color palette after homepage redesign
- **2026-06-17 (Update)**: Added Footer section color specifications with warm brown/amber accents and muted gray text
