import Link from "next/link";
import { getAllWeeks } from "@/lib/weeks";
import { Greeting } from "@/components/Greeting";
import { ScrollReveal } from "@/components/ScrollReveal";
import styles from "./page.module.css";

/* 수업 과제 상세의 산출물 형식(괄호 안 표기)을 기준으로 묶는다.
   묶음 순서는 각 묶음의 첫 주차 번호 순. */
const STAGES = [
  { title: "그래프", weeks: [0] },
  { title: "글", weeks: [1, 2] },
  { title: "음성", weeks: [3] },
  { title: "링크", weeks: [4, 7, 8] },
  { title: "이미지", weeks: [5] },
  { title: "기획서, 실연", weeks: [6] },
  { title: "직접 결정", weeks: [9] },
] as const;

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

        <div className={styles.stages}>
          {STAGES.map((stage, stageIndex) => {
            const stageWeeks = weeks.filter((w) =>
              (stage.weeks as readonly number[]).includes(w.week),
            );

            return (
              <ScrollReveal key={stage.title} delay={stageIndex * 110}>
                <section className={styles.stage}>
                  <h3 className={styles.stageTitle}>{stage.title}</h3>
                  <ol className={styles.list}>
                    {stageWeeks.map((w) => {
                      const isDone = w.status === "done";
                      const label = (
                        <>
                          <span className={styles.weekNumber}>
                            {String(w.week).padStart(2, "0")}
                          </span>
                          <span className={styles.constraint}>
                            {w.constraint}
                          </span>
                        </>
                      );

                      return (
                        <li key={w.week} className={styles.item}>
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
                </section>
              </ScrollReveal>
            );
          })}
        </div>
      </section>
    </main>
  );
}
