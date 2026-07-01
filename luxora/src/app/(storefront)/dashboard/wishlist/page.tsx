import { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { WishlistDashboardPanel } from "@/components/dashboard/WishlistDashboardPanel";

export const metadata: Metadata = {
  title: "My Wishlist — Luxora",
};

export default function DashboardWishlistPage() {
  return (
    <>
      <DashboardPageHeader
        title="Wishlist"
        subtitle="Your saved fragrances, ready whenever you are."
      />
      <WishlistDashboardPanel />
    </>
  );
}
