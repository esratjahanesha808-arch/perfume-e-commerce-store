import Image from "next/image";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  Star,
  Gift,
  Truck,
  Lock,
  RotateCcw,
  Headphones,
  Users,
  FlaskConical,
  PackageCheck,
} from "lucide-react";
import { SiteContainer } from "@/components/shared/SiteContainer";
import { PageSection } from "@/components/shared/PageSection";

const VALUES = [
  {
    icon: <Award size={24} strokeWidth={1.5} />,
    title: "AUTHENTICITY",
    desc: "100% authentic products from trusted brands.",
  },
  {
    icon: <ShieldCheck size={24} strokeWidth={1.5} />,
    title: "QUALITY",
    desc: "Premium ingredients, finely crafted.",
  },
  {
    icon: <Star size={24} strokeWidth={1.5} />,
    title: "TRUST",
    desc: "Customer satisfaction is our promise.",
  },
  {
    icon: <Gift size={24} strokeWidth={1.5} />,
    title: "EXPERIENCE",
    desc: "Elevating moments with luxury fragrances.",
  },
];

const STATS = [
  { icon: <Users size={22} strokeWidth={1.5} />, value: "10K+", label: "Happy Customers" },
  { icon: <FlaskConical size={22} strokeWidth={1.5} />, value: "250+", label: "Luxury Brands" },
  { icon: <PackageCheck size={22} strokeWidth={1.5} />, value: "50K+", label: "Products Sold" },
  { icon: <Star size={22} strokeWidth={1.5} />, value: "4.9/5", label: "Customer Rating" },
];

const SERVICES = [
  { icon: <Truck size={22} strokeWidth={1.5} />, title: "FAST DELIVERY", sub: "Worldwide Shipping" },
  { icon: <Lock size={22} strokeWidth={1.5} />, title: "SECURE PAYMENT", sub: "100% Secure Checkout" },
  { icon: <RotateCcw size={22} strokeWidth={1.5} />, title: "EASY RETURNS", sub: "14 Day Returns" },
  { icon: <Headphones size={22} strokeWidth={1.5} />, title: "EXPERT SUPPORT", sub: "We're here to help you" },
];

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="home-section-heading relative justify-center">
      <div className="home-section-heading-line" aria-hidden="true" />
      <h2 className="home-section-heading-title">{title}</h2>
      <div className="home-section-heading-line" aria-hidden="true" />
    </div>
  );
}

export function AboutPageContent() {
  return (
    <div className="about-page w-full min-w-0 overflow-x-clip">
      {/* ── Breadcrumb (outside hero image) ── */}
      <div className="about-page-top">
        <SiteContainer>
          <nav className="about-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden>&gt;</span>
            <span>About Us</span>
          </nav>
        </SiteContainer>
      </div>

      {/* ── Hero: text over proportional background image ── */}
      <section className="about-hero relative w-full min-w-0 overflow-hidden">
        <div className="about-hero-media" aria-hidden="true">
          <Image
            src="/images/about-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="about-hero-bg"
          />
        </div>

        <div className="about-hero-overlay" aria-hidden="true" />

        <div className="about-hero-content site-container">
          <div className="about-hero-copy">
            <p className="about-hero-eyebrow">About Luxora</p>
            <h1 className="about-hero-title font-serif">
              <span className="about-hero-title-light">Crafting Memories</span>
              <span className="about-hero-title-gold">Through Scent</span>
            </h1>
            <p className="about-hero-text">
              At Luxora, we believe fragrance is more than a scent — it is an expression of identity,
              memory, and luxury. Our mission is to curate the world&apos;s finest perfumes from iconic
              houses and emerging niche perfumers, bringing you closer to the art of perfumery.
            </p>
          </div>
        </div>
      </section>

      {/* ── Our Story ── */}
      <PageSection id="our-story" className="about-story-section">
        <SiteContainer>
          <SectionHeading title="Our Story" />

          <div className="about-story-grid">
            <div className="about-story-image-wrap">
              <Image
                src="/images/about-story.png"
                alt="Luxora gift box and studded gold fragrance bottle"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="about-story-image"
              />
            </div>

            <div className="about-story-copy">
              <p>
                Founded on a passion for exceptional perfumery, Luxora began with a simple vision: to make
                the world&apos;s most prestigious fragrances accessible to those who appreciate true luxury.
                Every bottle in our collection tells a story of craftsmanship, heritage, and artistry.
              </p>
              <p>
                We travel the globe to discover hidden gems from niche perfumers and iconic houses alike.
                Our expert curators hand-select each fragrance for its quality, authenticity, and ability to
                evoke emotion — ensuring only the finest scents reach our customers.
              </p>
              <p>
                More than a retailer, Luxora is a destination for fragrance connoisseurs. We are dedicated
                to helping you discover scents that express your unique essence and create lasting memories
                with every wear.
              </p>
            </div>
          </div>
        </SiteContainer>
      </PageSection>

      {/* ── Our Values ── */}
      <PageSection>
        <SiteContainer>
          <SectionHeading title="Our Values" />

          <ul className="about-values-grid">
            {VALUES.map((item, i) => (
              <li key={item.title} className="about-value-item">
                {i > 0 && <div className="about-value-divider hidden lg:block" aria-hidden />}
                <div className="about-value-icon">{item.icon}</div>
                <p className="about-value-title">{item.title}</p>
                <p className="about-value-desc">{item.desc}</p>
              </li>
            ))}
          </ul>
        </SiteContainer>
      </PageSection>

      {/* ── By The Numbers ── */}
      <PageSection>
        <SiteContainer>
          <SectionHeading title="By The Numbers" />

          <div className="about-stats-panel">
            <ul className="about-stats-grid">
              {STATS.map((stat, i) => (
                <li key={stat.label} className="about-stat-item">
                  {i > 0 && <div className="about-stat-divider hidden lg:block" aria-hidden />}
                  <p className="about-stat-value font-serif">{stat.value}</p>
                  <p className="about-stat-label">{stat.label}</p>
                </li>
              ))}
            </ul>
          </div>
        </SiteContainer>
      </PageSection>

      {/* ── Service bar ── */}
      <section className="about-service-bar" aria-label="Store services">
        <SiteContainer>
          <ul className="about-service-grid">
            {SERVICES.map((item, i) => (
              <li key={item.title} className="about-service-item">
                {i > 0 && <div className="about-service-divider hidden lg:block" aria-hidden />}
                <div className="about-service-icon">{item.icon}</div>
                <div>
                  <p className="about-service-title">{item.title}</p>
                  <p className="about-service-sub">{item.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </SiteContainer>
      </section>
    </div>
  );
}
