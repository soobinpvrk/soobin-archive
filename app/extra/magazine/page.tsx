import type { Metadata } from "next";
import Link from "next/link";
import { MagazineViewer } from "@/components/MagazineViewer";
import { EXPLORATION } from "@/data/magazine";
import styles from "./page.module.css";

/* 번외 — 매거진. 수업 산출물 밖의 작업이라 /introduction 아래가 아닌
   /extra 아래에 둔다. */
export const metadata: Metadata = {
  title: "매거진 — 수빈이네",
  description: "EXPLORATION — 장난을 건네는 사람, 혼자 충전하는 사람. 3D로 넘겨 보는 인터뷰 매거진.",
};

export default function MagazinePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.breadcrumb} aria-label="현재 위치">
          <Link href="/">수빈이네</Link>
          <span className={styles.separator} aria-hidden="true">/</span>
          <Link href="/#introduction">번외</Link>
          <span className={styles.separator} aria-hidden="true">/</span>
          <Link href="/extra/magazine" aria-current="page">
            매거진
          </Link>
        </nav>
      </header>

      <MagazineViewer magazine={EXPLORATION} />
    </main>
  );
}
