import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { DEMO_MODE_RESPONSE } from "@/lib/demo";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      ),
    };
  }

  return { session, error: null };
}

export async function requireAdmin() {
  const { session, error } = await requireAuth();

  if (error) {
    return { session: null, error };
  }

  const role = session!.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return {
      session: null,
      error: NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      ),
    };
  }

  return { session, error: null };
}

/**
 * Use this for any admin WRITE endpoint (POST / PUT / PATCH / DELETE).
 * Demo admin accounts are allowed READ access but mock writes.
 */
export async function requireAdminWrite() {
  const { session, error } = await requireAdmin();

  if (error) {
    return { session: null, isDemo: false, error };
  }

  // Pass demo admin status back so endpoints can mock writes
  const isDemo = (session!.user as { isDemo?: boolean }).isDemo === true;
  
  return { session, isDemo, error: null };
}
