import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { createReviewSchema } from "@/lib/validations/review";
import { ReviewError, createReview } from "@/services/review.service";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const review = await createReview(session!.user!.id, parsed.data);
    return NextResponse.json({ data: review }, { status: 201 });
  } catch (err) {
    if (err instanceof ReviewError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: 400 }
      );
    }

    console.error("[POST /api/v1/reviews]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to submit review" } },
      { status: 500 }
    );
  }
}
