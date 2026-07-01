import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Luxora account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-bg flex min-h-dvh items-center justify-center px-4 py-6 sm:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-[10%] left-[5%] h-[400px] w-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-[10%] right-[5%] h-[300px] w-[300px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="auth-shell relative animate-fadeIn">
        <div className="auth-logo">
          <Link href="/" aria-label="Luxora home" className="inline-block">
            <span className="text-gold-gradient font-serif text-[1.75rem] sm:text-[2rem] font-bold tracking-[0.1em] leading-none">
              LUXORA
            </span>
          </Link>
          <p className="mt-1 text-[0.6875rem] sm:text-[0.75rem] tracking-[0.22em] uppercase text-[var(--text-muted)]">
            Luxury Perfume
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
