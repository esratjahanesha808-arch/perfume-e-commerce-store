"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  if (!token) {
    return (
      <div className="auth-card p-8" style={{ textAlign: "center" }}>
        <AlertCircle size={48} style={{ color: "var(--error)", margin: "0 auto 1.5rem" }} />
        <h2 style={{ marginBottom: "12px" }}>Invalid link</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          This reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password" className="btn btn-gold btn-full" style={{ display: "inline-flex", justifyContent: "center" }}>
          Request new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-card p-8" style={{ textAlign: "center" }}>
        <CheckCircle size={48} style={{ color: "var(--success)", margin: "0 auto 1.5rem" }} />
        <h2 style={{ marginBottom: "12px" }}>Password updated</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          Your password has been reset successfully.
        </p>
        <Link href="/login" className="btn btn-gold btn-full" style={{ display: "inline-flex", justifyContent: "center" }}>
          Sign In
        </Link>
      </div>
    );
  }

  async function onSubmit(data: ResetPasswordInput) {
    const res = await fetch("/api/v1/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      const code = json.error?.code;
      if (code === "INVALID_TOKEN" || code === "TOKEN_EXPIRED") {
        toast.error("This reset link is invalid or has expired. Please request a new one.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      return;
    }

    setDone(true);
  }

  return (
    <div className="auth-card p-8" style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "6px" }}>Set new password</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <input type="hidden" {...register("token")} />

        <div>
          <label htmlFor="reset-password" style={labelStyles}>New password</label>
          <div style={{ position: "relative" }}>
            <input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
              className="input-gold"
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              style={{ ...inputStyles, paddingRight: "44px" }}
            />
            <ToggleBtn show={showPassword} toggle={() => setShowPassword(!showPassword)} />
          </div>
          {errors.password && <FieldError message={errors.password.message!} />}
        </div>

        <div>
          <label htmlFor="reset-confirm" style={labelStyles}>Confirm password</label>
          <div style={{ position: "relative" }}>
            <input
              id="reset-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="input-gold"
              placeholder="Repeat your new password"
              style={{ ...inputStyles, paddingRight: "44px" }}
            />
            <ToggleBtn show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
          </div>
          {errors.confirmPassword && <FieldError message={errors.confirmPassword.message!} />}
        </div>

        <button id="btn-reset-submit" type="submit" disabled={isSubmitting} className="btn btn-gold btn-full">
          {isSubmitting && <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />}
          {isSubmitting ? "Saving…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}

function ToggleBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button type="button" onClick={toggle} aria-label={show ? "Hide" : "Show"}
      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

function FieldError({ message }: { message: string }) {
  return <p role="alert" style={{ color: "var(--error)", fontSize: "0.8125rem", marginTop: "4px" }}>{message}</p>;
}

const labelStyles: React.CSSProperties = { display: "block", fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 500 };
const inputStyles: React.CSSProperties = { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--noir-border)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "0.9375rem", transition: "border-color 150ms" };

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-card p-8" style={{ textAlign: "center" }}>
          <Loader2 size={48} style={{ color: "var(--gold)", margin: "0 auto 1.5rem", animation: "spin 1s linear infinite" }} />
          <h2 style={{ marginBottom: "12px" }}>Loading…</h2>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
