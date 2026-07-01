import { Suspense } from "react";
import { adminReviewListQuerySchema } from "@/lib/validations/review";
import { getAdminReviews } from "@/services/review.service";
import { AdminReviewsClient } from "@/components/admin/AdminReviewsClient";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const parsed = adminReviewListQuerySchema.parse({
    page: typeof raw.page === "string" ? raw.page : undefined,
    search: typeof raw.search === "string" ? raw.search : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
    rating: typeof raw.rating === "string" ? raw.rating : undefined,
  });

  const data = await getAdminReviews(parsed);

  return (
    <Suspense fallback={<div className="admin-toolbar-skeleton" />}>
      <AdminReviewsClient
        reviews={data.reviews}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
        stats={data.stats}
      />
    </Suspense>
  );
}
