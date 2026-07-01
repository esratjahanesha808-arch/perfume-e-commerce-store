"use client";

import { motion } from "framer-motion";
import { Search, Check } from "lucide-react";

interface SidebarFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  brandSearchQuery: string;
  setBrandSearchQuery: (q: string) => void;
  selectedBrands: string[];
  handleBrandToggle: (brand: string) => void;
  filteredBrandsList: string[];
  priceRange: number;
  setPriceRange: (range: number) => void;
  selectedConcentrations: string[];
  handleConcentrationToggle: (conc: string) => void;
  categoriesList: string[];
  concentrationsList: string[];
  maxPrice?: number;
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div className="shop-filter-checkbox">
      {checked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0.5 flex items-center justify-center rounded-sm bg-[#C8A96B]"
        >
          <Check size={10} className="text-[#090909] stroke-[3]" />
        </motion.div>
      )}
    </div>
  );
}

export function SidebarFilters({
  selectedCategory,
  setSelectedCategory,
  brandSearchQuery,
  setBrandSearchQuery,
  selectedBrands,
  handleBrandToggle,
  filteredBrandsList,
  priceRange,
  setPriceRange,
  selectedConcentrations,
  handleConcentrationToggle,
  categoriesList,
  concentrationsList,
  maxPrice = 500,
}: SidebarFiltersProps) {
  const minPrice = 50;
  const priceSpan = Math.max(maxPrice - minPrice, 1);
  const pricePercent = ((priceRange - minPrice) / priceSpan) * 100;

  return (
    <div className="shop-filter-stack">
      <section className="shop-filter-section">
        <h3 className="shop-filter-title">Categories</h3>
        <ul className="shop-filter-options">
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <li key={cat}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shop-filter-option ${isActive ? "shop-filter-option-active" : "shop-filter-option-inactive"}`}
                >
                  {cat}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="shop-filter-section">
        <h3 className="shop-filter-title">Brand</h3>

        <div className="shop-filter-search">
          <input
            type="text"
            placeholder="Search brands..."
            value={brandSearchQuery}
            onChange={(e) => setBrandSearchQuery(e.target.value)}
            className="shop-filter-search-input"
          />
          <Search size={16} className="shop-filter-search-icon" />
        </div>

        <div className="shop-filter-brand-list brand-scrollbar">
          <ul className="shop-filter-options">
            {filteredBrandsList.length === 0 ? (
              <li className="shop-filter-empty">No brands found</li>
            ) : (
              filteredBrandsList.map((brand) => {
                const isChecked = selectedBrands.includes(brand.toUpperCase());
                return (
                  <li key={brand}>
                    <button
                      type="button"
                      onClick={() => handleBrandToggle(brand)}
                      className={`shop-filter-option ${isChecked ? "shop-filter-option-active" : "shop-filter-option-inactive"}`}
                    >
                      <Checkbox checked={isChecked} />
                      <span className="truncate uppercase tracking-[0.06em]">{brand}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </section>

      <section className="shop-filter-section">
        <h3 className="shop-filter-title">Price Range</h3>
        <div className="shop-filter-price">
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step="10"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-lg border border-[rgba(200,169,107,0.15)] bg-[#090909] accent-[#C8A96B]"
            style={{
              background: `linear-gradient(to right, #C8A96B 0%, #C8A96B ${pricePercent}%, #090909 ${pricePercent}%, #090909 100%)`,
            }}
          />
          <div className="shop-filter-price-labels">
            <span className="shop-filter-price-tag">${minPrice}</span>
            <span className="shop-filter-price-tag shop-filter-price-tag-active">
              ${priceRange >= maxPrice ? `${maxPrice}+` : priceRange}
            </span>
          </div>
        </div>
      </section>

      <section className="shop-filter-section">
        <h3 className="shop-filter-title">Concentration</h3>
        <ul className="shop-filter-options">
          {concentrationsList.map((conc) => {
            const isChecked = selectedConcentrations.includes(conc);
            return (
              <li key={conc}>
                <button
                  type="button"
                  onClick={() => handleConcentrationToggle(conc)}
                  className={`shop-filter-option ${isChecked ? "shop-filter-option-active" : "shop-filter-option-inactive"}`}
                >
                  <Checkbox checked={isChecked} />
                  <span className="truncate uppercase tracking-[0.06em]">{conc}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
