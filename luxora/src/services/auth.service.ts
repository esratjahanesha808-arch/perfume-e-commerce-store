import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/prisma";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  isEmailConfigured,
} from "@/lib/email";
import { normalizeEmail } from "@/lib/normalize-email";

async function withDbRetry<T>(operation: () => Promise<T>, retries = 1): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const isNeonDisconnect =
      error instanceof Error &&
      (error.message.includes("terminating connection") ||
        error.message.includes("57P01") ||
        error.message.includes("Connection terminated"));

    if (retries > 0 && isNeonDisconnect) {
      return withDbRetry(operation, retries - 1);
    }
    throw error;
  }
}

// ── Register ────────────────────────────────────────────────────
export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const normalizedEmail = normalizeEmail(email);

  const existing = await withDbRetry(() =>
    db.user.findUnique({ where: { email: normalizedEmail } })
  );
  if (existing) {
    throw new Error("EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  const skipEmail = !isEmailConfigured;

  const user = await withDbRetry(() =>
    db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "CUSTOMER",
        // Dev / no-Resend: allow immediate sign-in without verification email
        ...(skipEmail ? { emailVerified: new Date() } : {}),
      },
      select: { id: true, email: true, name: true },
    })
  );

  await withDbRetry(() =>
    db.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: verificationToken,
        expires: tokenExpiry,
      },
    })
  );

  let emailSent = false;
  let devVerifyUrl: string | undefined;

  try {
    const emailResult = await sendVerificationEmail(
      normalizedEmail,
      name.trim(),
      verificationToken
    );
    emailSent = !emailResult.skipped;
    if (emailResult.skipped) {
      devVerifyUrl = emailResult.verifyUrl;
    }
  } catch (error) {
    console.error("[REGISTER_EMAIL_ERROR]", error);
    // Account exists — do not fail registration if email provider errors
  }

  return {
    user,
    emailSent,
    devVerifyUrl: skipEmail ? undefined : devVerifyUrl,
    autoVerified: skipEmail,
  };
}

// ── Verify Email ────────────────────────────────────────────────
export async function verifyEmail(token: string) {
  const record = await db.verificationToken.findUnique({ where: { token } });

  if (!record) throw new Error("INVALID_TOKEN");
  if (record.expires < new Date()) throw new Error("TOKEN_EXPIRED");

  await db.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  await db.verificationToken.delete({ where: { token } });

  return true;
}

// ── Forgot Password ─────────────────────────────────────────────
export async function forgotPassword(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, name: true, email: true },
  });

  // Always return success — never reveal if email exists
  if (!user) {
    return { ok: true, emailSent: false };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h

  // Remove any existing reset tokens for this email
  await db.verificationToken.deleteMany({
    where: { identifier: `reset:${normalizedEmail}` },
  });

  await db.verificationToken.create({
    data: {
      identifier: `reset:${normalizedEmail}`,
      token: resetToken,
      expires: tokenExpiry,
    },
  });

  const emailResult = await sendPasswordResetEmail(
    normalizedEmail,
    user.name ?? "User",
    resetToken
  );

  return {
    ok: true,
    emailSent: !emailResult.skipped,
    devResetUrl: emailResult.skipped ? emailResult.resetUrl : undefined,
  };
}

// ── Reset Password ──────────────────────────────────────────────
export async function resetPassword(token: string, newPassword: string) {
  const record = await db.verificationToken.findUnique({ where: { token } });

  if (!record) throw new Error("INVALID_TOKEN");
  if (record.expires < new Date()) throw new Error("TOKEN_EXPIRED");

  // Identifier format: "reset:email@example.com"
  const email = record.identifier.replace("reset:", "");

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db.user.update({
    where: { email },
    data: { passwordHash },
  });

  await db.verificationToken.delete({ where: { token } });

  return true;
}
