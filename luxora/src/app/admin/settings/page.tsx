import { getAppOrigin } from "@/lib/env";

export default function AdminStoreSettingsPage() {
  const appUrl = getAppOrigin();
  const currency = "USD";
  const storeName = "Luxora";
  const supportEmail = process.env.SUPPORT_EMAIL ?? "support@luxora.com";

  const settings = [
    { label: "Store Name", value: storeName },
    { label: "Store URL", value: appUrl },
    { label: "Currency", value: currency },
    { label: "Support Email", value: supportEmail },
    { label: "Order Number Prefix", value: "LUX-YYYYMMDD-" },
    { label: "Default Shipping", value: "Free on orders ≥ $50" },
    { label: "Tax Mode", value: "Excluded from displayed prices" },
  ];

  return (
    <div className="admin-collections-page">
      <p className="admin-page-intro">
        Core store configuration. To update these values, set the corresponding environment
        variables in your Vercel project settings or <code>.env.local</code>.
      </p>

      <section className="admin-card admin-recent-orders">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Store Configuration</h2>
            <p className="admin-card-subtitle">Read-only — managed via environment variables</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Setting</th>
                <th scope="col">Current Value</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.label}>
                  <td className="admin-table-muted">{s.label}</td>
                  <td>
                    <span className="admin-table-product-name">{s.value}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
