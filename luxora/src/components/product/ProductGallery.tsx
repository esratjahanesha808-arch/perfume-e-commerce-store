"use client";

import { useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import type { ProductImage } from "@/types/product";
import { getGalleryImageSrc } from "@/lib/product-images";

const CARD_BG = "rgba(210, 192, 170, 1)";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  slug?: string;
}

export function ProductGallery({ images, productName, slug }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = images[selectedIndex] ?? images[0];
  const src = (url: string) => getGalleryImageSrc(url, productName, slug);

  const goNext = () => setSelectedIndex((i) => Math.min(images.length - 1, i + 1));
  const goPrev = () => setSelectedIndex((i) => Math.max(0, i - 1));

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -48) goNext();
    else if (info.offset.x > 48) goPrev();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
      className="w-full min-w-0 max-w-full"
    >
      {/* Desktop: thumbnails + main — only when hero is side-by-side (xl+) */}
      <div className="hidden xl:flex flex-row gap-5 2xl:gap-8 min-w-0 max-w-full">
        <div className="flex flex-col gap-3 md:gap-4 shrink-0" role="tablist" aria-label="Product images">
          {images.map((img, index) => {
            const isActive = index === selectedIndex;
            return (
              <button
                key={img.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`View image ${index + 1}`}
                onClick={() => setSelectedIndex(index)}
                className={`w-16 h-20 xl:w-20 xl:h-24 rounded-md bg-[#111111] border overflow-hidden flex items-center justify-center p-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "border-[#C8A96B] shadow-[0_0_12px_rgba(200,169,107,0.15)]"
                    : "border-[rgba(200,169,107,0.15)] hover:border-[#C8A96B]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src(img.url)}
                  alt=""
                  className="max-w-full max-h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
                />
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-w-0 max-w-full">
          <div
            className="aspect-square w-full max-w-full min-h-0 xl:min-h-[480px] 2xl:min-h-[580px] rounded-xl flex items-center justify-center p-10 xl:p-14 2xl:p-16 relative overflow-hidden group"
            style={{ background: CARD_BG }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={selected.url}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.35 }}
                src={src(selected.url)}
                alt={selected.altText || productName}
                className="max-w-full max-h-full object-contain drop-shadow-[0_16px_32px_rgba(54,44,29,0.25)] transition-transform duration-500 group-hover:scale-[1.05]"
              />
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Tablet + mobile: full-width swipe gallery (stacked hero) */}
      <div className="xl:hidden w-full min-w-0 max-w-full">
        <motion.div
          className="aspect-square w-full max-w-full rounded-xl flex items-center justify-center p-8 sm:p-10 relative overflow-hidden touch-pan-y"
          style={{ background: CARD_BG }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={handleDragEnd}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={selected.url}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.3 }}
              src={src(selected.url)}
              alt={selected.altText || productName}
              draggable={false}
              className="max-w-full max-h-full object-contain drop-shadow-[0_12px_24px_rgba(54,44,29,0.2)] pointer-events-none select-none"
            />
          </AnimatePresence>
        </motion.div>
        <div className="flex items-center justify-center gap-2 mt-4">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              aria-label={`Go to image ${index + 1}`}
              onClick={() => setSelectedIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                index === selectedIndex
                  ? "w-6 bg-[#C8A96B]"
                  : "w-1.5 bg-[rgba(200,169,107,0.25)]"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
