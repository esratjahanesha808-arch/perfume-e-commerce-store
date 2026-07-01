import { Suspense } from "react";
import { adminCollectionListQuerySchema } from "@/lib/validations/collection";
import { getAdminCollections } from "@/services/admin-collection.service";
import { AdminCollectionsClient } from "@/components/admin/AdminCollectionsClient";

export default async function AdminCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const parsed = adminCollectionListQuerySchema.parse({
    page: typeof raw.page === "string" ? raw.page : undefined,
    search: typeof raw.search === "string" ? raw.search : undefined,
  });

  const data = await getAdminCollections(parsed);

  return (
    <Suspense fallback={<div className="admin-toolbar-skeleton" />}>
      <AdminCollectionsClient
        collections={data.collections}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
      />
    </Suspense>
  );
}
