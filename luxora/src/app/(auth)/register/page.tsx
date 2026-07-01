"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { normalizeEmail } from "@/lib/normalize-email";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    const email = normalizeEmail(data.email);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name.trim(),
          email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message ?? "Registration failed. Please try again.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setSubmitted(true);
        toast.success("Account created! Please sign in with your email and password.");
        return;
      }

      toast.success("Welcome to Luxora!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    }
  }

  if (submitted) {
    return (
      <div className="auth-card text-center">
        <CheckCircle size={44} className="auth-success-icon" strokeWidth={1.5} />
        <header className="auth-header">
          <h2>Account created</h2>
          <p>Your account is ready. Sign in with your email and password.</p>
        </header>
        <Link href="/login" className="btn btn-gold btn-full auth-submit inline-flex justify-center">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <header className="auth-header">
        <h1>Create account</h1>
        <p>Use your personal email address, such as Gmail or Outlook.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
        <div className="auth-field">
          <label htmlFor="register-name" className="auth-label">
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            {...register("name")}
            className="input-gold"
            placeholder="Your full name"
          />
          {errors.name && <FieldError message={errors.name.message!} />}
        </div>

        <div className="auth-field">
          <label htmlFor="register-email" className="auth-label">
            Email address
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="input-gold"
            placeholder="you@gmail.com"
          />
          {errors.email && <FieldError message={errors.email.message!} />}
        </div>

        <div className="auth-field">
          <label htmlFor="register-password" className="auth-label">
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
              className="input-gold pr-11"
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
            />
            <PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
          </div>
          {errors.password && <FieldError message={errors.password.message!} />}
        </div>

        <div className="auth-field">
          <label htmlFor="register-confirm" className="auth-label">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="register-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="input-gold pr-11"
              placeholder="Repeat your password"
            />
            <PasswordToggle show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
          </div>
          {errors.confirmPassword && <FieldError message={errors.confirmPassword.message!} />}
        </div>

        <p className="auth-hint">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-[var(--gold-muted)] hover:text-[var(--gold)] transition-colors">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[var(--gold-muted)] hover:text-[var(--gold)] transition-colors">
            Privacy Policy
          </Link>
          .
        </p>

        <button
          id="btn-register-submit"
          type="submit"
          disabled={isSubmitting}
          className="btn btn-gold btn-full auth-submit"
        >
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--gold)] font-semibold hover:text-[var(--gold-hover)] transition-colors">
          Sign in
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
