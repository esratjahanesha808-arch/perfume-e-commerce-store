import { NextResponse } from "next/server";
import { getAdminDashboardOverview, parseAdminDateRange } from "@/services/admin.service";

export async function GET() {
  try {
    const range = parseAdminDateRange({});
    const data = await getAdminDashboardOverview(range);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
