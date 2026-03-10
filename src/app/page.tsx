"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.endsWith("@sus.ubc.ca")) {
      setError("Email must end in @sus.ubc.ca");
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", {
      email,
      code,
      callbackUrl: "/dashboard",
      redirect: false,
    });
    setLoading(false);

    if (!res?.ok) {
      setError("Invalid email or verification code.");
    } else {
      window.location.href = res.url ?? "/dashboard";
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--surface)",
    }}>
      <div style={{
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "40px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>SUS Internal Tool</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "6px", fontSize: "0.9rem" }}>
            Sign in with your @sus.ubc.ca email and verification code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="stack">
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@sus.ubc.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="code">Verification Code</label>
            <input
              id="code"
              type="password"
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{ color: "var(--error)", fontSize: "0.875rem" }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={{ width: "100%", marginTop: "8px" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
