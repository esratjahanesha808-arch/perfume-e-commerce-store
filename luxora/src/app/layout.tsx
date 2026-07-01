import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers/Providers";
import { getAppOrigin } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Luxora — Luxury Perfume",
    template: "%s | Luxora",
  },
  description:
    "Discover the world's finest luxury perfumes. Curated scents for the discerning connoisseur.",
  keywords: ["luxury perfume", "fragrance", "niche perfume", "eau de parfum"],
  authors: [{ name: "Luxora" }],
  creator: "Luxora",
  metadataBase: new URL(getAppOrigin()),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Luxora",
    title: "Luxora — Luxury Perfume",
    description: "Discover the world's finest luxury perfumes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxora — Luxury Perfume",
    description: "Discover the world's finest luxury perfumes.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Providers>{children}</Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#161616",
              border: "1px solid #222",
              color: "#f5f5f5",
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}
