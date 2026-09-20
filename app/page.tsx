import Link from "next/link";
import { getAllWeeks } from "@/lib/weeks";
import styles from "./page.module.css";

const STAGES = [
  { title: "글과 그래프", from: 0, to: 3 },
  { title: "목소리, 영상, 이미지", from: 4, to: 6 },
  { title: "몸, 장소, 도구", from: 7, to: 9 },
] as const;

export default function HomePage() {
  const weeks = getAllWeeks();

  return (
    <main className={styles.main}>
      <header className={styles.intro}>
        <p className={styles.kicker}>Phi Institute of Design — Self-Introduction</p>
        <h1 className={styles.siteTitle}>자신만의 공간</h1>
        <p className={styles.description}>
          10주 동안 매주 다른 제약 하나로 자기소개를 수행하고, 그 결과물을
          이곳에 쌓아 올린다.
        </p>
      </header>

      {STAGES.map((stage) => {
        const stageWeeks = weeks.filter(
          (w) => w.week >= stage.from && w.week <= stage.to,
        );

        return (
          <section key={stage.title} className={styles.stage}>
            <h2 className={styles.stageTitle}>{stage.title}</h2>
            <ol className={styles.list}>
              {stageWeeks.map((w) => {
                const isDone = w.status === "done";
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
                    {isDone ? (
                      <Link href={`/${w.week}`} className={styles.itemLink}>
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
        );
      })}
    </main>
  );
}
