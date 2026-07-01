"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface BreadcrumbProps {
  brand: string;
  brandSlug?: string;
  productName: string;
}

export function Breadcrumb({ brand, brandSlug, productName }: BreadcrumbProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[10px] tracking-[0.2em] uppercase font-semibold"
    >
      <Link
        href="/"
        className="text-[#A1A1A1] hover:text-[#C8A96B] transition-colors duration-200"
      >
        Home
      </Link>
      <span className="text-[#6B6B6B]" aria-hidden>
        &gt;
      </span>
      <Link
        href="/shop"
        className="text-[#A1A1A1] hover:text-[#C8A96B] transition-colors duration-200"
      >
        Shop
      </Link>
      <span className="text-[#6B6B6B]" aria-hidden>
        &gt;
      </span>
      {brandSlug ? (
        <Link
          href={`/shop?brand=${brandSlug}`}
          className="text-[#A1A1A1] hover:text-[#C8A96B] transition-colors duration-200"
        >
          {brand}
        </Link>
      ) : (
        <span className="text-[#A1A1A1]">{brand}</span>
      )}
      <span className="text-[#6B6B6B]" aria-hidden>
        &gt;
      </span>
      <span className="text-[#C8A96B] break-words">{productName}</span>
    </motion.nav>
  );
}
