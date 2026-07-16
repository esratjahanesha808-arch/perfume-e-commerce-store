import { NextResponse } from "next/server";
import { ReviewError, markReviewHelpful } from "@/services/review.service";
import { requireAuth } from "@/lib/api-auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await context.params;
    const helpfulCount = await markReviewHelpful(id);
    return NextResponse.json({ data: { helpfulCount } });
  } catch (err) {
    if (err instanceof ReviewError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: 404 }
      );
    }

    console.error("[POST /api/v1/reviews/[id]/helpful]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to mark review helpful" } },
      { status: 500 }
    );
  }
}
