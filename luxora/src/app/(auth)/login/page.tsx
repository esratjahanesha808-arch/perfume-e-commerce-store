import { getGoogleOAuthStatus } from "@/lib/google-auth-config";
import { LoginPageClient } from "./LoginPageClient";

export default function LoginPage() {
  const { configured } = getGoogleOAuthStatus();
  return <LoginPageClient googleOAuthEnabled={configured} />;
}
