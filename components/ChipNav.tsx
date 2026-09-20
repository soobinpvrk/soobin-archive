"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./ChipNav.module.css";

const CHIPS = [{ label: "Introduction", href: "/introduction" }] as const;

export function ChipNav() {
  const pathname = usePathname();

  return (
    <header className={styles.nav}>
      <Link href="/" className={styles.brand}>
        soobinpark
      </Link>
      <nav className={styles.chips}>
        {CHIPS.map((chip) => {
          const active =
            pathname === chip.href || pathname.startsWith(`${chip.href}/`);

          return (
            <Link
              key={chip.href}
              href={chip.href}
              className={`${styles.chip} ${active ? styles.active : ""}`}
            >
              {chip.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
