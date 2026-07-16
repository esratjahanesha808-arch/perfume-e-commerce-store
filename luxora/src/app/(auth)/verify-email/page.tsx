"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type State = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, setState] = useState<State>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("error");
      setErrorMessage("Missing verification token.");
      return;
    }

    async function verify() {
      const res = await fetch("/api/v1/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const json = await res.json();

      if (!res.ok) {
        setState("error");
        setErrorMessage(json.error?.message ?? "Verification failed.");
      } else {
        setState("success");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="auth-card p-8" style={{ textAlign: "center" }}>
      {state === "loading" && (
        <>
          <Loader2 size={48} style={{ color: "var(--gold)", margin: "0 auto 1.5rem", animation: "spin 1s linear infinite" }} />
          <h2 style={{ marginBottom: "12px" }}>Verifying your email…</h2>
          <p style={{ color: "var(--text-secondary)" }}>Please wait a moment.</p>
        </>
      )}

      {state === "success" && (
        <>
          <CheckCircle size={48} style={{ color: "var(--success)", margin: "0 auto 1.5rem" }} />
          <h2 style={{ marginBottom: "12px" }}>Email verified!</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Your account is now active. Welcome to Luxora.
          </p>
          <Link href="/login" className="btn btn-gold" style={{ display: "inline-flex" }}>
            Sign In
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <AlertCircle size={48} style={{ color: "var(--error)", margin: "0 auto 1.5rem" }} />
          <h2 style={{ marginBottom: "12px" }}>Verification failed</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            {errorMessage || "This link is invalid or has expired."}
          </p>
          <Link href="/register" className="btn btn-gold" style={{ display: "inline-flex" }}>
            Create a new account
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-card p-8" style={{ textAlign: "center" }}>
          <Loader2 size={48} style={{ color: "var(--gold)", margin: "0 auto 1.5rem", animation: "spin 1s linear infinite" }} />
          <h2 style={{ marginBottom: "12px" }}>Loading…</h2>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
