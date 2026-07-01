import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { adminReviewListQuerySchema } from "@/lib/validations/review";
import { getAdminReviews } from "@/services/review.service";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const parsed = adminReviewListQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    rating: searchParams.get("rating") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const data = await getAdminReviews(parsed.data);
  return NextResponse.json(data);
}
