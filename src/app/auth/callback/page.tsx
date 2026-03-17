"use client";

import { useEffect, useState } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { signIn } from "next-auth/react";
import { auth } from "../../../lib/firebase";
import styles from "./callback.module.css";

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
        email = window.prompt("Please enter your @sus.ubc.ca email to confirm:");
      }

      const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL ?? "";
      if (!email || (!email.endsWith("@sus.ubc.ca") && email !== testEmail)) {
        setError("Invalid email.");
        setStatus("error");
        return;
      }

      try {
        await signInWithEmailLink(auth, email, window.location.href);
        localStorage.removeItem("emailForSignIn");

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
    <div className={styles.page}>
      <div className={styles.card}>
        {status === "verifying" && (
          <>
            <h1 className={styles.heading}>Signing you in...</h1>
            <p className={styles.body}>Please wait.</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className={styles.heading}>Sign-in failed</h1>
            <p className={styles.errorMessage}>{error}</p>
            <a href="/" className={styles.backLink}>← Back to login</a>
          </>
        )}
      </div>
    </div>
  );
}
