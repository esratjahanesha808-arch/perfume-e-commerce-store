import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserAddresses } from "@/services/user.service";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { AddressManager } from "@/components/dashboard/AddressManager";

export const metadata: Metadata = {
  title: "My Addresses — Luxora",
};

export const dynamic = "force-dynamic";

export default async function DashboardAddressesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const addresses = await getUserAddresses(session.user.id);

  return (
    <>
      <DashboardPageHeader
        title="Addresses"
        subtitle="Save shipping addresses for faster checkout."
      />
      <AddressManager initialAddresses={addresses} />
    </>
  );
}
