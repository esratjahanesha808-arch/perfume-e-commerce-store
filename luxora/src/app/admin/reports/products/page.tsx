import { getProductsReport } from "@/services/admin-reports.service";
import { formatPrice } from "@/lib/utils";

export default async function AdminProductsReportPage() {
  const { byRevenue, byUnits } = await getProductsReport();

  return (
    <div className="admin-collections-page">
      <p className="admin-page-intro">
        Product performance based on completed and confirmed orders.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-6, 1.5rem)" }}>
        {/* Top by Revenue */}
        <section className="admin-card admin-recent-orders">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Top by Revenue</h2>
              <p className="admin-card-subtitle">Highest earning products</p>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col" className="admin-table-num">Units</th>
                  <th scope="col" className="admin-table-num">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {byRevenue.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <p className="admin-inline-empty">No sales data yet.</p>
                    </td>
                  </tr>
                ) : (
                  byRevenue.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="min-w-0">
                          <span className="admin-table-product-name">{row.name}</span>
                          {row.brandName ? (
                            <span className="admin-table-muted block text-xs">{row.brandName}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="admin-table-num admin-table-muted">{row.unitsSold}</td>
                      <td className="admin-table-num admin-table-strong">
                        {formatPrice(row.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top by Units */}
        <section className="admin-card admin-recent-orders">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Top by Units Sold</h2>
              <p className="admin-card-subtitle">Most frequently purchased</p>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col" className="admin-table-num">Units</th>
                  <th scope="col" className="admin-table-num">Avg Rating</th>
                </tr>
              </thead>
              <tbody>
                {byUnits.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <p className="admin-inline-empty">No sales data yet.</p>
                    </td>
                  </tr>
                ) : (
                  byUnits.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="min-w-0">
                          <span className="admin-table-product-name">{row.name}</span>
                          {row.brandName ? (
                            <span className="admin-table-muted block text-xs">{row.brandName}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="admin-table-num admin-table-strong">{row.unitsSold}</td>
                      <td className="admin-table-num admin-table-muted">
                        {row.avgRating > 0 ? `${row.avgRating.toFixed(1)} ★` : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
