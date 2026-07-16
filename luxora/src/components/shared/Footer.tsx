"use client";

import Link from "next/link";

const SHOP_LINKS = [
  { label: "All Perfumes",  href: "/" },
  { label: "Women",         href: "/" },
  { label: "Men",           href: "/" },
  { label: "Unisex",        href: "/" },
  { label: "Gift Sets",     href: "/" },
];

const SERVICE_LINKS = [
  { label: "Contact Us",          href: "/" },
  { label: "Shipping & Delivery", href: "/" },
  { label: "Returns & Refunds",   href: "/" },
  { label: "Track Order",         href: "/" },
  { label: "FAQ",                 href: "/" },
];

const ABOUT_LINKS = [
  { label: "Our Story",    href: "/" },
  { label: "Authenticity", href: "/" },
  { label: "Careers",      href: "/" },
  { label: "Press",        href: "/" },
];

const SOCIAL = [
  {
    label: "Instagram",
    href: "/",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "/",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "/",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "/",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
  },
];

const GOLD   = 'rgba(172, 125, 69, 1)';
const MUTED  = 'rgba(109, 110, 108, 1)';
const LIGHT  = 'rgba(207, 207, 207, 1)';
const DARK   = 'rgba(22, 22, 22, 1)';
const CREAM  = 'rgba(223, 216, 192, 1)';
const SEP    = 'rgba(109, 110, 108, 0.2)';

