import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { ImageArchive } from "@/components/ImageArchive";
import { RotatingHomeButton } from "@/components/RotatingHomeButton";
import { WeekToc } from "@/components/WeekToc";
import { ABOUT, AUTHOR, IMAGES } from "@/data/introduction-5";
import { getAllWeeks } from "@/lib/weeks";
import styles from "./page.module.css";

/* 05 이미지는 MDX 본문 대신 전용 페이지로 둔다. 정적 세그먼트라
   [week] 동적 라우트보다 먼저 잡힌다. */
export const metadata: Metadata = {
  title: "05 이미지 — 수빈이네",
};

export default function ImageArchivePage() {
  /* 파일이 아직 public/에 없는 항목은 src를 비워 플레이스홀더로 그린다. */
  const items = IMAGES.map((item) => ({
    ...item,
    src: fs.existsSync(path.join(process.cwd(), "public", item.src))
      ? item.src
      : null,
  }));

  const dates = IMAGES.map((item) => item.date).sort();

  return (
    <main className={styles.layout}>
      <RotatingHomeButton />

      <WeekToc weeks={getAllWeeks()} current={5} />

      <div className={styles.archive}>
        <nav className={styles.breadcrumb} aria-label="현재 위치">
          <Link href="/">수빈이네</Link>
          <span className={styles.separator} aria-hidden="true">/</span>
          <Link href="/#introduction">Self-Introduction</Link>
          <span className={styles.separator} aria-hidden="true">/</span>
          <Link href="/introduction/5" aria-current="page">
            05 이미지
          </Link>
        </nav>

        <ImageArchive
          items={items}
          about={ABOUT}
          author={AUTHOR}
          started={dates[0] ?? "—"}
          modified={dates[dates.length - 1] ?? "—"}
        />
      </div>
    </main>
  );
}
