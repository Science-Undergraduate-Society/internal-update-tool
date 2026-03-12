"use client";

import { useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
