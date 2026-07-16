import { Suspense } from "react";
import { getAdminCategories } from "@/services/admin-category.service";
import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const page = typeof raw.page === "string" ? Math.max(1, Number.parseInt(raw.page, 10)) : 1;
  const search = typeof raw.search === "string" ? raw.search : undefined;

  const data = await getAdminCategories({ page, search });

  return (
    <Suspense fallback={<div className="admin-toolbar-skeleton" />}>
      <AdminCategoriesClient
        categories={data.categories}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
      />
    </Suspense>
  );
}
