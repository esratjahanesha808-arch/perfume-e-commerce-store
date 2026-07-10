/**
 * LUXORA — Demo Mode Utilities
 *
 * Demo admins have { isDemo: true } in their notificationPrefs JSON.
 * This flag prevents write operations while allowing full read access to the admin panel.
 * No DB migration required — reuses the existing notificationPrefs column.
 */

import type { Session } from "next-auth";
import { db } from "@/lib/prisma";

/**
 * Returns true if the session belongs to a demo admin user.
 * Demo admins can browse admin pages but cannot perform any write operations.
 */
export function isDemoSession(session: Session | null): boolean {
  if (!session?.user?.id) return false;
  // We store the demo flag on the session via a custom field set during JWT callback
  // Fall back to false for regular users
  return (session.user as { isDemo?: boolean }).isDemo === true;
}

/**
 * Fetches the isDemo flag from the database for the given userId.
 * Use this in server components / layouts where the JWT may not yet carry the flag.
 */
export async function isUserDemo(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { notificationPrefs: true },
    });
    if (!user?.notificationPrefs) return false;
    const prefs = user.notificationPrefs as Record<string, unknown>;
    return prefs.isDemo === true;
  } catch {
    return false;
  }
}

/**
 * Standard demo-mode 403 response for API routes.
 * Import from here to keep the message consistent.
 */
export const DEMO_MODE_RESPONSE = {
  error: {
    code: "DEMO_MODE",
    message:
      "You are in demo mode — this action is disabled. Changes will not be saved.",
    demo: true,
  },
} as const;
