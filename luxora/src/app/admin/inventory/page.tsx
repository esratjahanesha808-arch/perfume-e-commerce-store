import { Suspense } from "react";
import { adminInventoryListQuerySchema } from "@/lib/validations/inventory";
import {
  getAdminInventoryList,
  getAdminLowStockCount,
} from "@/services/inventory.service";
import { AdminInventoryClient } from "@/components/admin/AdminInventoryClient";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const parsed = adminInventoryListQuerySchema.parse({
    page: typeof raw.page === "string" ? raw.page : undefined,
    search: typeof raw.search === "string" ? raw.search : undefined,
    lowStockOnly: typeof raw.lowStockOnly === "string" ? raw.lowStockOnly : undefined,
  });

  const [data, lowStockCount] = await Promise.all([
    getAdminInventoryList(parsed),
    getAdminLowStockCount(),
  ]);

  return (
    <Suspense fallback={<div className="admin-toolbar-skeleton" />}>
      <AdminInventoryClient
        items={data.items}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
        lowStockCount={lowStockCount}
      />
    </Suspense>
  );
}
