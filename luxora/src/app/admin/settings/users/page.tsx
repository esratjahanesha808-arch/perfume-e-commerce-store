import { getAdminUsers } from "@/services/admin-reports.service";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminUserManagementPage() {
  const users = await getAdminUsers();

  return (
    <div className="admin-collections-page">
      <p className="admin-page-intro">
        Admin and super-admin accounts. To create or remove admin accounts, use the database seed
        scripts or Prisma Studio.
      </p>

      <section className="admin-card admin-recent-orders">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Admin Users</h2>
            <p className="admin-card-subtitle">{users.length} account{users.length !== 1 ? "s" : ""} with elevated access</p>
          </div>
        </div>
        {users.length === 0 ? (
          <p className="admin-inline-empty">No admin users found.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col">Joined</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="min-w-0">
                        <span className="admin-table-product-name">{user.name ?? "—"}</span>
                        <span className="admin-table-muted block text-xs">{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={
                          user.role === "SUPER_ADMIN"
                            ? "admin-status-badge admin-status-confirmed"
                            : "admin-status-badge admin-status-processing"
                        }
                      >
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="admin-table-muted">{formatDate(user.createdAt)}</td>
                    <td>
                      <span
                        className={
                          user.isActive
                            ? "admin-status-badge admin-status-confirmed"
                            : "admin-status-badge admin-status-cancelled"
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
