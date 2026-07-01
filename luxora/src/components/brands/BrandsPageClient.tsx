"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, FlaskConical, ShoppingBag, Users, Star, PackageCheck } from "lucide-react";
import { SiteContainer } from "@/components/shared/SiteContainer";
import { PageSection } from "@/components/shared/PageSection";
import { BrandsPagination } from "@/components/brands/BrandsPagination";
import { getBrandLogo, STATIC_BRANDS, type BrandEntry } from "@/lib/brand-logos";

const BRANDS_PER_PAGE = 9;

const STORY_VALUES = [
  { icon: <ShieldCheck size={20} strokeWidth={1.5} />, title: "AUTHENTICITY", sub: "100% Original Products" },
  { icon: <FlaskConical size={20} strokeWidth={1.5} />, title: "QUALITY", sub: "Finest Ingredients" },
  { icon: <ShoppingBag size={20} strokeWidth={1.5} />, title: "TRUST", sub: "Customer First" },
];

const STATS = [
  { icon: <Users size={22} strokeWidth={1.5} />, value: "10K+", label: "Happy Customers" },
  { icon: <FlaskConical size={22} strokeWidth={1.5} />, value: "250+", label: "Luxury Brands" },
  { icon: <PackageCheck size={22} strokeWidth={1.5} />, value: "50K+", label: "Products Sold" },
  { icon: <Star size={22} strokeWidth={1.5} />, value: "4.9/5", label: "Customer Rating" },
];

interface DbBrand {
  name: string;
  slug: string;
  logoUrl: string | null;
}

interface BrandsPageClientProps {
  dbBrands: DbBrand[];
}

function toBrandEntries(dbBrands: DbBrand[]): BrandEntry[] {
  if (dbBrands.length === 0) return STATIC_BRANDS;

  return dbBrands.map((brand) => ({
    name: brand.name.toUpperCase(),
    slug: brand.slug,
    logo: getBrandLogo(brand.name) ?? (
      brand.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={brand.logoUrl} alt="" className="max-h-10 max-w-[80%] object-contain" />
      ) : (
        <span className="brand-card-fallback">{brand.name.charAt(0)}</span>
      )
    ),
  }));
}

export function BrandsPageClient({ dbBrands }: BrandsPageClientProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const brands = useMemo(() => toBrandEntries(dbBrands), [dbBrands]);
  const totalPages = Math.max(1, Math.ceil(brands.length / BRANDS_PER_PAGE));

  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * BRANDS_PER_PAGE;
    return brands.slice(start, start + BRANDS_PER_PAGE);
  }, [brands, currentPage]);

  return (
    <div className="brands-page w-full min-w-0 overflow-x-clip">
      <PageSection>
        <SiteContainer>
          <header className="brands-page-header">
            <h1 className="brands-page-title font-serif">Brands</h1>
            <p className="brands-page-subtitle">
              Explore the world&apos;s most prestigious fragrance houses and niche perfumers.
            </p>
            <nav className="brands-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden>&gt;</span>
              <span>Brands</span>
            </nav>
          </header>

          <div className="brands-page-layout">
            {/* ── Left: brand grid + pagination ── */}
            <div className="brands-page-main min-w-0">
              <ul className="brands-grid">
                {paginatedBrands.map((brand) => (
                  <li key={brand.slug}>
                    <Link href={`/shop?brand=${encodeURIComponent(brand.slug)}`} className="brands-grid-card">
                      <div className="brands-grid-card-body">
                        <div className="brands-grid-card-logo">{brand.logo}</div>
                        <span className="brands-grid-card-name">{brand.name}</span>
                      </div>
                      <span className="brands-grid-card-link">
                        View Collection
                        <ArrowRight size={12} strokeWidth={2} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <BrandsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>

            {/* ── Right: Our Story hero overlay ── */}
            <aside className="brands-page-aside min-w-0">
              <div className="brands-story-panel">
                <div className="brands-story-image-wrap" aria-hidden="true">
                  <Image
                    src="/images/brands-our-story.png"
                    alt=""
                    fill
                    sizes="(max-width: 1280px) 100vw, 40vw"
                    className="brands-story-image object-cover object-right"
                    priority
                  />
                </div>

                <div className="brands-story-overlay" aria-hidden="true" />

                <div className="brands-story-content">
                  <h2 className="brands-story-title font-serif">Our Story</h2>
                  <p className="brands-story-text">
                    At Luxora, we believe fragrance is more than a scent — it is an expression of identity,
                    memory, and luxury. Our mission is to curate the world&apos;s finest perfumes from iconic
                    houses and emerging niche perfumers.
                  </p>
                  <p className="brands-story-text">
                    Every bottle in our collection is hand-selected for its craftsmanship, authenticity, and
                    ability to tell a story. We are passionate about bringing you closer to the art of perfumery.
                  </p>

                  <ul className="brands-story-values">
                    {STORY_VALUES.map((item) => (
                      <li key={item.title} className="brands-story-value">
                        <div className="brands-story-value-icon">{item.icon}</div>
                        <div>
                          <p className="brands-story-value-title">{item.title}</p>
                          <p className="brands-story-value-sub">{item.sub}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </SiteContainer>
      </PageSection>

      {/* ── Stats bar ── */}
      <section className="brands-stats-bar" aria-label="Store statistics">
        <SiteContainer>
          <ul className="brands-stats-grid">
            {STATS.map((stat, i) => (
              <li key={stat.label} className="brands-stat-item">
                {i > 0 && <div className="brands-stat-divider hidden lg:block" aria-hidden />}
                <div className="brands-stat-icon">{stat.icon}</div>
                <p className="brands-stat-value">{stat.value}</p>
                <p className="brands-stat-label">{stat.label}</p>
              </li>
            ))}
          </ul>
        </SiteContainer>
      </section>
    </div>
  );
}
