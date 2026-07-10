import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validations/auth";
import { normalizeEmail } from "@/lib/normalize-email";
import { getGoogleOAuthStatus } from "@/lib/google-auth-config";

const googleOAuth = getGoogleOAuthStatus();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
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
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const normalizedEmail = normalizeEmail(email);

        const user = await db.user.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            isActive: true,
            avatarUrl: true,
            emailVerified: true,
            notificationPrefs: true,
          },
        });

        if (!user || !user.passwordHash) return null;
        if (!user.isActive) return null;

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        // Update last login
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // Detect demo users from notificationPrefs JSON
        const prefs = (user.notificationPrefs ?? {}) as Record<string, unknown>;
        const isDemo = prefs.isDemo === true;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role,
          emailVerified: user.emailVerified,
          isDemo,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On first sign-in, attach user data to JWT
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "CUSTOMER";
        token.emailVerified = (user as { emailVerified?: Date | null }).emailVerified ?? null;
        token.isDemo = (user as { isDemo?: boolean }).isDemo ?? false;
      }

      // Allow session updates from client
      if (trigger === "update" && session) {
        token.name = session.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.emailVerified = token.emailVerified as Date | null;
        (session.user as { isDemo?: boolean }).isDemo = (token.isDemo as boolean) ?? false;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Set default role when OAuth user is created
      if (user.id) {
        await db.user.update({
          where: { id: user.id },
          data: { role: "CUSTOMER" },
        });
      }
    },
  },
});
