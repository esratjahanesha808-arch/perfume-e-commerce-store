// Email sending is disabled for portfolio mode.
// All functions are no-ops that log the action and return { skipped: true }.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const isEmailConfigured = false;

export async function sendVerificationEmail(
  email: string,
  _name: string,
  token: string
) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
  console.info("[email] sendVerificationEmail →", email, verifyUrl);
  return { skipped: true, verifyUrl };
}

export async function sendPasswordResetEmail(
  email: string,
  _name: string,
  token: string
) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  console.info("[email] sendPasswordResetEmail →", email, resetUrl);
  return { skipped: true, resetUrl };
}

export async function sendOrderConfirmationEmail(params: {
  email: string;
  name: string;
  orderNumber: string;
  total: number;
}) {
  console.info("[email] sendOrderConfirmationEmail →", params.email, params.orderNumber);
  return { skipped: true };
}

export async function sendOrderStatusUpdateEmail(params: {
  email: string;
  name: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  total: number;
}) {
  console.info("[email] sendOrderStatusUpdateEmail →", params.email, params.orderNumber, params.statusLabel);
  return { skipped: true };
}
