import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiRatelimit } from "@/lib/redis";

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// POST /api/v1/newsletter/subscribe
export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (apiRatelimit) {
      const { success } = await apiRatelimit.limit(`newsletter:${ip}`);
      if (!success) {
        return NextResponse.json(
          { error: { code: "RATE_LIMITED", message: "Too many requests." } },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid email address." } },
        { status: 400 }
      );
    }

    // TODO Phase 15: Integrate with email list provider (Resend audiences / Mailchimp)
    // For now: log and return success
    console.log(`[NEWSLETTER] New subscriber: ${parsed.data.email}`);

    // Always return success (don't reveal if already subscribed)
    return NextResponse.json({
      message: "You're on the list. Expect exclusive fragrance discoveries in your inbox.",
    });
  } catch (error) {
    console.error("[NEWSLETTER_SUBSCRIBE]", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Something went wrong." } },
      { status: 500 }
    );
  }
}
