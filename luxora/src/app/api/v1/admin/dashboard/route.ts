import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import {
  getAdminDashboardOverview,
  parseAdminDateRange,
} from "@/services/admin.service";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const range = parseAdminDateRange({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  const data = await getAdminDashboardOverview(range);
  return NextResponse.json(data);
}
