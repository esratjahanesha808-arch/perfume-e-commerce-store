import {
  Package,
  DollarSign,
  Users,
  ShoppingBag,
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

type KpiMetric = {
  value: number;
  change: number | null;
};

interface AdminKPICardsProps {
  kpis: {
    totalOrders: KpiMetric;
    totalSales: KpiMetric;
    totalCustomers: KpiMetric;
    totalProducts: KpiMetric;
    averageRating: KpiMetric;
  };
}

const CARDS = [
  { key: "totalOrders" as const, label: "Total Orders", icon: Package, format: (v: number) => v.toLocaleString() },
  { key: "totalSales" as const, label: "Total Sales", icon: DollarSign, format: (v: number) => formatPrice(v) },
  { key: "totalCustomers" as const, label: "Total Customers", icon: Users, format: (v: number) => v.toLocaleString() },
  { key: "totalProducts" as const, label: "Total Products", icon: ShoppingBag, format: (v: number) => v.toLocaleString() },
  { key: "averageRating" as const, label: "Average Rating", icon: Star, format: (v: number) => `${v.toFixed(1)}/5` },
];

function ChangeIndicator({ change }: { change: number | null }) {
  if (change === null) return null;

  const positive = change >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;

  return (
    <span className={`admin-kpi-change${positive ? " is-up" : " is-down"}`}>
      <Icon size={12} strokeWidth={2} aria-hidden="true" />
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

export function AdminKPICards({ kpis }: AdminKPICardsProps) {
  return (
    <div className="admin-kpi-grid">
      {CARDS.map(({ key, label, icon: Icon, format }) => {
        const metric = kpis[key];
        return (
          <article key={key} className="admin-kpi-card">
            <div className="admin-kpi-card-top">
              <span className="admin-kpi-icon">
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <p className="admin-kpi-label">{label}</p>
            </div>
            <div className="admin-kpi-value-row">
              <p className="admin-kpi-value">{format(metric.value)}</p>
              <ChangeIndicator change={metric.change} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
