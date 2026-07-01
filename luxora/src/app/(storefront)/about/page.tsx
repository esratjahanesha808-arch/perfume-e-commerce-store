import type { Metadata } from "next";
import { AboutPageContent } from "@/components/about/AboutPageContent";

export const metadata: Metadata = {
  title: "About Us — Luxora",
  description:
    "Discover the story behind Luxora — curating the world's finest luxury fragrances with authenticity, quality, and trust.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
