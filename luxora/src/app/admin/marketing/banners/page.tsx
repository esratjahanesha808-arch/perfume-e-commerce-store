const CURRENT_BANNERS = [
  {
    id: "hero",
    location: "Homepage Hero",
    type: "Full-width image + CTA",
    headline: "Scent of Luxury",
    subtext: "Curated from the world's finest perfume houses",
    cta: "Shop Now → /shop",
    status: "Active",
    notes: "Managed via src/app/(storefront)/page.tsx",
  },
  {
    id: "featured-strip",
    location: "Homepage — Featured Strip",
    type: "3-column product showcase",
    headline: "Featured Fragrances",
    subtext: "Dynamically populated from isFeatured = true products",
    cta: "Shop Featured → /shop?featured=true",
    status: "Active",
    notes: "Powered by GET /api/v1/products/featured",
  },
  {
    id: "new-arrivals",
    location: "Homepage — New Arrivals",
    type: "4-column product strip",
    headline: "New Arrivals",
    subtext: "Latest additions to the catalog",
    cta: "View All → /shop",
    status: "Active",
    notes: "Powered by GET /api/v1/products/new-arrivals",
  },
];

export default function AdminBannersPage() {
  return (
    <div className="admin-collections-page">
      <p className="admin-page-intro">
        Banners are currently managed as static React components. A dynamic banner CMS is planned
        for a future phase. To update banner copy or images, edit the homepage component directly.
      </p>

      <section className="admin-card admin-recent-orders">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Active Banners</h2>
            <p className="admin-card-subtitle">Current homepage promotional zones</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Location</th>
                <th scope="col">Type</th>
                <th scope="col">Headline</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {CURRENT_BANNERS.map((banner) => (
                <tr key={banner.id}>
                  <td>
                    <div className="min-w-0">
                      <span className="admin-table-product-name">{banner.location}</span>
                      <span className="admin-table-muted block text-xs">{banner.notes}</span>
                    </div>
                  </td>
                  <td className="admin-table-muted">{banner.type}</td>
                  <td>
                    <div className="min-w-0">
                      <span className="admin-table-product-name">{banner.headline}</span>
                      <span className="admin-table-muted block text-xs">{banner.subtext}</span>
                    </div>
                  </td>
                  <td>
                    <span className="admin-status-badge admin-status-confirmed">
                      {banner.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card" style={{ marginTop: "var(--sp-6, 1.5rem)" }}>
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Roadmap</h2>
            <p className="admin-card-subtitle">Planned improvements to banner management</p>
          </div>
        </div>
        <ul style={{ padding: "0 var(--sp-4, 1rem) var(--sp-4, 1rem)", listStyle: "disc", paddingLeft: "calc(var(--sp-4, 1rem) + 1.2em)" }}>
          {[
            "Database-backed banner table with start/end scheduling",
            "Drag-and-drop image upload via the Cloudinary upload endpoint",
            "A/B testing via PostHog feature flags",
            "Per-page banner zones (PDP, shop, checkout)",
          ].map((item) => (
            <li key={item} className="admin-table-muted" style={{ marginBottom: 4, fontSize: "0.875rem" }}>
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
