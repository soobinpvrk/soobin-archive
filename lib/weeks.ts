import fs from "fs";
import path from "path";
import matter from "gray-matter";

const WEEKS_DIR = path.join(process.cwd(), "content/weeks");

export type WeekStatus = "done" | "upcoming";

export type WeekFrontmatter = {
  week: number;
  constraint: string;
  title: string;
  date: string;
  status: WeekStatus;
};

export type WeekEntry = WeekFrontmatter & {
  content: string;
};

export function getAllWeeks(): WeekEntry[] {
  const files = fs.readdirSync(WEEKS_DIR).filter((f) => f.endsWith(".mdx"));

  const weeks = files.map((file) => {
    const raw = fs.readFileSync(path.join(WEEKS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    return {
      ...(data as WeekFrontmatter),
      content,
    };
  });

  return weeks.sort((a, b) => a.week - b.week);
}

export function getWeek(weekNumber: number): WeekEntry | undefined {
  return getAllWeeks().find((w) => w.week === weekNumber);
}
