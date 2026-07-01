import { Suspense } from "react";
import { adminProductListQuerySchema } from "@/lib/validations/product";
import { getAdminProducts } from "@/services/admin-product.service";
import { AdminProductsClient } from "@/components/admin/AdminProductsClient";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const parsed = adminProductListQuerySchema.parse({
    page: typeof raw.page === "string" ? raw.page : undefined,
    search: typeof raw.search === "string" ? raw.search : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
  });

  const data = await getAdminProducts(parsed);

  return (
    <Suspense fallback={<div className="admin-toolbar-skeleton" />}>
      <AdminProductsClient
        products={data.products}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
      />
    </Suspense>
  );
}
