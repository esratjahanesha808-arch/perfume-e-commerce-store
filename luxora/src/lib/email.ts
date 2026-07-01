import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY?.trim() ?? "";

/** True when a real Resend API key is configured. */
export const isEmailConfigured =
  resendKey.length > 0 &&
  resendKey.startsWith("re_") &&
  !resendKey.includes("placeholder");

export const resend = isEmailConfigured ? new Resend(resendKey) : null;

const FROM = process.env.RESEND_FROM_EMAIL ?? "Luxora <noreply@luxora.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ── Email Verification ──────────────────────────────────────────
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  if (!isEmailConfigured || !resend) {
    if (process.env.NODE_ENV === "development") {
      console.info("[DEV] Email not configured — verification link:", verifyUrl);
    }
    return { skipped: true, verifyUrl };
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your Luxora account",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;color:#f5f5f5;padding:40px;border-radius:12px;">
        <h1 style="color:#d4af37;font-size:28px;margin-bottom:8px;">Welcome to Luxora</h1>
        <p style="color:#a0a0a0;margin-bottom:32px;">Hello ${name}, please verify your email address.</p>
        <a href="${verifyUrl}"
           style="display:inline-block;background:#d4af37;color:#0a0a0a;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">
          Verify Email
        </a>
        <p style="color:#6b6b6b;font-size:13px;margin-top:32px;">
          Link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  });

  return { skipped: false, verifyUrl };
}

// ── Password Reset ──────────────────────────────────────────────
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  if (!isEmailConfigured || !resend) {
    if (process.env.NODE_ENV === "development") {
      console.info("[DEV] Email not configured — password reset link:", resetUrl);
    }
    return { skipped: true, resetUrl };
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your Luxora password",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;color:#f5f5f5;padding:40px;border-radius:12px;">
        <h1 style="color:#d4af37;font-size:28px;margin-bottom:8px;">Password Reset</h1>
        <p style="color:#a0a0a0;margin-bottom:32px;">Hello ${name}, click below to reset your password.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#d4af37;color:#0a0a0a;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">
          Reset Password
        </a>
        <p style="color:#6b6b6b;font-size:13px;margin-top:32px;">
          Link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });

  return { skipped: false, resetUrl };
}

// ── Order Confirmation ──────────────────────────────────────────
export async function sendOrderConfirmationEmail(params: {
  email: string;
  name: string;
  orderNumber: string;
  total: number;
}) {
  const { email, name, orderNumber, total } = params;
  const ordersUrl = `${APP_URL}/dashboard/orders`;

  if (!isEmailConfigured || !resend) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        `[DEV] Email not configured — order confirmation for ${orderNumber} (${email})`
      );
    }
    return { skipped: true };
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your Luxora order ${orderNumber} is confirmed`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;color:#f5f5f5;padding:40px;border-radius:12px;">
        <h1 style="color:#c8a96b;font-size:28px;margin-bottom:8px;">Thank you for your order</h1>
        <p style="color:#a0a0a0;margin-bottom:24px;">Hello ${name}, your payment was received and your order is confirmed.</p>
        <p style="color:#d9cebd;font-size:16px;margin-bottom:8px;"><strong>Order:</strong> ${orderNumber}</p>
        <p style="color:#d9cebd;font-size:16px;margin-bottom:32px;"><strong>Total:</strong> $${total.toFixed(2)}</p>
        <a href="${ordersUrl}"
           style="display:inline-block;background:#c8a96b;color:#0a0a0a;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">
          View Order
        </a>
        <p style="color:#6b6b6b;font-size:13px;margin-top:32px;">
          We will notify you when your order ships.
        </p>
      </div>
    `,
  });

  return { skipped: false };
}

// ── Order Status Update ──────────────────────────────────────────
export async function sendOrderStatusUpdateEmail(params: {
  email: string;
  name: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  total: number;
}) {
  const { email, name, orderNumber, statusLabel, total } = params;
  const ordersUrl = `${APP_URL}/dashboard/orders`;

  if (!isEmailConfigured || !resend) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        `[DEV] Email not configured — order ${orderNumber} status update: ${statusLabel} (${email})`
      );
    }
    return { skipped: true };
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your Luxora order ${orderNumber} is now ${statusLabel}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;color:#f5f5f5;padding:40px;border-radius:12px;">
        <h1 style="color:#c8a96b;font-size:28px;margin-bottom:8px;">Order update</h1>
        <p style="color:#a0a0a0;margin-bottom:24px;">Hello ${name}, your order status has been updated.</p>
        <p style="color:#d9cebd;font-size:16px;margin-bottom:8px;"><strong>Order:</strong> ${orderNumber}</p>
        <p style="color:#d9cebd;font-size:16px;margin-bottom:8px;"><strong>Status:</strong> ${statusLabel}</p>
        <p style="color:#d9cebd;font-size:16px;margin-bottom:32px;"><strong>Total:</strong> $${total.toFixed(2)}</p>
        <a href="${ordersUrl}"
           style="display:inline-block;background:#c8a96b;color:#0a0a0a;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">
          View Order
        </a>
      </div>
    `,
  });

  return { skipped: false };
}
