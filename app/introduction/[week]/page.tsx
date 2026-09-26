import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllWeeks } from "@/lib/weeks";
import { FigureWithCaption } from "@/components/FigureWithCaption";
import { LifeGraph } from "@/components/LifeGraph";
import { QA } from "@/components/QA";
import { RotatingHomeButton } from "@/components/RotatingHomeButton";
import styles from "./page.module.css";

export function generateStaticParams() {
  return getAllWeeks().map((w) => ({ week: String(w.week) }));
}

export default async function WeekPage({
  params,
}: PageProps<"/introduction/[week]">) {
  const { week } = await params;
  const weekNumber = Number(week);

  const weeks = getAllWeeks();
  const index = weeks.findIndex((w) => w.week === weekNumber);
  if (index === -1) notFound();

  const current = weeks[index];

  return (
    <main className={styles.layout}>
      <RotatingHomeButton />

      <aside className={styles.toc}>
        <nav aria-label="자기소개 주차 목차">
          <ol className={styles.tocList}>
            {weeks.map((entry) => {
              const isCurrent = entry.week === current.week;
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

      <article className={styles.week}>
        <header className={styles.header}>
          <p className={styles.weekLabel}>
            Week {String(current.week).padStart(2, "0")}
          </p>
          <h1 className={styles.title}>{current.constraint}</h1>
        </header>

        <div
          className={`${styles.body} ${
            current.week === 2 ? styles.storyBody : ""
          }`}
        >
          <MDXRemote
            source={current.content}
            components={{ FigureWithCaption, LifeGraph, QA }}
          />
        </div>
      </article>
    </main>
  );
}
