"use client";

import { useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import styles from "./login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL ?? "";
    if (!email.endsWith("@sus.ubc.ca") && email !== testEmail) {
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
    <div className={styles.page}>

      {/* Floating help button */}
      <button className={styles.helpButton} onClick={() => setHelpOpen(true)}>
        ?
      </button>

      {/* Help modal */}
      {helpOpen && (
        <div className={styles.modalOverlay} onClick={() => setHelpOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalHeading}>How to sign in</h2>
            <ol className={styles.modalSteps}>
              <li>Enter your <strong>@sus.ubc.ca</strong> email address and click <em>Send Sign-in Link</em>.</li>
              <li>You will receive an email from <strong>noreply@internal-updates-f2609.firebaseapp.com</strong>. Check your spam folder — it may land there the first time.</li>
              <li>Click the link in the email. You will be signed in automatically.</li>
            </ol>
            <p className={styles.modalTip}>
              Tip: add <strong>noreply@internal-updates-f2609.firebaseapp.com</strong> to your whitelist to avoid the spam folder next time.
            </p>
            <p className={styles.modalNote}>
              The sign-in link expires after a short time. If it has expired, go back and request a new one.
            </p>
            <button className={styles.modalDismissButton} onClick={() => setHelpOpen(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      <div className={styles.card}>
        {sent ? (
          <>
            <h1 className={styles.sentHeading}>Check your email</h1>
            <p className={styles.sentBody}>
              A sign-in link has been sent to <strong>{email}</strong>. Click the link in the email to sign in.
            </p>
            <button className={styles.changeEmailButton} onClick={() => setSent(false)}>
              Use a different email
            </button>
          </>
        ) : (
          <>
            <div className={styles.cardHeadingGroup}>
              <h1 className={styles.cardHeading}>SUS Internal Tool</h1>
              <p className={styles.cardSubtitle}>
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

              {error && <p className={styles.errorMessage}>{error}</p>}

              <button type="submit" disabled={loading} className={styles.submitButton}>
                {loading ? "Sending..." : "Send Sign-in Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
