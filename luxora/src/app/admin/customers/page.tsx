import { Suspense } from "react";
import { getAdminCustomers } from "@/services/admin-customer.service";
import { AdminCustomersClient } from "@/components/admin/AdminCustomersClient";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const page = typeof raw.page === "string" ? Math.max(1, Number.parseInt(raw.page, 10)) : 1;
  const search = typeof raw.search === "string" ? raw.search : undefined;

  const data = await getAdminCustomers({ page, search });

  return (
    <Suspense fallback={<div className="admin-toolbar-skeleton" />}>
      <AdminCustomersClient
        customers={data.customers}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
      />
    </Suspense>
  );
}
