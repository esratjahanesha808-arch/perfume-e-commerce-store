import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";

// POST /api/v1/admin/search/sync
// Meilisearch removed in portfolio mode — this endpoint is a no-op.
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  return NextResponse.json(
    {
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Search indexing is not available in portfolio mode.",
      },
    },
    { status: 503 }
  );
}
