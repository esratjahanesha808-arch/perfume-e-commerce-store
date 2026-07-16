const env = process.env;

function check(key: string) {
  return Boolean(env[key]?.trim());
}

function checkAny(...keys: string[]) {
  return keys.some((k) => check(k));
}

export default function AdminSystemSettingsPage() {
  const integrations = [
    {
      name: "Database (Neon/PostgreSQL)",
      configured: check("DATABASE_URL"),
      required: true,
    },
    {
      name: "Auth.js (NextAuth)",
      configured: check("AUTH_SECRET"),
      required: true,
    },
    {
      name: "Stripe Payments",
      configured: check("STRIPE_SECRET_KEY") && check("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
      required: false,
    },
    {
      name: "Stripe Webhook",
      configured: check("STRIPE_WEBHOOK_SECRET"),
      required: false,
    },
    {
      name: "Resend (Email)",
      configured: check("RESEND_API_KEY"),
      required: false,
    },
    {
      name: "Upstash Redis (Cache / Rate-limit)",
      configured: check("UPSTASH_REDIS_REST_URL") && check("UPSTASH_REDIS_REST_TOKEN"),
      required: false,
    },
    {
      name: "Meilisearch (Search)",
      configured: check("MEILISEARCH_HOST"),
      required: false,
    },
    {
      name: "Cloudinary (Image Upload)",
      configured: check("CLOUDINARY_CLOUD_NAME") && check("CLOUDINARY_API_KEY") && check("CLOUDINARY_API_SECRET"),
      required: false,
    },
    {
      name: "Sentry (Error Monitoring)",
      configured: checkAny("NEXT_PUBLIC_SENTRY_DSN", "SENTRY_DSN"),
      required: false,
    },
    {
      name: "PostHog (Analytics)",
      configured: check("NEXT_PUBLIC_POSTHOG_KEY"),
      required: false,
    },
    {
      name: "Google OAuth",
      configured: check("AUTH_GOOGLE_ID") && check("AUTH_GOOGLE_SECRET"),
      required: false,
    },
  ];

  const requiredMissing = integrations.filter((i) => i.required && !i.configured);
  const allRequired = requiredMissing.length === 0;

  return (
    <div className="admin-collections-page">
      <p className="admin-page-intro">
        Live integration status based on environment variables currently loaded by the server.
        Set missing variables in <code>.env.local</code> (development) or Vercel project settings (production).
      </p>

      {!allRequired && (
        <div
          className="admin-card"
          style={{
            marginBottom: "var(--sp-6, 1.5rem)",
            borderColor: "rgba(220,38,38,0.35)",
            background: "rgba(220,38,38,0.06)",
          }}
        >
          <p style={{ color: "#f87171", fontSize: "0.875rem", padding: "var(--sp-4, 1rem)" }}>
            ⚠ {requiredMissing.length} required variable{requiredMissing.length > 1 ? "s are" : " is"} missing:&nbsp;
            {requiredMissing.map((i) => i.name).join(", ")}
          </p>
        </div>
      )}

      <section className="admin-card admin-recent-orders">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Integration Status</h2>
            <p className="admin-card-subtitle">Detected from server environment variables</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Integration</th>
                <th scope="col">Required</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map((item) => (
                <tr key={item.name}>
                  <td>
                    <span className="admin-table-product-name">{item.name}</span>
                  </td>
                  <td className="admin-table-muted">
                    {item.required ? "Yes" : "Optional"}
                  </td>
                  <td>
                    <span
                      className={`admin-status-badge ${item.configured ? "admin-status-confirmed" : item.required ? "admin-status-cancelled" : "admin-status-pending"}`}
                    >
                      {item.configured ? "Configured" : "Not configured"}
                    </span>
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
