import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllWeeks } from "@/lib/weeks";
import { FigureWithCaption } from "@/components/FigureWithCaption";
import { LifeGraph } from "@/components/LifeGraph";
import { QA } from "@/components/QA";
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
  const prev = index > 0 ? weeks[index - 1] : undefined;
  const next = index < weeks.length - 1 ? weeks[index + 1] : undefined;

  return (
    <article className={styles.week}>
      <Link href="/introduction" className={styles.back}>
        ← 전체 목록
      </Link>

      <header className={styles.header}>
        <p className={styles.weekLabel}>
          Week {String(current.week).padStart(2, "0")}
        </p>
        <h1 className={styles.title}>{current.constraint}</h1>
        <p className={styles.meta}>
          {current.title} · {current.date}
        </p>
      </header>

      <div className={styles.body}>
        <MDXRemote
          source={current.content}
          components={{ FigureWithCaption, LifeGraph, QA }}
        />
      </div>

      <nav className={styles.pager}>
        {prev ? (
          <Link href={`/introduction/${prev.week}`} className={styles.pagerLink}>
            ← Week {String(prev.week).padStart(2, "0")} · {prev.constraint}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/introduction/${next.week}`} className={styles.pagerLink}>
            Week {String(next.week).padStart(2, "0")} · {next.constraint} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
