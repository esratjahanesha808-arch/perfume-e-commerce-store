"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(data: ForgotPasswordInput) {
    const res = await fetch("/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json().catch(() => ({}));

    if (res.status === 429) {
      toast.error("Too many requests. Please wait a few minutes and try again.");
      return;
    }

    if (json.devResetUrl) {
      sessionStorage.setItem("luxora-dev-reset-url", json.devResetUrl);
      setDevResetUrl(json.devResetUrl);
    } else {
      sessionStorage.removeItem("luxora-dev-reset-url");
      setDevResetUrl(null);
    }

    // Always show success (security — don't reveal if email exists)
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="auth-card p-8" style={{ textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--gold-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <Mail size={28} style={{ color: "var(--gold)" }} />
        </div>
        <h2 style={{ marginBottom: "12px" }}>Check your inbox</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.7 }}>
          If an account exists with that email, we&apos;ve sent a password reset link. The link expires in 1 hour.
        </p>
        {devResetUrl ? (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(200, 169, 107, 0.25)",
              background: "rgba(200, 169, 107, 0.08)",
              textAlign: "left",
            }}
          >
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>
              Email is not configured in development. Use this reset link instead:
            </p>
            <a
              href={devResetUrl}
              style={{ color: "var(--gold)", fontSize: "0.8125rem", wordBreak: "break-all" }}
            >
              {devResetUrl}
            </a>
          </div>
        ) : null}
        <Link href="/login" className="btn btn-ghost btn-full" style={{ display: "inline-flex", justifyContent: "center" }}>
          <ArrowLeft size={16} /> Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card p-8" style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "6px" }}>Forgot password?</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div>
          <label htmlFor="forgot-email" style={{ display: "block", fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 500 }}>
            Email address
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="input-gold"
            placeholder="you@gmail.com"
            style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--noir-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "0.9375rem", transition: "border-color 150ms" }}
          />
          {errors.email && (
            <p role="alert" style={{ color: "var(--error)", fontSize: "0.8125rem", marginTop: "4px" }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <button id="btn-forgot-submit" type="submit" disabled={isSubmitting} className="btn btn-gold btn-full">
          {isSubmitting && <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />}
          {isSubmitting ? "Sending link…" : "Send reset link"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <Link href="/login" style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
