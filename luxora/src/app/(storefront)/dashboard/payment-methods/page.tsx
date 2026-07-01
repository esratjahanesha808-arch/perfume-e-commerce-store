import { Metadata } from "next";
import Link from "next/link";
import { CreditCard, ShieldCheck } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";

export const metadata: Metadata = {
  title: "Payment Methods — Luxora",
};

export default function DashboardPaymentMethodsPage() {
  return (
    <>
      <DashboardPageHeader
        title="Payment Methods"
        subtitle="Secure payments powered by Stripe at checkout."
      />

      <div className="dashboard-panel dashboard-payment-info">
        <div className="dashboard-payment-icon-wrap">
          <CreditCard size={24} aria-hidden="true" />
        </div>
        <h2 className="dashboard-panel-title">Checkout Payments</h2>
        <p className="dashboard-panel-subtitle">
          Luxora uses Stripe&apos;s secure embedded checkout. Card details are entered on our
          payment page and are never stored on Luxora servers.
        </p>

        <ul className="dashboard-payment-features">
          <li>
            <ShieldCheck size={16} aria-hidden="true" />
            PCI-compliant payment processing
          </li>
          <li>
            <ShieldCheck size={16} aria-hidden="true" />
            Visa, Mastercard, Amex, and digital wallets
          </li>
          <li>
            <ShieldCheck size={16} aria-hidden="true" />
            3D Secure authentication when required
          </li>
        </ul>

        <Link href="/shop" className="dashboard-primary-btn">
          Shop & Checkout Securely
        </Link>
      </div>
    </>
  );
}
