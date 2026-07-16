import { getSalesReport } from "@/services/admin-reports.service";
import { parseAdminDateRange } from "@/services/admin.service";
import { formatPrice } from "@/lib/utils";
import { AdminSalesReportChart } from "@/components/admin/AdminSalesReportChart";

function formatMonth(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export default async function AdminSalesReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const range = parseAdminDateRange({
    from: typeof raw.from === "string" ? raw.from : undefined,
    to: typeof raw.to === "string" ? raw.to : undefined,
  });

  const report = await getSalesReport(range);

  const kpis = [
    { label: "Total Revenue", value: formatPrice(report.totalRevenue) },
    { label: "Total Orders", value: report.totalOrders.toLocaleString() },
    { label: "Avg. Order Value", value: formatPrice(report.avgOrderValue) },
    { label: "New Customers", value: report.newCustomers.toLocaleString() },
  ];

  return (
    <div className="admin-collections-page">
      <p className="admin-page-intro">
        Revenue and order metrics for the selected period (default: last 30 days).
      </p>

      {/* KPI strip */}
      <div className="admin-kpi-grid" style={{ marginBottom: "var(--sp-6, 1.5rem)" }}>
        {kpis.map((kpi) => (
          <article key={kpi.label} className="admin-kpi-card">
            <p className="admin-kpi-label">{kpi.label}</p>
            <p className="admin-kpi-value">{kpi.value}</p>
          </article>
        ))}
      </div>

      {/* Monthly revenue chart */}
      <AdminSalesReportChart
        data={report.monthlySeries.map((d) => ({
          month: formatMonth(d.month),
          revenue: d.revenue,
          orders: d.orders,
        }))}
      />

      {/* Orders by status */}
      <section className="admin-card admin-recent-orders" style={{ marginTop: "var(--sp-6, 1.5rem)" }}>
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Orders by Status</h2>
            <p className="admin-card-subtitle">All-time order count per status</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Status</th>
                <th scope="col" className="admin-table-num">Count</th>
              </tr>
            </thead>
            <tbody>
              {report.ordersByStatus.map((row) => (
                <tr key={row.status}>
                  <td>
                    <span
                      className={`admin-status-badge admin-status-${row.status.toLowerCase()}`}
                    >
                      {STATUS_LABELS[row.status] ?? row.status}
                    </span>
                  </td>
                  <td className="admin-table-num admin-table-strong">
                    {row.count.toLocaleString()}
                  </td>
                </tr>
              ))}
              {report.ordersByStatus.length === 0 && (
                <tr>
                  <td colSpan={2}>
                    <p className="admin-inline-empty">No order data yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
