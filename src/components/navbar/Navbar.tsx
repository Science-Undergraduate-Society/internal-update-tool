"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { REVIEW_ROLES } from "../../lib/auth";

const links = [
  { href: "/submission", label: "Submission" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/review", label: "Review" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isLogin = pathname === "/";

  const role = session?.user?.email?.split("@")[0];
  const canReview = role ? REVIEW_ROLES.includes(role) : false;

  return (
    <nav style={{
      background: "var(--navy)",
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      height: "56px",
    }}>
      <span style={{
        color: "white",
        fontWeight: 700,
        fontSize: "1rem",
        marginRight: "24px",
        letterSpacing: "-0.01em",
      }}>
        SUS Internal
      </span>

      {!isLogin && links.filter(({ href }) => href !== "/review" || canReview).map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              color: active ? "white" : "rgba(255,255,255,0.6)",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: active ? 600 : 400,
              padding: "6px 12px",
              borderRadius: "6px",
              background: active ? "rgba(255,255,255,0.12)" : "transparent",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {label}
          </Link>
        );
      })}

      <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "rgba(255,255,255,0.55)" }}>
        Having issues?{" "}
        <a
          href="mailto:webdeveloper@sus.ubc.ca"
          style={{ color: "rgba(255,255,255,0.8)", textDecoration: "underline" }}
        >
          Contact webdeveloper@sus.ubc.ca
        </a>
      </span>
    </nav>
  );
}
