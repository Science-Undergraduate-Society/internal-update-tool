"use client";

import { useEffect, useState } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { signIn } from "next-auth/react";
import { auth } from "../../../lib/firebase";

export default function AuthCallback() {
  const [status, setStatus] = useState<"verifying" | "error">("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    async function complete() {
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        setError("Invalid sign-in link.");
        setStatus("error");
        return;
      }

      let email = localStorage.getItem("emailForSignIn");
      if (!email) {
        // If opened on a different device, prompt for email
        email = window.prompt("Please enter your @sus.ubc.ca email to confirm:");
      }

      if (!email || !email.endsWith("@sus.ubc.ca")) {
        setError("Invalid email.");
        setStatus("error");
        return;
      }

      try {
        await signInWithEmailLink(auth, email, window.location.href);
        localStorage.removeItem("emailForSignIn");

        // Create NextAuth session using the verified email
        const res = await signIn("credentials", {
          email,
          callbackUrl: "/dashboard",
          redirect: false,
        });

        if (res?.ok) {
          window.location.href = res.url ?? "/dashboard";
        } else {
          setError("Failed to create session.");
          setStatus("error");
        }
      } catch (err) {
        console.error(err);
        setError("Sign-in failed. The link may have expired.");
        setStatus("error");
      }
    }

    complete();
  }, []);

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
        maxWidth: "400px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        {status === "verifying" && (
          <>
            <h1 style={{ fontSize: "1.5rem" }}>Signing you in...</h1>
            <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>Please wait.</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 style={{ fontSize: "1.5rem" }}>Sign-in failed</h1>
            <p style={{ color: "var(--error)", marginTop: "8px" }}>{error}</p>
            <a href="/" style={{ display: "block", marginTop: "24px", color: "var(--navy)" }}>← Back to login</a>
          </>
        )}
      </div>
    </div>
  );
}
