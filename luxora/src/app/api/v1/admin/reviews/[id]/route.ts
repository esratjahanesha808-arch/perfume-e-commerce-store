import { NextResponse } from "next/server";
import { requireAdminWrite } from "@/lib/api-auth";
import { moderateReviewSchema } from "@/lib/validations/review";
import {
  ReviewError,
  deleteReview,
  moderateReview,
} from "@/services/review.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { isDemo, error } = await requireAdminWrite();
  if (error) return error;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = moderateReviewSchema.safeParse(body);

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

    if (isDemo) {
      return NextResponse.json({ data: { id, isApproved: parsed.data.isApproved } });
    }

    const review = await moderateReview(id, parsed.data.isApproved);
    return NextResponse.json({ data: review });
  } catch (err) {
    if (err instanceof ReviewError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: 404 }
      );
    }

    console.error("[PATCH /api/v1/admin/reviews/[id]]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to update review" } },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { isDemo, error } = await requireAdminWrite();
  if (error) return error;

  try {
    const { id } = await context.params;

    if (isDemo) {
      return NextResponse.json({ data: { deleted: true } });
    }

    await deleteReview(id);
    return NextResponse.json({ data: { deleted: true } });
  } catch (err) {
    if (err instanceof ReviewError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: 404 }
      );
    }

    console.error("[DELETE /api/v1/admin/reviews/[id]]", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to delete review" } },
      { status: 500 }
    );
  }
}
