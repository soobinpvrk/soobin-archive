"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./ChipNav.module.css";

/* 목록은 메인 아래쪽 섹션이라 칩은 그 앵커로 간다.
   주차 상세(/introduction/0 등)에 있을 때만 활성으로 표시한다. */
const CHIPS = [{ label: "Introduction", href: "/#introduction" }] as const;

export function ChipNav() {
  const pathname = usePathname();
  const inIntroduction = pathname.startsWith("/introduction");

  return (
    <header className={styles.nav}>
      <Link href="/" className={styles.brand}>
        soobinpark
      </Link>
      <nav className={styles.chips}>
        {CHIPS.map((chip) => (
          <Link
            key={chip.href}
            href={chip.href}
            className={`${styles.chip} ${inIntroduction ? styles.active : ""}`}
          >
            {chip.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
