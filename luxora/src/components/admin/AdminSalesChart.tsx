"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/utils";

type SalesChartPoint = {
  day: string;
  thisPeriod: number;
  lastPeriod: number;
};

interface AdminSalesChartProps {
  data: SalesChartPoint[];
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="admin-chart-tooltip">
      <p className="admin-chart-tooltip-label">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.dataKey === "thisPeriod" ? "This Period" : "Last Period"}:{" "}
          {formatPrice(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function AdminSalesChart({ data }: AdminSalesChartProps) {
  return (
    <section className="admin-card admin-sales-chart">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Sales Overview</h2>
          <p className="admin-card-subtitle">Compare performance across periods</p>
        </div>
        <span className="admin-card-badge">Daily</span>
      </div>

      <div className="admin-chart-legend">
        <span className="admin-chart-legend-item">
          <span className="admin-chart-legend-dot is-primary" aria-hidden="true" />
          This Period
        </span>
        <span className="admin-chart-legend-item">
          <span className="admin-chart-legend-dot is-muted" aria-hidden="true" />
          Last Period
        </span>
      </div>

      <div className="admin-chart-wrap">
        {data.length === 0 ? (
          <p className="admin-empty-chart">No sales data for this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(54, 44, 29, 0.08)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "#6B6B6B", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B6B6B", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`
                }
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="thisPeriod"
                stroke="#a97636"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#a97636", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="lastPeriod"
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