const GAP = 'clamp(3.5rem, 7vw, 6rem)';

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h5 className="font-bold uppercase mb-5" style={{ color: GOLD, fontSize: '10px', letterSpacing: '0.22em' }}>
        {title}
      </h5>
      <ul className="flex flex-col gap-[14px]">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            <Link href={link.href} className="hover:opacity-80 transition-opacity" style={{ color: MUTED, fontSize: '12px', letterSpacing: '0.03em' }}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer style={{ backgroundColor: '#0A0A0A' }}>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 2 — Stay in the Scent
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div
        style={{
          borderTop: `1px solid ${SEP}`,
          position: 'relative',
          overflow: 'hidden',
          marginTop: 0,
        }}
      >
        {/* Decorative ambient glow */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 80% at 85% 50%, rgba(172,125,69,0.07) 0%, transparent 70%)',
        }} />

        <div className="site-container" style={{ paddingTop: 'clamp(2.5rem,5vw,4.5rem)', paddingBottom: 'clamp(2.5rem,5vw,4.5rem)', position: 'relative', zIndex: 1 }}>
          {/* Three-column layout: text | form | decorative right */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-10 lg:gap-16">

            {/* Left — heading + description */}
            <div>
              <p className="uppercase mb-3" style={{ color: GOLD, fontSize: '10px', letterSpacing: '0.38em', fontWeight: 600 }}>
                Newsletter
              </p>
              <h4 className="font-serif mb-4" style={{ color: LIGHT, fontSize: 'clamp(1.25rem,2.5vw,1.75rem)', lineHeight: 1.2 }}>
                STAY IN THE SCENT
              </h4>
              <p className="footer-newsletter-desc" style={{ color: LIGHT, fontSize: '12px', lineHeight: 1.85, maxWidth: '300px', opacity: 0.85 }}>
                Subscribe to get exclusive offers,<br />
                early access to new arrivals and<br />
                fragrance tips.
              </p>
            </div>

            {/* Center — form */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="footer-newsletter-form"
            >
              <input
                type="email"
                placeholder="Enter your email address"
                aria-label="Email for newsletter"
                className="footer-newsletter-input"
                style={{
                  backgroundColor: DARK,
                  border: `1px solid rgba(109,110,108,0.35)`,
                  color: LIGHT,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                className="footer-newsletter-btn font-bold uppercase transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: GOLD,
                  color: '#0d0d0c',
                  border: 'none',
                  letterSpacing: '0.18em',
                  whiteSpace: 'nowrap',
                }}
              >
                SUBSCRIBE
              </button>
            </form>

            {/* Right — decorative SVG perfume bottle silhouette */}
            <div className="hidden lg:flex justify-end items-center" aria-hidden="true">
              <svg viewBox="0 0 120 180" width="90" height="135" fill="none" style={{ opacity: 0.18 }}>
                {/* Bottle body */}
                <rect x="30" y="70" width="60" height="90" rx="8" fill="rgba(172,125,69,1)" />
                {/* Bottle neck */}
                <rect x="44" y="44" width="32" height="28" rx="4" fill="rgba(172,125,69,1)" />
                {/* Bottle cap */}
                <rect x="36" y="22" width="48" height="24" rx="5" fill="rgba(172,125,69,1)" />
                {/* Label */}
                <rect x="38" y="90" width="44" height="50" rx="3" fill="rgba(0,0,0,0.4)" />
                {/* Label text lines */}
                <rect x="46" y="104" width="28" height="2" rx="1" fill="rgba(172,125,69,0.6)" />
                <rect x="50" y="112" width="20" height="1.5" rx="1" fill="rgba(172,125,69,0.4)" />
                <rect x="48" y="122" width="24" height="1.5" rx="1" fill="rgba(172,125,69,0.4)" />
                {/* Decorative flower */}
                <circle cx="98" cy="150" r="14" fill="rgba(172,125,69,0.15)" />
                <circle cx="98" cy="150" r="6" fill="rgba(172,125,69,0.25)" />
                {[0,60,120,180,240,300].map((deg, i) => (
                  <ellipse
                    key={i}
                    cx={98 + Math.cos((deg * Math.PI) / 180) * 10}
                    cy={150 + Math.sin((deg * Math.PI) / 180) * 10}
                    rx="4" ry="7"
                    transform={`rotate(${deg} ${98 + Math.cos((deg * Math.PI) / 180) * 10} ${150 + Math.sin((deg * Math.PI) / 180) * 10})`}
                    fill="rgba(172,125,69,0.2)"
                  />
                ))}
                {/* Small leaf */}
                <ellipse cx="18" cy="130" rx="6" ry="14" transform="rotate(-30 18 130)" fill="rgba(172,125,69,0.15)" />
                <ellipse cx="110" cy="100" rx="4" ry="10" transform="rotate(20 110 100)" fill="rgba(172,125,69,0.12)" />
              </svg>
            </div>

          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 3 — Footer main grid
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{ borderTop: `1px solid ${SEP}`, paddingTop: 'clamp(2.5rem,5vw,4rem)' }}>
        <div className="site-container pb-10">

          {/* 5-column grid: brand(2fr) + 4×(1fr) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10 lg:gap-12 mb-16">

            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-6">
              <Link href="/" className="flex flex-col items-start">
                <span className="font-serif font-bold tracking-widest leading-none" style={{ color: GOLD, fontSize: '1.875rem' }}>
                  LUXORA
                </span>
                <span className="uppercase mt-1" style={{ color: GOLD, fontSize: '7px', letterSpacing: '0.32em' }}>
                  Scent of Luxury
                </span>
              </Link>
              <p style={{ color: MUTED, fontSize: '12px', lineHeight: 1.7, maxWidth: '260px' }}>
                Curating the world&apos;s finest luxury fragrances for the discerning connoisseur since 2020.
              </p>
              <div className="flex items-center gap-3">
                {SOCIAL.map((s) => (
                  <Link
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-8 h-8 rounded-full border flex items-center justify-center transition-opacity hover:opacity-70"
                    style={{ borderColor: 'rgba(172,125,69,0.4)', color: GOLD }}
                  >
                    {s.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div>
              <FooterColumn title="Shop" links={SHOP_LINKS} />
            </div>

            {/* Customer Service */}
            <div>
              <FooterColumn title="Customer Service" links={SERVICE_LINKS} />
            </div>

            {/* About Us */}
            <div>
              <FooterColumn title="About Us" links={ABOUT_LINKS} />
            </div>

            {/* We Accept — single small vertical separator only before this column */}
            <div className="relative">
              <div
                className="hidden lg:block absolute w-px"
                style={{
                  left: '-1.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '60%',
                  backgroundColor: SEP,
                }}
              />
              <h5 className="font-bold uppercase" style={{ color: GOLD, fontSize: '10px', letterSpacing: '0.22em', marginBottom: '1rem' }}>
                We Accept
              </h5>
              <div className="flex flex-wrap gap-2" style={{ marginBottom: '1rem' }}>
                {[
                  { label: "VISA",      content: <span className="font-bold tracking-wider" style={{ color: DARK, fontSize: '10px' }}>VISA</span> },
                  { label: "Mastercard",content: (
                      <div className="relative w-5 h-[14px]">
                        <div className="absolute left-0 w-[14px] h-[14px] rounded-full bg-red-500 opacity-80" />
                        <div className="absolute right-0 w-[14px] h-[14px] rounded-full bg-yellow-500 opacity-80" />
                      </div>
                    )
                  },
                  { label: "PayPal",    content: <span className="font-bold italic text-blue-400" style={{ fontSize: '10px' }}>PayPal</span> },
                  { label: "Apple Pay", content: <span className="font-bold" style={{ color: DARK, fontSize: '10px' }}> Pay</span> },
                ].map((p) => (
                  <div
                    key={p.label}
                    title={p.label}
                    className="px-2 py-[5px] rounded-[3px] min-w-[38px] flex items-center justify-center border"
                    style={{ backgroundColor: CREAM, borderColor: 'rgba(172,125,69,0.2)' }}
                  >
                    {p.content}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2" style={{ color: MUTED, fontSize: '11px', marginTop: '0.75rem' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>SSL Secured Checkout</span>
              </div>
            </div>

          </div>

          {/* Bottom bar */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: `1px solid ${SEP}`, paddingTop: 'clamp(1.5rem,3vw,2.5rem)', marginTop: '1rem' }}
          >
            <p style={{ color: MUTED, fontSize: '11px', letterSpacing: '0.04em' }}>
              © {new Date().getFullYear()} Luxora. All Rights Reserved.
            </p>
            <div className="flex items-center gap-4" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>
              <Link href="/" className="hover:opacity-80 transition-opacity" style={{ color: MUTED }}>Privacy Policy</Link>
              <span style={{ color: 'rgba(109,110,108,0.35)' }} aria-hidden="true">|</span>
              <Link href="/" className="hover:opacity-80 transition-opacity" style={{ color: MUTED }}>Terms & Conditions</Link>
            </div>
          </div>

        </div>
      </div>

    </footer>
  );
}
