import {
  getAdminDashboardOverview,
  parseAdminDateRange,
} from "@/services/admin.service";
import { AdminKPICards } from "@/components/admin/AdminKPICards";
import { AdminSalesChart } from "@/components/admin/AdminSalesChart";
import { AdminRecentOrders } from "@/components/admin/AdminRecentOrders";
import { AdminTopProducts } from "@/components/admin/AdminTopProducts";
import { AdminTopCustomers } from "@/components/admin/AdminTopCustomers";
import { AdminCategoryChart } from "@/components/admin/AdminCategoryChart";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const range = parseAdminDateRange(params);
  const data = await getAdminDashboardOverview(range);

  return (
    <div className="admin-dashboard">
      <AdminKPICards kpis={data.kpis} />

      <div className="admin-dashboard-grid">
        <AdminSalesChart data={data.salesChart} />

        <div className="admin-dashboard-stack">
          <AdminRecentOrders orders={data.recentOrders} />
        </div>
      </div>

      <div className="admin-dashboard-grid admin-dashboard-grid--three">
        <AdminTopProducts products={data.topProducts} />
        <AdminTopCustomers customers={data.topCustomers} />
        <AdminCategoryChart
          data={data.salesByCategory}
          total={data.categorySalesTotal}
        />
      </div>
    </div>
  );
}
