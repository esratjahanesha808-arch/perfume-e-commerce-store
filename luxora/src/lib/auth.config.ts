import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { loginSchema } from "@/lib/validations/auth";
import { getGoogleOAuthStatus } from "@/lib/google-auth-config";

const googleOAuth = getGoogleOAuthStatus();

// Edge-compatible auth config (no Prisma here — used in middleware)
export const authConfig: NextAuthConfig = {
  providers: [
    ...(googleOAuth.configured
      ? [
          Google({
            clientId: googleOAuth.clientId,
            clientSecret: googleOAuth.clientSecret,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Actual validation is in auth.ts — this is just the shape
      async authorize() {
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnCheckout = nextUrl.pathname.startsWith("/checkout");
      const isOnAuth =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      // Redirect logged-in users away from auth pages
      if (isLoggedIn && isOnAuth) {
        return Response.redirect(new URL("/", nextUrl));
      }

      // Protect dashboard and checkout
      if (!isLoggedIn && (isOnDashboard || isOnCheckout)) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      // Admin check happens in proxy.ts (role must be on session — see jwt/session below)
      if (isOnAdmin && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      // On sign-in user is set; on subsequent requests token already carries role from cookie
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "CUSTOMER";
      }
      return session;
    },
  },
};

// Re-export for use in middleware (edge-safe)
export { loginSchema };
