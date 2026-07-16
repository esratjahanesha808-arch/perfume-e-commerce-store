"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/shared/ProductCard";
import { SidebarFilters } from "@/components/shop/SidebarFilters";
import { Pagination } from "@/components/shared/Pagination";
import type { ShopProduct } from "@/lib/serialize-product";

const CATEGORIES_LIST = [
  "All Perfumes",
  "Women",
  "Men",
  "Unisex",
  "Gift Sets",
];

interface ShopPageClientProps {
  products: ShopProduct[];
  brandsList: string[];
  concentrationsList: string[];
  maxPrice: number;
  initialBrand?: string;
  initialSearchQuery?: string;
}

export function ShopPageClient({
  products,
  brandsList,
  concentrationsList,
  maxPrice,
  initialBrand,
  initialSearchQuery,
}: ShopPageClientProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All Perfumes");
  const [globalSearchQuery, setGlobalSearchQuery] = useState(initialSearchQuery || "");
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    initialBrand ? [initialBrand] : []
  );
  const [priceRange, setPriceRange] = useState(maxPrice);
  const [selectedConcentrations, setSelectedConcentrations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const itemsPerPage = 6;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPriceRange(maxPrice);
  }, [maxPrice]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [selectedCategory, selectedBrands, brandSearchQuery, globalSearchQuery, priceRange, selectedConcentrations, sortBy]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (selectedCategory !== "All Perfumes") {
          if (selectedCategory === "Gift Sets") {
            return product.price > 300;
          }
          if (product.category !== selectedCategory) return false;
        }

        if (selectedBrands.length > 0) {
          const matchesBrand = selectedBrands.some(
            (b) => b.toUpperCase() === product.brand.toUpperCase()
          );
          if (!matchesBrand) return false;
        }

        if (brandSearchQuery.trim() !== "") {
          if (!product.brand.toLowerCase().includes(brandSearchQuery.toLowerCase())) {
            return false;
          }
        }

        if (globalSearchQuery.trim() !== "") {
          const query = globalSearchQuery.toLowerCase();
          if (
            !product.name.toLowerCase().includes(query) &&
            !product.brand.toLowerCase().includes(query) &&
            !(product.description && product.description.toLowerCase().includes(query))
          ) {
            return false;
          }
        }

        if (product.price > priceRange) return false;

        if (selectedConcentrations.length > 0) {
          const matchesConcentration = selectedConcentrations.some(
            (c) => c.toUpperCase() === product.concentration.toUpperCase()
          );
          if (!matchesConcentration) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "popularity") return b.reviews - a.reviews;
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0;
      });
  }, [
    products,
    selectedCategory,
    selectedBrands,
    brandSearchQuery,
    globalSearchQuery,
    priceRange,
    selectedConcentrations,
    sortBy,
  ]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const filteredBrandsList = useMemo(() => {
    return brandsList.filter((brand) =>
      brand.toLowerCase().includes(brandSearchQuery.toLowerCase())
    );
  }, [brandsList, brandSearchQuery]);

  const hasActiveFilters =
    selectedCategory !== "All Perfumes" ||
    selectedBrands.length > 0 ||
    priceRange < maxPrice ||
    selectedConcentrations.length > 0 ||
    globalSearchQuery.trim() !== "";

  const handleBrandToggle = (brandName: string) => {
    setSelectedBrands((prev) => {
      const upperBrand = brandName.toUpperCase();
      return prev.includes(upperBrand)
        ? prev.filter((b) => b !== upperBrand)
        : [...prev, upperBrand];
    });
  };

  const handleConcentrationToggle = (conc: string) => {
    setSelectedConcentrations((prev) =>
      prev.includes(conc) ? prev.filter((c) => c !== conc) : [...prev, conc]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory("All Perfumes");
    setSelectedBrands([]);
    setPriceRange(maxPrice);
    setSelectedConcentrations([]);
    setSortBy("popularity");
    setBrandSearchQuery("");
    setGlobalSearchQuery("");
    if (initialBrand || initialSearchQuery) {
      router.replace("/shop");
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F5F5] font-sans antialiased pb-36">
      <div className="site-container pt-[var(--sp-8)]">
        <div className="shop-page-header">
          <div>
            <h1 className="!text-lg md:!text-xl !font-medium !leading-tight !tracking-[0.14em] !text-[#D9CEBD] uppercase mb-2">
              Shop
            </h1>
            <nav className="flex items-center gap-2 text-[11px] tracking-wider text-[#8A8A8A] uppercase mb-4">
              <Link href="/" className="hover:text-[#C8A96B] transition-colors duration-150">
                Home
              </Link>
              <span>&gt;</span>
              <span className="text-[#C8A96B]">Shop</span>
            </nav>
            {globalSearchQuery && (
              <div className="flex items-center gap-2 inline-flex bg-[#111111] px-3 py-1.5 rounded-sm border border-[rgba(200,169,107,0.3)]">
                <span className="text-[11px] text-[#A1A1A1] uppercase tracking-widest">Search: <span className="text-[#F5F5F5] font-medium">{globalSearchQuery}</span></span>
                <button onClick={() => {
                  setGlobalSearchQuery("");
                  if (initialSearchQuery) router.push("/shop");
                }} className="ml-2 hover:text-[#C8A96B] text-[#A1A1A1] transition-colors"><X size={12} /></button>
              </div>
            )}
          </div>
        </div>

        <div className="shop-page-layout">
          <aside className="shop-filter-panel hidden lg:block w-[272px] shrink-0 sticky top-24">
            <div className="shop-filter-header">
              <p className="shop-filter-header-title">Filters</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="shop-filter-reset"
                >
                  Reset All
                </button>
              )}
            </div>

            <SidebarFilters
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              brandSearchQuery={brandSearchQuery}
              setBrandSearchQuery={setBrandSearchQuery}
              selectedBrands={selectedBrands}
              handleBrandToggle={handleBrandToggle}
              filteredBrandsList={filteredBrandsList}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedConcentrations={selectedConcentrations}
              handleConcentrationToggle={handleConcentrationToggle}
              categoriesList={CATEGORIES_LIST}
              concentrationsList={concentrationsList}
              maxPrice={maxPrice}
            />
          </aside>

          <div className="shop-page-main flex-1 min-w-0">
            <div className="shop-results-toolbar">
              <span className="text-xs tracking-widest text-[#A1A1A1] uppercase">
                Showing{" "}
                {filteredProducts.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}
                -{Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{" "}
                {filteredProducts.length} results
              </span>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="relative flex items-center gap-3">
                  <span className="text-xs tracking-widest text-[#A1A1A1] uppercase whitespace-nowrap">
                    Sort by:
                  </span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-[#111111] border border-[rgba(200,169,107,0.2)] text-xs text-[#F5F5F5] py-2.5 pl-4 pr-10 rounded-md tracking-wider uppercase focus:outline-none focus:border-[#C8A96B] cursor-pointer transition-colors duration-200"
                    >
                      <option value="popularity">Popularity</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating">Customer Rating</option>
                    </select>
                    <ChevronDown
                      size={13}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C8A96B] pointer-events-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-[#111111] border border-[rgba(200,169,107,0.2)] text-xs text-[#F5F5F5] px-4 py-2.5 rounded-md tracking-widest uppercase hover:border-[#C8A96B] transition-colors duration-200"
                >
                  <SlidersHorizontal size={14} className="text-[#C8A96B]" />
                  Filters
                </button>
              </div>
            </div>

            {paginatedProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center bg-[#111111] border border-[rgba(200,169,107,0.1)] rounded-lg px-4"
              >
                <SlidersHorizontal size={40} className="text-[#C8A96B] mb-4 opacity-40" />
                <h3 className="font-serif text-lg tracking-wider text-[#F5F5F5] mb-2">
                  No Products Found
                </h3>
                <p className="text-sm text-[#A1A1A1] max-w-md mb-6">
                  We couldn&apos;t find any fragrances matching your current filter criteria. Try
                  resetting filters or adjusting your price range.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-transparent border border-[#C8A96B] text-xs font-bold tracking-widest text-[#C8A96B] uppercase hover:bg-[#C8A96B] hover:text-[#090909] transition-all duration-300 rounded-sm"
                >
                  Reset All Filters
                </button>
              </motion.div>
            ) : (
              <div className="shop-product-grid-wrap">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  <AnimatePresence mode="popLayout">
                    {paginatedProducts.map((product, idx) => {
                      const mappedProduct = {
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        shortDesc: product.description,
                        price: product.price,
                        comparePrice: product.comparePrice,
                        volume: null,
                        avgRating: product.rating,
                        reviewCount: product.reviews,
                        brand: { name: product.brand },
                        images: [{ url: product.image, altText: product.name }],
                      };

                      return (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.33, 1, 0.68, 1] }}
                        >
                          <ProductCard product={mappedProduct} badge={product.badge} />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="shop-filter-drawer fixed right-0 top-0 bottom-0 z-50"
            >
              <div className="shop-filter-drawer-header">
                <p className="shop-filter-header-title">Filters</p>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(200,169,107,0.15)] text-[#A1A1A1] transition-colors duration-150 hover:text-[#C8A96B]"
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="shop-filter-drawer-body">
                <SidebarFilters
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  brandSearchQuery={brandSearchQuery}
                  setBrandSearchQuery={setBrandSearchQuery}
                  selectedBrands={selectedBrands}
                  handleBrandToggle={handleBrandToggle}
                  filteredBrandsList={filteredBrandsList}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  selectedConcentrations={selectedConcentrations}
                  handleConcentrationToggle={handleConcentrationToggle}
                  categoriesList={CATEGORIES_LIST}
                  concentrationsList={concentrationsList}
                  maxPrice={maxPrice}
                />
              </div>

              <div className="shop-filter-drawer-footer">
                <button
                  onClick={() => {
                    handleResetFilters();
                    setIsSidebarOpen(false);
                  }}
                  className="flex-1 py-3 border border-[rgba(200,169,107,0.2)] text-xs font-bold tracking-widest text-[#A1A1A1] uppercase hover:text-[#C8A96B] transition-colors duration-150 rounded-sm"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex-1 py-3 bg-[#C8A96B] text-[#090909] text-xs font-bold tracking-widest uppercase hover:bg-[#D7B45D] transition-colors duration-150 rounded-sm shadow-md"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
