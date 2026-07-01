import { Suspense } from "react";
import { adminOrderListQuerySchema } from "@/lib/validations/order";
import { getAdminOrders } from "@/services/order.service";
import { AdminOrdersToolbar } from "@/components/admin/AdminOrdersToolbar";
import {
  AdminOrdersTable,
  AdminPagination,
} from "@/components/admin/AdminOrdersTable";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const parsed = adminOrderListQuerySchema.parse({
    page: typeof raw.page === "string" ? raw.page : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
    search: typeof raw.search === "string" ? raw.search : undefined,
    sort: typeof raw.sort === "string" ? raw.sort : undefined,
    direction: typeof raw.direction === "string" ? raw.direction : undefined,
  });

  const data = await getAdminOrders(parsed);

  return (
    <div className="admin-orders-page">
      <Suspense fallback={<div className="admin-toolbar-skeleton" />}>
        <AdminOrdersToolbar total={data.total} />
      </Suspense>

      <AdminOrdersTable orders={data.orders} />

      <AdminPagination
        page={data.page}
        totalPages={data.totalPages}
        searchParams={{
          status: parsed.status,
          search: parsed.search,
        }}
      />
    </div>
  );
}
