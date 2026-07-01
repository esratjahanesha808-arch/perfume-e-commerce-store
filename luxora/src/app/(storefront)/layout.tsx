import type { Metadata } from "next";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Luxora — Luxury Perfume",
  description:
    "Discover the world's finest luxury perfumes. Curated niche fragrances for the discerning connoisseur.",
};

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full min-w-0 overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
}
