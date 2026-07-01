"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { normalizeEmail } from "@/lib/normalize-email";

function getCallbackUrl() {
  if (typeof window === "undefined") return "/";
  const value = new URLSearchParams(window.location.search).get("callbackUrl");
  return value && value.startsWith("/") ? value : "/";
}

interface LoginPageClientProps {
  googleOAuthEnabled: boolean;
}

export function LoginPageClient({ googleOAuthEnabled }: LoginPageClientProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    const email = normalizeEmail(data.email);
    const result = await signIn("credentials", {
      email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid email or password. Please try again.");
      return;
    }

    toast.success("Welcome back!");
    router.push(getCallbackUrl());
    router.refresh();
  }

  async function handleGoogleSignIn() {
    if (!googleOAuthEnabled) {
      toast.error("Google sign-in is not configured. Use email and password instead.");
      return;
    }

    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl: getCallbackUrl() });
  }

  return (
    <div className="auth-card">
      <header className="auth-header">
        <h1>Welcome back</h1>
        <p>Sign in with your email and password.</p>
      </header>

      {googleOAuthEnabled ? (
        <>
          <button
            id="btn-google-signin"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
            className="btn btn-ghost btn-full h-12 gap-2.5"
          >
            {isGoogleLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>
        </>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
        <div className="auth-field">
          <label htmlFor="login-email" className="auth-label">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="input-gold"
            placeholder="you@gmail.com"
          />
          {errors.email && <FieldError message={errors.email.message!} />}
        </div>

        <div className="auth-field">
          <div className="auth-label-row">
            <label htmlFor="login-password" className="auth-label">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-[var(--gold-muted)] hover:text-[var(--gold)] transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password")}
              className="input-gold pr-11"
              placeholder="••••••••"
            />
            <PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
          </div>
          {errors.password && <FieldError message={errors.password.message!} />}
        </div>

        <button
          id="btn-login-submit"
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className="btn btn-gold btn-full auth-submit"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="auth-footer">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[var(--gold)] font-semibold hover:text-[var(--gold-hover)] transition-colors">
          Create account
        </Link>
      </p>
    </div>
  );
}

function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p role="alert" className="auth-hint text-[var(--error)]">
      {message}
    </p>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
