"use client";

import { useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.endsWith("@sus.ubc.ca")) {
      setError("Email must end in @sus.ubc.ca");
      return;
    }

    setLoading(true);
    try {
      await sendSignInLinkToEmail(auth, email, {
        url: `${window.location.origin}/auth/callback`,
        handleCodeInApp: true,
      });
      localStorage.setItem("emailForSignIn", email);
      setSent(true);
    } catch (err) {
      console.error(err);
      setError("Failed to send sign-in link. Please try again.");
    } finally {
      setLoading(false);
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
      {/* Floating help button */}
      <button
        onClick={() => setHelpOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "var(--navy)",
          color: "white",
          fontSize: "1.1rem",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ?
      </button>

      {/* Help modal */}
      {helpOpen && (
        <div
          onClick={() => setHelpOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "white", borderRadius: "12px", padding: "32px", maxWidth: "420px", width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
          >
            <h2 style={{ margin: "0 0 16px", fontSize: "1.1rem" }}>How to sign in</h2>
            <ol style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.9rem", lineHeight: 1.7, color: "var(--text-muted)" }}>
              <li>Enter your <strong>@sus.ubc.ca</strong> email address and click <em>Send Sign-in Link</em>.</li>
              <li>You will receive an email from <strong>noreply@internal-updates-f2609.firebaseapp.com</strong>. Check your spam folder — it may land there the first time.</li>
              <li>Click the link in the email. You will be signed in automatically.</li>
            </ol>
            <p style={{ margin: "16px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Tip: add <strong>noreply@internal-updates-f2609.firebaseapp.com</strong> to your whitelist to avoid the spam folder next time.
            </p>
            <p style={{ margin: "10px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              The sign-in link expires after a short time. If it has expired, go back and request a new one.
            </p>
            <button
              onClick={() => setHelpOpen(false)}
              style={{ marginTop: "24px", width: "100%" }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
      <div style={{
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "40px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        {sent ? (
          <>
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Check your email</h1>
            <p style={{ color: "var(--text-muted)", marginTop: "12px", fontSize: "0.9rem" }}>
              A sign-in link has been sent to <strong>{email}</strong>. Click the link in the email to sign in.
            </p>
            <button
              onClick={() => setSent(false)}
              style={{ marginTop: "24px", width: "100%", background: "transparent", color: "var(--navy)", border: "1px solid var(--border)" }}
            >
              Use a different email
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{ margin: 0, fontSize: "1.5rem" }}>SUS Internal Tool</h1>
              <p style={{ color: "var(--text-muted)", marginTop: "6px", fontSize: "0.9rem" }}>
                Enter your @sus.ubc.ca email to receive a sign-in link.
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

              {error && (
                <p style={{ color: "var(--error)", fontSize: "0.875rem" }}>{error}</p>
              )}

              <button type="submit" disabled={loading} style={{ width: "100%", marginTop: "8px" }}>
                {loading ? "Sending..." : "Send Sign-in Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
