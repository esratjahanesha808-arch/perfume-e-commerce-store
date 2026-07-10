import { NextResponse } from "next/server";
import { requireAdminWrite } from "@/lib/api-auth";
import { adminProductUpdateSchema } from "@/lib/validations/product";
import { updateAdminProduct } from "@/services/admin-product.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { isDemo, error } = await requireAdminWrite();
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = adminProductUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  try {
    if (isDemo) {
      return NextResponse.json({ id, ...parsed.data });
    }

    const product = await updateAdminProduct(id, parsed.data);
    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Product not found" } },
      { status: 404 }
    );
  }
}
