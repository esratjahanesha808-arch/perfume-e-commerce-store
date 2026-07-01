import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ShieldCheck, Truck, Tag,
  Gift, Sparkles, Headphones,
} from "lucide-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { getFeaturedProducts } from "@/services/product.service";
import { toProductCard } from "@/lib/serialize-product";

export const dynamic = "force-dynamic";

/* ─────────────────────────────────────────────
   STATIC DATA (brands section uses SVG logos)
───────────────────────────────────────────── */
const BRANDS = [
  { name: "CHANEL",      logo: <ChanelLogo />,      href: "/shop" },
  { name: "DIOR",        logo: <DiorLogo />,         href: "/shop" },
  { name: "TOM FORD",    logo: <TomFordLogo />,      href: "/shop" },
  { name: "CREED",       logo: <CreedLogo />,        href: "/shop" },
  { name: "PENHALIGON'S",logo: <PenhaligonsLogo />,  href: "/shop" },
  { name: "XERJOFF",     logo: <XerjoffLogo />,      href: "/shop" },
  { name: "AMOUAGE",     logo: <AmouageLogo />,      href: "/shop" },
];

const TRUST_BADGES = [
  { icon: <ShieldCheck size={20} strokeWidth={1.5} />, title: "100% AUTHENTIC", sub: "Original & Trusted" },
  { icon: <Truck       size={20} strokeWidth={1.5} />, title: "FAST DELIVERY",  sub: "Worldwide Shipping" },
  { icon: <Tag         size={20} strokeWidth={1.5} />, title: "EXCLUSIVE OFFERS", sub: "For Our Members" },
];

const BENEFITS = [
  { icon: <Tag size={22} strokeWidth={1.5} />, title: "EXCLUSIVE MEMBER OFFERS",  desc: "Join our membership and enjoy special privileges." },
  { icon: <Sparkles size={22} strokeWidth={1.5} />, title: "SAMPLE BEFORE YOU BUY",    desc: "Try samples of luxury fragrances." },
  { icon: <Gift     size={22} strokeWidth={1.5} />, title: "LUXURY GIFT PACKAGING",    desc: "Every order comes with premium packaging." },
  { icon: <Headphones size={22} strokeWidth={1.5} />, title: "EXPERT SUPPORT",         desc: "Our fragrance experts are here to help you." },
];

/* ─────────────────────────────────────────────
   BRAND LOGO MARKS  (icons only — name shown separately below)
───────────────────────────────────────────── */

/** Chanel — interlocking CC rings */
function ChanelLogo() {
  return (
    <svg viewBox="0 0 48 32" width="44" height="30" aria-label="Chanel" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="17" cy="16" r="11" />
      <circle cx="31" cy="16" r="11" />
    </svg>
  );
}

/** Dior — elegant script "D" initial */
function DiorLogo() {
  return (
    <svg viewBox="0 0 36 44" width="28" height="36" fill="currentColor" aria-label="Dior">
      <text x="50%" y="76%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Georgia, serif" fontSize="40" fontWeight="300">D</text>
    </svg>
  );
}

/** Tom Ford — TF monogram */
function TomFordLogo() {
  return (
    <svg viewBox="0 0 52 36" width="44" height="30" fill="currentColor" aria-label="Tom Ford">
      <text x="50%" y="74%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Georgia, serif" fontSize="28" fontWeight="300" letterSpacing="2">TF</text>
    </svg>
  );
}

/** Creed — crown icon */
function CreedLogo() {
  return (
    <svg viewBox="0 0 40 30" width="38" height="28" fill="currentColor" aria-label="Creed">
      {/* Crown base */}
      <rect x="3" y="22" width="34" height="5" rx="1" />
      {/* Crown body */}
      <path d="M3 22 L3 14 L11 20 L20 8 L29 20 L37 14 L37 22 Z" />
      {/* Jewel dots */}
      <circle cx="3"  cy="14" r="2.2" />
      <circle cx="20" cy="8"  r="2.2" />
      <circle cx="37" cy="14" r="2.2" />
    </svg>
  );
}

/** Penhaligon's — heraldic shield */
function PenhaligonsLogo() {
  return (
    <svg viewBox="0 0 36 42" width="30" height="36" fill="currentColor" aria-label="Penhaligon's">
      {/* Shield outline */}
      <path d="M18 40 C18 40 3 30 3 16 L3 4 L33 4 L33 16 C33 30 18 40 18 40 Z" />
      {/* Inner shield (cut-out effect) */}
      <path d="M18 34 C18 34 8 26 8 16 L8 9 L28 9 L28 16 C28 26 18 34 18 34 Z"
        fill="rgba(210,192,170,0.45)" />
      {/* Centre cross */}
      <rect x="16.5" y="11" width="3" height="14" fill="rgba(210,192,170,0.7)" />
      <rect x="10"   y="16.5" width="16" height="3" fill="rgba(210,192,170,0.7)" />
    </svg>
  );
}

