import { Suspense } from "react";
import { adminCouponListQuerySchema } from "@/lib/validations/coupon";
import { getAdminCoupons } from "@/services/coupon.service";
import { AdminCouponsClient } from "@/components/admin/AdminCouponsClient";

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const parsed = adminCouponListQuerySchema.parse({
    page: typeof raw.page === "string" ? raw.page : undefined,
    search: typeof raw.search === "string" ? raw.search : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
  });

  const data = await getAdminCoupons(parsed);

  return (
    <Suspense fallback={<div className="admin-toolbar-skeleton" />}>
      <AdminCouponsClient
        coupons={data.coupons}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
      />
    </Suspense>
  );
}
