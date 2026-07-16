const RESEND_CONFIGURED = Boolean(process.env.RESEND_API_KEY?.trim());

export default function AdminSubscribersPage() {
  return (
    <div className="admin-collections-page">
      <p className="admin-page-intro">
        Newsletter subscribers are captured through the homepage subscription form at{" "}
        <code>POST /api/v1/newsletter/subscribe</code>. Subscriber storage requires an email
        provider audience integration.
      </p>

      {/* Status card */}
      <section
        className="admin-card"
        style={{
          marginBottom: "var(--sp-6, 1.5rem)",
          borderColor: RESEND_CONFIGURED
            ? "rgba(200,169,107,0.25)"
            : "rgba(220,38,38,0.25)",
        }}
      >
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Email Provider Status</h2>
            <p className="admin-card-subtitle">
              {RESEND_CONFIGURED
                ? "Resend is configured — transactional emails are active."
                : "Resend is not configured — emails are suppressed (dev mode)."}
            </p>
          </div>
          <span
            className={`admin-status-badge ${
              RESEND_CONFIGURED ? "admin-status-confirmed" : "admin-status-cancelled"
            }`}
          >
            {RESEND_CONFIGURED ? "Connected" : "Not configured"}
          </span>
        </div>
      </section>

      {/* Integration table */}
      <section className="admin-card admin-recent-orders">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Subscriber Integration</h2>
            <p className="admin-card-subtitle">Steps to enable persistent subscriber storage</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Step</th>
                <th scope="col">Action</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="admin-table-muted">1</td>
                <td>
                  <div className="min-w-0">
                    <span className="admin-table-product-name">Configure Resend API key</span>
                    <span className="admin-table-muted block text-xs">Set RESEND_API_KEY in environment</span>
                  </div>
                </td>
                <td>
                  <span
                    className={`admin-status-badge ${
                      RESEND_CONFIGURED ? "admin-status-confirmed" : "admin-status-pending"
                    }`}
                  >
                    {RESEND_CONFIGURED ? "Done" : "Pending"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="admin-table-muted">2</td>
                <td>
                  <div className="min-w-0">
                    <span className="admin-table-product-name">Create a Resend Audience</span>
                    <span className="admin-table-muted block text-xs">
                      In Resend dashboard → Audiences → Create → copy the Audience ID
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    className={`admin-status-badge ${
                      process.env.RESEND_AUDIENCE_ID ? "admin-status-confirmed" : "admin-status-pending"
                    }`}
                  >
                    {process.env.RESEND_AUDIENCE_ID ? "Done" : "Pending"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="admin-table-muted">3</td>
                <td>
                  <div className="min-w-0">
                    <span className="admin-table-product-name">Set RESEND_AUDIENCE_ID env var</span>
                    <span className="admin-table-muted block text-xs">
                      Update the newsletter subscribe route to call <code>resend.contacts.create()</code>
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    className={`admin-status-badge ${
                      process.env.RESEND_AUDIENCE_ID ? "admin-status-confirmed" : "admin-status-pending"
                    }`}
                  >
                    {process.env.RESEND_AUDIENCE_ID ? "Done" : "Pending"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card" style={{ marginTop: "var(--sp-6, 1.5rem)" }}>
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Current Behaviour</h2>
          </div>
        </div>
        <p className="admin-table-muted" style={{ padding: "0 var(--sp-4, 1rem) var(--sp-4, 1rem)", fontSize: "0.875rem", lineHeight: 1.6 }}>
          Subscription requests are rate-limited (per IP via Upstash Redis when configured) and
          validated for email format. Subscribers are currently logged to the server console only.
          Once <code>RESEND_AUDIENCE_ID</code> is set and the route is updated, all new sign-ups
          will be stored in the Resend audience and accessible from the Resend dashboard.
        </p>
      </section>
    </div>
  );
}
