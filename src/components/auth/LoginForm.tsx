"use client";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  return (
    <div>
      <h1>SUS Admin Portal</h1>
      <p>Sign in with your @sus.ubc.ca Google account</p>
      <button onClick={() => signIn("google")}>
        Sign in with Google
      </button>
    </div>
  );
}
