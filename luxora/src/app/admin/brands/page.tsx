import { Suspense } from "react";
import { getAdminBrands } from "@/services/admin-brand.service";
import { AdminBrandsClient } from "@/components/admin/AdminBrandsClient";

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const page = typeof raw.page === "string" ? Math.max(1, Number.parseInt(raw.page, 10)) : 1;
  const search = typeof raw.search === "string" ? raw.search : undefined;

  const data = await getAdminBrands({ page, search });

  return (
    <Suspense fallback={<div className="admin-toolbar-skeleton" />}>
      <AdminBrandsClient
        brands={data.brands}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
      />
    </Suspense>
  );
}
