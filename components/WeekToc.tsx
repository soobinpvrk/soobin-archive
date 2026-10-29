import Link from "next/link";
import type { WeekFrontmatter } from "@/lib/weeks";
import styles from "./WeekToc.module.css";

type Props = {
  weeks: WeekFrontmatter[];
  /** 현재 항목으로 표시할 주차 번호 */
  current: number;
};

/* 주차 상세와 05 이미지 상세가 함께 쓰는 왼쪽 주차 목차.
   넓은 화면에서는 왼쪽에 고정되고, 720px 이하에서는 본문 위로 올라간다. */
export function WeekToc({ weeks, current }: Props) {
  return (
    <aside className={styles.toc}>
      <nav aria-label="자기소개 주차 목차">
        <ol className={styles.tocList}>
          {weeks.map((entry) => {
            const isCurrent = entry.week === current;
            const itemClassName = [
              styles.tocItem,
              entry.status !== "done" ? styles.upcoming : "",
              isCurrent ? styles.current : "",
            ]
              .filter(Boolean)
              .join(" ");
            const label = (
              <>
                <span className={styles.tocNumber}>
                  {String(entry.week).padStart(2, "0")}
                </span>
                <span>{entry.constraint}</span>
              </>
            );

            return (
              <li key={entry.week}>
                {entry.status === "done" ? (
                  <Link
                    href={`/introduction/${entry.week}`}
                    className={itemClassName}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    {label}
                  </Link>
                ) : (
                  <span className={itemClassName}>{label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
