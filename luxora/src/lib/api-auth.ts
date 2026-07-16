import { auth } from "@/lib/auth";
import { apiError } from "@/lib/api-response";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      session: null,
      error: apiError("UNAUTHORIZED", "Authentication required", 401),
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
      error: apiError("FORBIDDEN", "Admin access required", 403),
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