/** Xerjoff — bold X */
function XerjoffLogo() {
  return (
    <svg viewBox="0 0 40 40" width="34" height="34" fill="currentColor" aria-label="Xerjoff">
      <text x="50%" y="74%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Georgia, serif" fontSize="34" fontWeight="200" letterSpacing="2">X</text>
    </svg>
  );
}

/** Amouage — crescent moon + star */
function AmouageLogo() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" fill="currentColor" aria-label="Amouage">
      {/* Crescent moon */}
      <path d="M20 6 A14 14 0 1 0 20 34 A10 10 0 1 1 20 6 Z" />
      {/* Five-point star */}
      <polygon points="32,10 33.4,14.3 38,14.3 34.3,16.9 35.7,21.2 32,18.6 28.3,21.2 29.7,16.9 26,14.3 30.6,14.3" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   SECTION HEADER  (reusable)
───────────────────────────────────────────── */
function SectionHeader({ label, title }: { label?: string; title: string }) {
  return (
    <div className="text-center mb-10">
      {label && (
        <p className="text-gold text-[10px] tracking-[0.35em] uppercase mb-2">{label}</p>
      )}
      <h2 className="font-serif text-text-primary">{title}</h2>
      <div className="flex items-center justify-center gap-3 mt-3">
        <div className="h-px w-10 bg-gold/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
        <div className="h-px w-10 bg-gold/40" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(10);
  const bestSellers = featuredProducts.map(toProductCard);

  return (
    <>
      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "calc(100svh - 108px)" }}
      >
        {/* ── Full-bleed background image ── */}
        <Image
          src="/images/hero-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "70% center", transform: "scale(0.92)", transformOrigin: "right center" }}
        />

        {/* ── Overlay gradient layers — darken left for legibility, preserve right ── */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          {/* Strong dark veil on left where text sits */}
          <div style={{
            position: "absolute", inset: 0,
            background:
              "linear-gradient(to right, rgba(5,3,1,0.88) 0%, rgba(5,3,1,0.78) 28%, rgba(5,3,1,0.45) 52%, rgba(5,3,1,0.12) 72%, transparent 90%)",
          }} />
          {/* Vertical dark fade at very bottom for dots legibility */}
          <div style={{
            position: "absolute", bottom: 0, insetInline: 0, height: "120px",
            background: "linear-gradient(to top, rgba(5,3,1,0.7) 0%, transparent 100%)",
          }} />
          {/* Top edge fade */}
          <div style={{
            position: "absolute", top: 0, insetInline: 0, height: "80px",
            background: "linear-gradient(to bottom, rgba(5,3,1,0.4) 0%, transparent 100%)",
          }} />
        </div>

        {/* ── Text content — positioned over image ── */}
        <div
          className="relative z-10 site-container flex flex-col justify-center"
          style={{ minHeight: "calc(100svh - 108px)", paddingTop: "clamp(3rem,6vw,6rem)", paddingBottom: "clamp(3rem,6vw,6rem)" }}
        >
          {/* Text block: max 46% on desktop, full width on mobile */}
          <div style={{ maxWidth: "clamp(280px, 46%, 560px)" }}>

            {/* Eyebrow */}
            <div className="animate-hero-1 flex items-center gap-3 mb-5">
              <div style={{ height: "1px", width: "28px", background: "var(--gold)", opacity: 0.75 }} />
              <span style={{
                color: "var(--gold)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.42em",
                textTransform: "uppercase",
              }}>
                Premium Perfumes
              </span>
            </div>

            {/* Headline */}
            <h1
              className="animate-hero-2 font-serif"
              style={{ marginBottom: "18px", lineHeight: 1.06, letterSpacing: "-0.01em" }}
            >
              <span style={{ display: "block", color: "#FFFFFF", fontWeight: 700 }}>
                Discover Luxury
              </span>
              <span style={{ display: "block", color: "var(--gold)" }}>
                In Every Note
              </span>
            </h1>

            {/* Description */}
            <p
              className="animate-hero-2"
              style={{
                color: "rgba(210,200,185,0.85)",
                fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                lineHeight: 1.75,
                marginBottom: "32px",
                maxWidth: "400px",
              }}
            >
              Explore the world's finest fragrances from iconic brands and niche collections.
            </p>

            {/* CTA */}
            <div className="animate-hero-3" style={{ marginBottom: "40px" }}>
              <Link href="/shop" className="btn btn-outline-gold">
                Explore Collection
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>

            {/* Trust badges */}
            <div
              className="animate-hero-4 flex flex-wrap gap-5"
              style={{ paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.12)" }}
            >
              {TRUST_BADGES.map((b) => (
                <div key={b.title} className="flex items-center gap-[10px]">
                  <div style={{ color: "var(--gold)", opacity: 0.9 }}>{b.icon}</div>
                  <div>
                    <p style={{
                      color: "#F0EDE8",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      marginBottom: "2px",
                      lineHeight: 1,
                    }}>
                      {b.title}
                    </p>
                    <p style={{ color: "rgba(180,165,145,0.85)", fontSize: "10px", letterSpacing: "0.04em" }}>
                      {b.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Removed carousel dots per design feedback */}
      </section>

      {/* ══════════════════════════════════════════
          MARQUEE
      ══════════════════════════════════════════ */}
      <div className="border-y border-border-dark py-3 overflow-hidden bg-surface" aria-hidden="true">
        <div className="flex gap-12 whitespace-nowrap" style={{ animation: "marquee 28s linear infinite" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-5 text-[10px] tracking-[0.28em] uppercase text-text-secondary">
              <span className="text-gold">✦</span> Free Returns
              <span className="text-gold">✦</span> 100% Authentic
              <span className="text-gold">✦</span> Worldwide Shipping
              <span className="text-gold">✦</span> Exclusive Brands
              <span className="text-gold">✦</span> Luxury Packaging
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SHOP BY BRANDS
      ══════════════════════════════════════════ */}
      <section className="home-section" style={{ background: "#0d0d0c" }}>
        <div className="site-container">
          <div className="home-section-heading">
            <div className="home-section-heading-line" aria-hidden="true" />
            <h2 className="home-section-heading-title">Shop by Brands</h2>
            <div className="home-section-heading-line" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {BRANDS.map((brand) => (
              <Link
                key={brand.name}
                href={brand.href}
                className="brand-card flex flex-col items-center justify-center gap-[10px] aspect-square p-3"
              >
                <div className="brand-card-logo flex items-center justify-center h-10">
                  {brand.logo}
                </div>
                <span className="brand-card-name min-w-0 w-full">{brand.name}</span>
              </Link>
            ))}
            {/* View All — accent card restored in grid */}
            <Link
              href="/brands"
              className="brand-card-all flex flex-col items-center justify-center gap-[10px] aspect-square p-3"
            >
              <div className="brand-card-all-icon flex items-center justify-center h-10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <span className="brand-card-all-label text-[9px] tracking-[0.18em] uppercase">View All</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BEST SELLERS
      ══════════════════════════════════════════ */}
      <section className="home-section bg-background">
        <div className="site-container">
          <div className="home-section-heading relative">
            <div className="home-section-heading-line" aria-hidden="true" />
            <h2 className="home-section-heading-title">Best Sellers</h2>
            <div className="home-section-heading-line" aria-hidden="true" />
            <Link href="/shop?sort=best-sellers" className="home-section-heading-actions">
              View All <ArrowRight size={13} strokeWidth={2} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {bestSellers.map(({ badge, ...product }) => (
              <ProductCard key={product.id} product={product} badge={badge} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BENEFITS SECTION (CARD)
      ══════════════════════════════════════════ */}
      <section className="bg-background" style={{ paddingTop: 'clamp(2rem,4vw,3.5rem)', paddingBottom: 'clamp(2rem,4vw,3.5rem)' }}>
        <div className="site-container">
          <div style={{ backgroundColor: 'rgba(22,22,22,1)', border: '1px solid rgba(109,110,108,0.2)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map((b, i) => (
                <div
                  key={b.title}
                  className="relative flex items-start gap-4 text-left"
                  style={{ padding: 'clamp(1.25rem,2.5vw,1.75rem) clamp(1rem,2vw,1.5rem)' }}
                >
                  {/* Vertical separator — only between items, centered height */}
                  {i > 0 && (
                    <div
                      className="hidden lg:block absolute left-0 w-px"
                      style={{ top: '50%', transform: 'translateY(-50%)', height: '55%', backgroundColor: 'rgba(109,110,108,0.22)' }}
                    />
                  )}
                  {/* Mobile horizontal separator */}
                  {i > 0 && (
                    <div
                      className="block sm:hidden absolute top-0 left-6 right-6 h-px"
                      style={{ backgroundColor: 'rgba(109,110,108,0.15)' }}
                    />
                  )}
                  <div className="shrink-0 mt-0.5" style={{ color: 'rgba(172,125,69,1)' }}>{b.icon}</div>
                  <div>
                    <p className="font-bold uppercase mb-1" style={{ color: 'rgba(172,125,69,1)', fontSize: '10px', letterSpacing: '0.18em', lineHeight: 1.4 }}>
                      {b.title}
                    </p>
                    <p style={{ color: 'rgba(109,110,108,1)', fontSize: '11px', lineHeight: 1.65 }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Marquee keyframe */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}
