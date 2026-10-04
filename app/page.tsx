import Link from "next/link";
import { getAllWeeks } from "@/lib/weeks";
import { Greeting } from "@/components/Greeting";
import { ScrollReveal } from "@/components/ScrollReveal";
import styles from "./page.module.css";

/* 수업 과제 상세의 산출물 형식(괄호 안 표기). 목록은 주차 번호 순으로 두고
   형식은 바로 위 줄과 다를 때만 보인다. */
const FORMATS: Record<number, string> = {
  0: "그래프",
  1: "글",
  2: "글",
  3: "음성",
  4: "링크",
  5: "이미지",
  6: "기획서, 실연",
  7: "링크",
  8: "링크",
  9: "직접 결정",
};

export default function HomePage() {
  const weeks = getAllWeeks();

  return (
    <main>
      <section className={styles.hero}>
        <Greeting />
      </section>

      <section id="introduction" className={styles.index}>
        <ScrollReveal>
          <header className={styles.intro}>
            <h2 className={styles.indexTitle}>Self-Introduction</h2>
            <p className={styles.indexSubtitle}>자신만의 공간</p>
            <p className={styles.description}>
              10주 동안 매주 다른 제약 하나로 자기소개를 수행하고, 그 결과물을
              이곳에 쌓아 올린다.
            </p>
          </header>
        </ScrollReveal>

        <ScrollReveal>
          <ol className={styles.list}>
            {weeks.map((w, i) => {
              const isDone = w.status === "done";
              const format = FORMATS[w.week] ?? "";
              const showFormat = i === 0 || FORMATS[weeks[i - 1].week] !== format;
              const label = (
                <>
                  <span className={styles.weekNumber}>
                    {String(w.week).padStart(2, "0")}
                  </span>
                  <span className={styles.constraint}>{w.constraint}</span>
                </>
              );

              return (
                <li key={w.week} className={styles.item}>
                  <span className={styles.format}>
                    {showFormat ? format : ""}
                  </span>
                  {isDone ? (
                    <Link
                      href={`/introduction/${w.week}`}
                      className={styles.itemLink}
                    >
                      {label}
                    </Link>
                  ) : (
                    <span
                      className={`${styles.itemLink} ${styles.upcoming}`}
                      aria-disabled="true"
                    >
                      {label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </ScrollReveal>
      </section>
    </main>
  );
}
