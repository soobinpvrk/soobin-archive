import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllWeeks } from "@/lib/weeks";
import { FigureWithCaption } from "@/components/FigureWithCaption";
import { InterviewPlayer } from "@/components/InterviewPlayer";
import { LifeGraph } from "@/components/LifeGraph";
import { QA } from "@/components/QA";
import { RotatingHomeButton } from "@/components/RotatingHomeButton";
import { SectionTitle, headingClassName } from "@/components/SectionTitle";
import { WeekToc } from "@/components/WeekToc";
import styles from "./page.module.css";

/* 전용 페이지가 있는 주차는 app/introduction/<번호>/page.tsx가 맡는다. */
const DEDICATED_WEEKS = new Set([5]);

export function generateStaticParams() {
  return getAllWeeks()
    .filter((w) => !DEDICATED_WEEKS.has(w.week))
    .map((w) => ({ week: String(w.week) }));
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

      <WeekToc weeks={weeks} current={current.week} />

      <article className={styles.week}>
        <header className={styles.header}>
          <p className={styles.weekLabel}>
            Week {String(current.week).padStart(2, "0")}
          </p>
          <h1 className={`${headingClassName} ${styles.title}`}>{current.constraint}</h1>
        </header>

        <div
          className={`${styles.body} ${
            current.week === 2 ? styles.storyBody : ""
          }`}
        >
          <MDXRemote
            source={current.content}
            components={{
              FigureWithCaption,
              InterviewPlayer,
              LifeGraph,
              QA,
              SectionTitle,
            }}
          />
        </div>
      </article>
    </main>
  );
}
