import { getCustomersReport } from "@/services/admin-reports.service";
import { formatPrice } from "@/lib/utils";

function formatMonth(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}


export default async function AdminCustomersReportPage() {
  const report = await getCustomersReport();

  return (
    <div className="admin-collections-page">
      <p className="admin-page-intro">
        Customer acquisition and lifetime value across all time.
      </p>

      {/* KPI strip */}
      <div className="admin-kpi-grid" style={{ marginBottom: "var(--sp-6, 1.5rem)" }}>
        <article className="admin-kpi-card">
          <p className="admin-kpi-label">Total Customers</p>
          <p className="admin-kpi-value">{report.totalCustomers.toLocaleString()}</p>
        </article>
        <article className="admin-kpi-card">
          <p className="admin-kpi-label">New This Month</p>
          <p className="admin-kpi-value">{report.newThisMonth.toLocaleString()}</p>
        </article>
        <article className="admin-kpi-card">
          <p className="admin-kpi-label">Top Customer Spend</p>
          <p className="admin-kpi-value">
            {report.topBySpend[0] ? formatPrice(report.topBySpend[0].totalSpent) : "—"}
          </p>
        </article>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-6, 1.5rem)" }}>
        {/* Top customers by spend */}
        <section className="admin-card admin-recent-orders">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Top Customers by Spend</h2>
              <p className="admin-card-subtitle">Lifetime value, excluding cancelled orders</p>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Customer</th>
                  <th scope="col" className="admin-table-num">Orders</th>
                  <th scope="col" className="admin-table-num">Spent</th>
                </tr>
              </thead>
              <tbody>
                {report.topBySpend.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <p className="admin-inline-empty">No customer data yet.</p>
                    </td>
                  </tr>
                ) : (
                  report.topBySpend.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="min-w-0">
                          <span className="admin-table-product-name">
                            {row.name ?? "—"}
                          </span>
                          <span className="admin-table-muted block text-xs">{row.email}</span>
                        </div>
                      </td>
                      <td className="admin-table-num admin-table-muted">{row.orderCount}</td>
                      <td className="admin-table-num admin-table-strong">
                        {formatPrice(row.totalSpent)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Monthly acquisition */}
        <section className="admin-card admin-recent-orders">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Monthly Acquisition</h2>
              <p className="admin-card-subtitle">New customer registrations per month</p>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col" className="admin-table-num">New Customers</th>
                </tr>
              </thead>
              <tbody>
                {report.monthlyAcquisition
                  .slice()
                  .reverse()
                  .map((row) => (
                    <tr key={row.month}>
                      <td className="admin-table-muted">{formatMonth(row.month)}</td>
                      <td className="admin-table-num admin-table-strong">
                        {row.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

