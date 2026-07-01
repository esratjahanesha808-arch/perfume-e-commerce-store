"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Heart, Plus, Minus, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { ProductCard } from "@/components/shared/ProductCard";

interface ProductDetailsClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDesc: string | null;
    description: string | null;
    price: number;
    comparePrice: number | null;
    volume: string | null;
    avgRating: number;
    reviewCount: number;
    scentNotes: {
      top: string[];
      middle: string[];
      base: string[];
    } | null;
    attributes: {
      gender?: string;
      season?: string[];
      intensity?: string;
      longevity?: string;
      sillage?: string;
    } | null;
    brand: { name: string; slug: string } | null;
    category: { name: string; slug: string } | null;
    images: { id: string; url: string; altText: string | null; isPrimary: boolean }[];
    inventory: { quantity: number; reserved: number } | null;
  };
  relatedProducts: any[];
}

export function ProductDetailsClient({ product, relatedProducts }: ProductDetailsClientProps) {
  const isAventus = product.slug === "creed-aventus";

  const displayName = isAventus ? "Aventus" : product.name;
  const displayBrand = isAventus ? "CREED" : (product.brand?.name || "LUXORA");
  const displayPrice = isAventus ? 325.0 : Number(product.price);
  const displayReviewCount = isAventus ? 112 : product.reviewCount;
  const displayRating = isAventus ? 5.0 : Number(product.avgRating);
  const displayDesc = isAventus
    ? "A bold and sophisticated fragrance for the modern man. Fresh, fruity and woody notes create an unforgettable scent."
    : (product.shortDesc || product.description || "");

  const displayImages = isAventus
    ? [
        {
          id: "av-1",
          url: "https://cdn11.bigcommerce.com/s-ph0qpmxksl/images/stencil/1280x1280/products/4817/16725/Untitled_design_-_2025-12-30T180917.751__67780.1767082275.png?c=1",
          altText: "Creed Aventus Eau de Parfum 100ml",
        },
        {
          id: "av-2",
          url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop",
          altText: "Creed Aventus Detail View",
        },
        {
          id: "av-3",
          url: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop",
          altText: "Creed Aventus Lifestyle View",
        },
      ]
    : product.images.length > 0
    ? product.images
    : [
        {
          id: "placeholder",
          url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop",
          altText: product.name,
        },
      ];

  const sizes = isAventus ? ["50ml", "100ml", "250ml"] : [product.volume || "100ml"];

  const [selectedImage, setSelectedImage] = useState(displayImages[0].url);
  const [selectedSize, setSelectedSize] = useState(isAventus ? "100ml" : sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "notes" | "ingredients" | "shipping">("description");
  const [isWishlisted, setIsWishlisted] = useState(false);

  const getAdjustedPrice = () => {
    if (!isAventus) return displayPrice;
    if (selectedSize === "50ml") return 225.0;
    if (selectedSize === "250ml") return 650.0;
    return 325.0;
  };

  const currentPrice = getAdjustedPrice();

  const handleAddToCart = () => {
    toast.success(`Added ${quantity} x ${displayName} (${selectedSize}) to your cart.`, {
      style: {
        background: "#111111",
        color: "#C8A96B",
        border: "1px solid rgba(200,169,107,0.15)",
      },
    });
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success(`Added ${displayName} to your wishlist.`, {
        style: {
          background: "#111111",
          color: "#C8A96B",
          border: "1px solid rgba(200,169,107,0.15)",
        },
      });
    } else {
      toast.success(`Removed ${displayName} from your wishlist.`, {
        style: {
          background: "#111111",
          color: "#C8A96B",
          border: "1px solid rgba(200,169,107,0.15)",
        },
      });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 pt-8">
      <nav className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-[#A1A1A1] uppercase font-semibold mb-10">
        <Link href="/" className="hover:text-[#C8A96B] transition-colors duration-150">
          Home
        </Link>
        <span className="text-[#6B6B6B]">&gt;</span>
        <Link href="/shop" className="hover:text-[#C8A96B] transition-colors duration-150">
          Shop
        </Link>
        <span className="text-[#6B6B6B]">&gt;</span>
        <span className="text-[#6B6B6B]">{displayBrand}</span>
        <span className="text-[#6B6B6B]">&gt;</span>
        <span className="text-[#C8A96B]">{displayName}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-7 flex flex-row gap-6">
          <div className="flex flex-col gap-4 shrink-0">
            {displayImages.map((img) => {
              const isActive = selectedImage === img.url;
              return (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-16 h-20 rounded-md bg-[#111111] border overflow-hidden flex items-center justify-center p-2 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "border-[#C8A96B] shadow-[0_0_12px_rgba(200,169,107,0.15)]"
                      : "border-[rgba(200,169,107,0.15)] hover:border-[#C8A96B]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.altText || displayName}
                    className="max-w-full max-h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
                  />
                </button>
              );
            })}
          </div>

          <div className="flex-1 aspect-square bg-[#F3EFE6] rounded-xl flex items-center justify-center p-12 relative overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt={displayName}
              className="max-w-full max-h-full object-contain filter drop-shadow-[0_16px_32px_rgba(54,44,29,0.25)] transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="space-y-2">
            <h1 className="font-serif text-[2.5rem] leading-tight tracking-wide text-[#F3EFE6] uppercase">
              {displayName}
            </h1>
            <p className="text-xs tracking-[0.25em] text-[#C8A96B] uppercase font-bold">
              {displayBrand}
            </p>
          </div>

          <div className="flex items-center gap-1.5 mt-4">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.floor(displayRating)
                      ? "text-[#C8A96B] fill-[#C8A96B]"
                      : "text-[rgba(200,169,107,0.25)]"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-[#A1A1A1] font-medium pl-1.5">
              ({displayReviewCount} reviews)
            </span>
          </div>

          <div className="flex items-center justify-between mt-6 border-b border-[rgba(200,169,107,0.12)] pb-6">
            <span className="text-3xl font-semibold text-[#F5F5F5] tracking-wide">
              {formatPrice(currentPrice)}
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-emerald-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              in stock
            </span>
          </div>

          <p className="text-sm text-[#A1A1A1] leading-relaxed mt-6 font-medium">
            {displayDesc}
          </p>

          <div className="mt-8">
            <h4 className="text-[10px] tracking-[0.25em] text-[#C8A96B] uppercase font-bold mb-3">
              Size
            </h4>
            <div className="flex gap-3">
              {sizes.map((size) => {
                const isActive = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 rounded-md text-xs tracking-widest uppercase font-semibold border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[rgba(172,125,69,0.15)] text-[#C8A96B] border-[#C8A96B]"
                        : "bg-[#111111] text-[#A1A1A1] border-[rgba(200,169,107,0.15)] hover:border-[#C8A96B] hover:text-[#F5F5F5]"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-[10px] tracking-[0.25em] text-[#C8A96B] uppercase font-bold mb-3">
              Quantity
            </h4>
            <div className="flex items-center bg-[#111111] border border-[rgba(200,169,107,0.15)] rounded-md w-fit overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-[#A1A1A1] hover:text-[#C8A96B] hover:bg-[rgba(172,125,69,0.05)] transition-colors duration-150 cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus size={12} />
              </button>
              <span className="w-12 text-center text-xs font-bold text-[#F5F5F5]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-[#A1A1A1] hover:text-[#C8A96B] hover:bg-[rgba(172,125,69,0.05)] transition-colors duration-150 cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button
              onClick={handleAddToCart}
              className="flex-1 h-14 bg-[#C8A96B] hover:bg-[#D7B45D] text-[#090909] font-bold text-xs tracking-[0.2em] uppercase transition-all duration-300 rounded-md shadow-lg shadow-[rgba(200,169,107,0.1)] cursor-pointer active:scale-[0.98]"
            >
              Add to Cart
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`w-14 h-14 rounded-md border flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                isWishlisted
                  ? "bg-[rgba(172,125,69,0.15)] border-[#C8A96B] text-[#C8A96B]"
                  : "bg-[#111111] border-[rgba(200,169,107,0.15)] text-[#A1A1A1] hover:border-[#C8A96B] hover:text-[#C8A96B]"
              }`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={18} className={isWishlisted ? "fill-[#C8A96B]" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-t border-b border-[rgba(200,169,107,0.12)] mt-20">
        <div className="flex items-center gap-4 px-4">
          <div className="w-12 h-12 rounded-full bg-[rgba(172,125,69,0.1)] border border-[rgba(200,169,107,0.15)] flex items-center justify-center text-[#C8A96B] shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div className="text-left">
            <h5 className="text-xs font-bold tracking-wider text-[#F5F5F5] uppercase">100% Authentic</h5>
            <p className="text-[10px] tracking-wide text-[#A1A1A1] uppercase mt-0.5 font-semibold">Original & Trusted</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-4 border-y md:border-y-0 md:border-x border-[rgba(200,169,107,0.12)] py-6 md:py-0">
          <div className="w-12 h-12 rounded-full bg-[rgba(172,125,69,0.1)] border border-[rgba(200,169,107,0.15)] flex items-center justify-center text-[#C8A96B] shrink-0">
            <Truck size={20} />
          </div>
          <div className="text-left">
            <h5 className="text-xs font-bold tracking-wider text-[#F5F5F5] uppercase">Fast Delivery</h5>
            <p className="text-[10px] tracking-wide text-[#A1A1A1] uppercase mt-0.5 font-semibold">Worldwide Shipping</p>
          </div>
        </div>

        <div className="flex items-center gap-4 px-4">
          <div className="w-12 h-12 rounded-full bg-[rgba(172,125,69,0.1)] border border-[rgba(200,169,107,0.15)] flex items-center justify-center text-[#C8A96B] shrink-0">
            <RotateCcw size={20} />
          </div>
          <div className="text-left">
            <h5 className="text-xs font-bold tracking-wider text-[#F5F5F5] uppercase">Easy Returns</h5>
            <p className="text-[10px] tracking-wide text-[#A1A1A1] uppercase mt-0.5 font-semibold">14 Day Returns</p>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="flex flex-wrap gap-8 md:gap-12 border-b border-[rgba(200,169,107,0.12)] pb-4">
          {(["description", "notes", "ingredients", "shipping"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const labels = {
              description: "Description",
              notes: "Notes",
              ingredients: "Ingredients",
              shipping: "Shipping & Returns",
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] tracking-[0.25em] uppercase font-bold pb-4 -mb-[18px] transition-all duration-200 border-b-2 cursor-pointer ${
                  isActive
                    ? "text-[#C8A96B] border-[#C8A96B]"
                    : "text-[#A1A1A1] border-transparent hover:text-[#F5F5F5]"
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        <div className="pt-10 text-left">
          {activeTab === "description" && (
            <p className="text-sm text-[#A1A1A1] leading-relaxed max-w-3xl font-medium">
              {isAventus
                ? "Aventus is a legendary fragrance that evades power, success and sophistication. It opens with fresh pineapple and bergamot, followed by a smoky birch and jasmine heart, and settles into a rich base of musk, oakmoss and ambergris."
                : product.description || "No description available."}
            </p>
          )}

          {activeTab === "notes" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl">
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[#C8A96B] tracking-widest uppercase">Top Notes</h5>
                <ul className="space-y-1">
                  {(isAventus
                    ? ["Pineapple", "Bergamot", "Blackcurrant", "Apple"]
                    : product.scentNotes?.top || []
                  ).map((note, idx) => (
                    <li key={idx} className="text-sm text-[#A1A1A1] font-medium">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[#C8A96B] tracking-widest uppercase">Heart Notes</h5>
                <ul className="space-y-1">
                  {(isAventus
                    ? ["Birch", "Patchouli", "Moroccan Jasmine", "Rose"]
                    : product.scentNotes?.middle || []
                  ).map((note, idx) => (
                    <li key={idx} className="text-sm text-[#A1A1A1] font-medium">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[#C8A96B] tracking-widest uppercase">Base Notes</h5>
                <ul className="space-y-1">
                  {(isAventus
                    ? ["Oakmoss", "Musk", "Ambergris", "Vanilla"]
                    : product.scentNotes?.base || []
                  ).map((note, idx) => (
                    <li key={idx} className="text-sm text-[#A1A1A1] font-medium">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "ingredients" && (
            <p className="text-sm text-[#A1A1A1] leading-relaxed max-w-3xl font-medium italic">
              {isAventus
                ? "Alcohol, Parfum (Fragrance), Aqua (Water), Limonene, Linalool, BHT, Citral, Citronellol, Coumarin, Geraniol."
                : "Alcohol Denat., Fragrance (Parfum), Water\\Aqua\\Eau, Linalool, Coumarin, Limonene, Citronellol, Geraniol, Benzyl Benzoate, Citral, Cinnamal."}
            </p>
          )}

          {activeTab === "shipping" && (
            <p className="text-sm text-[#A1A1A1] leading-relaxed max-w-3xl font-medium">
              Complimentary standard shipping on all orders over $99. Standard delivery takes 3-5 business days. Express shipping is available at checkout. Returns are accepted within 14 days of purchase.
            </p>
          )}
        </div>
      </div>

      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-28">
          <h3 className="font-serif text-2xl tracking-widest text-[#F3EFE6] uppercase mb-10 text-center">
            You May Also Like
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
