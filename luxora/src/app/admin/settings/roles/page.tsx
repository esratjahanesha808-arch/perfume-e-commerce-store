const ROLES = [
  {
    role: "CUSTOMER",
    label: "Customer",
    description: "Default role for all registered shoppers.",
    permissions: [
      "Browse and purchase products",
      "Manage own cart, wishlist, and addresses",
      "View own order history",
      "Submit reviews (verified purchases only)",
      "Update own profile and password",
    ],
  },
  {
    role: "ADMIN",
    label: "Admin",
    description: "Store staff with full read access and most write operations.",
    permissions: [
      "All Customer permissions",
      "View admin dashboard and all reports",
      "Read orders, products, inventory, reviews, coupons",
      "Update order status and inventory levels",
      "Moderate reviews",
      "Manage coupons (blocked in demo mode)",
      "Read-only in demo accounts (demo flag blocks writes)",
    ],
  },
  {
    role: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Full unrestricted access — store owner account.",
    permissions: [
      "All Admin permissions",
      "Never subject to demo-mode write restrictions",
      "Can access Prisma Studio and run seed scripts",
    ],
  },
];

export default function AdminRolesPage() {
  return (
    <div className="admin-collections-page">
      <p className="admin-page-intro">
        Roles are defined in the database schema as an enum and assigned per user. Role changes
        require a direct database update via Prisma Studio or a seed script.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6, 1.5rem)" }}>
        {ROLES.map((r) => (
          <section key={r.role} className="admin-card admin-recent-orders">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">{r.label}</h2>
                <p className="admin-card-subtitle">{r.description}</p>
              </div>
              <span className="admin-card-badge">{r.role}</span>
            </div>
            <ul style={{ padding: "0 var(--sp-4, 1rem) var(--sp-4, 1rem)", listStyle: "disc", paddingLeft: "calc(var(--sp-4, 1rem) + 1.2em)" }}>
              {r.permissions.map((p) => (
                <li key={p} className="admin-table-muted" style={{ marginBottom: "4px", fontSize: "0.875rem" }}>
                  {p}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
