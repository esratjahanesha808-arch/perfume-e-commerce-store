import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiRatelimit } from "@/lib/redis";
import { apiError, logApiError } from "@/lib/api-response";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// POST /api/v1/newsletter/subscribe
export async function POST(req: NextRequest) {
  try {
    const limited = await enforceRateLimit({
      limiter: apiRatelimit,
      key: `newsletter:${getClientIp(req)}`,
      fallbackLimit: 100,
      fallbackWindowMs: 60 * 1000,
      message: "Too many requests.",
    });
    if (limited) return limited;

    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("VALIDATION_ERROR", "Invalid email address.", 400);
    }

    // TODO Phase 15: Integrate with email list provider (Resend audiences / Mailchimp)
    // For now: log and return success
    console.log(`[NEWSLETTER] New subscriber: ${parsed.data.email}`);

    // Always return success (don't reveal if already subscribed)
    return NextResponse.json({
      message: "You're on the list. Expect exclusive fragrance discoveries in your inbox.",
    });
  } catch (error) {
    logApiError("POST /api/v1/newsletter/subscribe", error);
    return apiError("SERVER_ERROR", "Something went wrong.", 500);
  }
}
