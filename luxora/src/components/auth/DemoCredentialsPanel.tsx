"use client";

import { useState } from "react";
import { Copy, Check, LogIn, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

type Account = {
  label: string;
  role: string;
  email: string;
  password: string;
  badge: string;
  badgeClass: string;
};

const DEMO_ACCOUNTS: Account[] = [
  {
    label: "Client Admin Demo",
    role: "Read-Only Admin",
    email: "demo-admin@luxora.com",
    password: "DemoAdmin123!",
    badge: "DEMO ADMIN",
    badgeClass: "demo-creds-badge--amber",
  },
  {
    label: "Client User Demo",
    role: "Customer",
    email: "demo@luxora.com",
    password: "Demo123!",
    badge: "CUSTOMER",
    badgeClass: "demo-creds-badge--blue",
  },
];

interface DemoCredentialsPanelProps {
  onAutofill: (email: string, password: string) => void;
}

export function DemoCredentialsPanel({ onAutofill }: DemoCredentialsPanelProps) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCopy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  return (
    <div className="demo-creds-panel">
      <button
        type="button"
        className="demo-creds-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="demo-creds-body"
      >
        <span className="demo-creds-header-left">
          <span className="demo-creds-dot" aria-hidden="true" />
          <span className="demo-creds-title">Test Credentials</span>
        </span>
        {open ? (
          <ChevronUp size={14} className="demo-creds-chevron" aria-hidden="true" />
        ) : (
          <ChevronDown size={14} className="demo-creds-chevron" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div id="demo-creds-body" className="demo-creds-body">
          <p className="demo-creds-hint">
            Click <strong>Use</strong> to auto-fill any account into the login form.
          </p>

          {DEMO_ACCOUNTS.map((account) => (
            <div key={account.email} className="demo-creds-card">
              <div className="demo-creds-card-header">
                <div className="demo-creds-card-info">
                  <span className="demo-creds-account-label">{account.label}</span>
                  <span className={`demo-creds-badge ${account.badgeClass}`}>
                    {account.badge}
                  </span>
                </div>
              </div>

              <div className="demo-creds-row">
                <span className="demo-creds-field-label">Email</span>
                <span className="demo-creds-field-value">{account.email}</span>
                <button
                  type="button"
                  className="demo-creds-copy"
                  onClick={() => handleCopy(account.email, `${account.email}-email`)}
                  aria-label={`Copy email ${account.email}`}
                >
                  {copied === `${account.email}-email` ? (
                    <Check size={12} className="demo-creds-copy-check" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>

              <div className="demo-creds-row">
                <span className="demo-creds-field-label">Password</span>
                <span className="demo-creds-field-value">{account.password}</span>
                <button
                  type="button"
                  className="demo-creds-copy"
                  onClick={() => handleCopy(account.password, `${account.email}-pass`)}
                  aria-label={`Copy password for ${account.email}`}
                >
                  {copied === `${account.email}-pass` ? (
                    <Check size={12} className="demo-creds-copy-check" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>

              <button
                type="button"
                className="demo-creds-use-btn"
                onClick={() => onAutofill(account.email, account.password)}
              >
                <LogIn size={13} aria-hidden="true" />
                Use this account
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
