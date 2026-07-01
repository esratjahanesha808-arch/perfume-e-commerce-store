/**
 * Google OAuth configuration helper.
 * Returns whether real credentials are present (not empty / placeholder).
 */
export function getGoogleOAuthStatus() {
  const rawId = process.env.AUTH_GOOGLE_ID;
  const rawSecret = process.env.AUTH_GOOGLE_SECRET;
  const id = rawId?.trim() ?? "";
  const secret = rawSecret?.trim() ?? "";
  const isPlaceholder =
    id === "your-google-client-id" || secret === "your-google-client-secret";
  const configured = !!(id && secret && !isPlaceholder);

  return { configured, clientId: id, clientSecret: secret };
}
