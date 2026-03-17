"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { REVIEW_ROLES } from "../../lib/auth";
import styles from "./Navbar.module.css";

const links = [
  { href: "/submission", label: "Submission" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/review", label: "Review" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isLogin = pathname === "/";

  const role = session?.user?.name;
  const canReview = role ? REVIEW_ROLES.includes(role) : false;

  return (
    <nav className={styles.nav}>
      <span className={styles.logo}>SUS Internal</span>

      {!isLogin && links.filter(({ href }) => href !== "/review" || canReview).map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`${styles.navLink} ${pathname === href ? styles.navLinkActive : ""}`}
        >
          {label}
        </Link>
      ))}

      <span className={styles.helpText}>
        Having issues?{" "}
        <a href="mailto:webdeveloper@sus.ubc.ca" className={styles.helpLink}>
          Contact webdeveloper@sus.ubc.ca
        </a>
      </span>

      {!isLogin && (
        <button className={styles.signOutButton} onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </button>
      )}
    </nav>
  );
}
