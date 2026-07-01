"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { PerfumeBottleSilhouette } from "@/components/shared/PerfumeBottleSilhouette";
import "./dashboard-promo.css";

export function DashboardPromoBanner() {
  const [copied, setCopied] = useState(false);
  const code = "LUXORA15";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Coupon code copied!");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy code.");
    }
  };

  return (
    <section className="dashboard-promo-banner" aria-label="Member promotion">
      <div className="dashboard-promo-visual" aria-hidden="true">
        <PerfumeBottleSilhouette width={90} height={135} opacity={0.18} />
      </div>

      <div className="dashboard-promo-copy">
        <p className="dashboard-promo-kicker">Exclusive For You</p>
        <h2 className="dashboard-promo-title">Enjoy 15% Off</h2>
        <p className="dashboard-promo-text">On your next purchase</p>
        <Link href="/shop" className="dashboard-promo-shop-btn">
          Shop Now
        </Link>
      </div>

      <div className="dashboard-promo-code-card">
        <p className="dashboard-promo-code-label">Your Coupon Code</p>
        <p className="dashboard-promo-code">{code}</p>
        <p className="dashboard-promo-expiry">Valid until Dec 31, 2026</p>
        <button type="button" className="dashboard-promo-copy-btn" onClick={() => void handleCopy()}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy Code"}
        </button>
      </div>
    </section>
  );
}
