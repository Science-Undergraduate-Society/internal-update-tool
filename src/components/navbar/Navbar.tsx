"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { REVIEW_ROLES } from "../../lib/auth";
import { PAGE_HELP, DEFAULT_HELP } from "./helpContent";
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
  const [helpOpen, setHelpOpen] = useState(false);

  const role = session?.user?.name;
  const canReview = role ? REVIEW_ROLES.includes(role) : false;

  const help = PAGE_HELP[pathname] ?? DEFAULT_HELP;

  return (
    <>
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

        <div className={styles.navRight}>
          {!isLogin && (
            <button className={styles.helpIconButton} onClick={() => setHelpOpen(true)}>?</button>
          )}
          {!isLogin && (
            <button className={styles.signOutButton} onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </button>
          )}
        </div>
      </nav>

      {helpOpen && (
        <div className={styles.modalOverlay} onClick={() => setHelpOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalHeading}>{help.title}</h2>
            <div className={styles.modalBody}>{help.content}</div>
            <button className={styles.dismissButton} onClick={() => setHelpOpen(false)}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}
