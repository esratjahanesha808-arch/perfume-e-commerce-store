"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/utils";

type ChartPoint = { month: string; revenue: number; orders: number };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="admin-chart-tooltip">
      <p className="admin-chart-tooltip-label">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey}>
          {entry.dataKey === "revenue"
            ? `Revenue: ${formatPrice(entry.value)}`
            : `Orders: ${entry.value}`}
        </p>
      ))}
    </div>
  );
}

export function AdminSalesReportChart({ data }: { data: ChartPoint[] }) {
  return (
    <section className="admin-card admin-sales-chart">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Monthly Revenue</h2>
          <p className="admin-card-subtitle">Last 12 months — excluding cancelled & refunded orders</p>
        </div>
      </div>
      <div className="admin-chart-wrap">
        {data.every((d) => d.revenue === 0) ? (
          <p className="admin-empty-chart">No revenue data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(54,44,29,0.08)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6B6B6B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B6B6B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`)}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="revenue" fill="#a97636" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
