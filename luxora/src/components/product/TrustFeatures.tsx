"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Truck, RotateCcw, Lock } from "lucide-react";

const FEATURES = [
  { icon: ShieldCheck, title: "100% Authentic", subtitle: "Original & Trusted" },
  { icon: Truck, title: "Fast Delivery", subtitle: "Worldwide Shipping" },
  { icon: RotateCcw, title: "Easy Returns", subtitle: "14 Day Returns" },
  { icon: Lock, title: "Secure Payment", subtitle: "Protected Checkout" },
] as const;

/** Matches Homepage member-offers / benefits card layout */
export function TrustFeatures() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
      className="w-full"
      aria-label="Trust features"
    >
      <div
        className="w-full"
        style={{
          backgroundColor: "rgba(22,22,22,1)",
          border: "1px solid rgba(109,110,108,0.2)",
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="relative pdp-content-card pdp-icon-row text-left"
              >
                {index > 0 && (
                  <div
                    className="hidden lg:block absolute left-0 w-px"
                    style={{
                      top: "50%",
                      transform: "translateY(-50%)",
                      height: "55%",
                      backgroundColor: "rgba(109,110,108,0.22)",
                    }}
                  />
                )}
                {index > 0 && (
                  <div
                    className="block sm:hidden absolute top-0 left-6 right-6 h-px"
                    style={{ backgroundColor: "rgba(109,110,108,0.15)" }}
                  />
                )}
                <div className="shrink-0 mt-0.5 text-[#AC7D45]">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p
                    className="font-bold uppercase mb-2"
                    style={{
                      color: "rgba(172,125,69,1)",
                      fontSize: "10px",
                      letterSpacing: "0.18em",
                      lineHeight: 1.4,
                    }}
                  >
                    {feature.title}
                  </p>
                  <p
                    style={{
                      color: "rgba(109,110,108,1)",
                      fontSize: "11px",
                      lineHeight: 1.65,
                    }}
                  >
                    {feature.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
