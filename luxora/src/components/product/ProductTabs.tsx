"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ProductTab } from "@/types/product";
import type { ScentNotes } from "@/types/product";

interface ProductTabsProps {
  activeTab: ProductTab;
  onTabChange: (tab: ProductTab) => void;
  description: string;
  scentNotes: ScentNotes | null;
  ingredients: string;
  shippingText: string;
}

const TABS: { id: ProductTab; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "notes", label: "Notes" },
  { id: "ingredients", label: "Ingredients" },
  { id: "shipping", label: "Shipping & Returns" },
];

export function ProductTabs({
  activeTab,
  onTabChange,
  description,
  scentNotes,
  ingredients,
  shippingText,
}: ProductTabsProps) {
  return (
    <div className="w-full">
      <div
        className="flex flex-wrap gap-x-4 gap-y-1 sm:gap-x-6 md:gap-x-10 border-b border-[rgba(200,169,107,0.12)] overflow-x-auto hide-scrollbar"
        role="tablist"
        aria-label="Product information"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`text-[11px] md:text-xs tracking-[0.22em] uppercase font-bold px-1 py-5 md:py-6 border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap -mb-px ${
                isActive
                  ? "text-[#C8A96B] border-[#C8A96B]"
                  : "text-[#A1A1A1] border-transparent hover:text-[#F5F5F5]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="pt-10 md:pt-12 pb-2 min-h-[120px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="pdp-stack"
          >
            {activeTab === "description" && (
              <p className="text-sm md:text-[15px] text-[#A1A1A1] leading-[1.85] max-w-3xl">
                {description}
              </p>
            )}

            {activeTab === "notes" && scentNotes && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl">
                {(
                  [
                    ["Top Notes", scentNotes.top],
                    ["Heart Notes", scentNotes.middle],
                    ["Base Notes", scentNotes.base],
                  ] as const
                ).map(([title, notes]) => (
                  <div key={title} className="stack-gap-sm">
                    <h5 className="text-xs font-bold text-[#C8A96B] tracking-[0.2em] uppercase">
                      {title}
                    </h5>
                    <ul className="stack-gap-sm">
                      {notes.map((note) => (
                        <li key={note} className="text-sm md:text-[15px] text-[#A1A1A1]">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "notes" && !scentNotes && (
              <p className="text-sm md:text-[15px] text-[#A1A1A1] leading-[1.85] max-w-3xl">
                Scent notes for this fragrance will be available soon.
              </p>
            )}

            {activeTab === "ingredients" && (
              <p className="text-sm md:text-[15px] text-[#A1A1A1] leading-[1.85] max-w-3xl italic">
                {ingredients}
              </p>
            )}

            {activeTab === "shipping" && (
              <p className="text-sm md:text-[15px] text-[#A1A1A1] leading-[1.85] max-w-3xl">
                {shippingText}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
