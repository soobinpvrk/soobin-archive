import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MagazineViewer } from "@/components/MagazineViewer";
import { MAGAZINES, getMagazine } from "@/data/magazine";
import styles from "./page.module.css";

/* 번외 — 매거진. 수업 산출물 밖의 작업이라 /introduction 아래가 아닌
   /extra 아래에 둔다. 한 권에 한 주소(/extra/magazine/<slug>). */
export function generateStaticParams() {
  return MAGAZINES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/extra/magazine/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const magazine = getMagazine(slug);
  if (!magazine) return {};
  return {
    title: `${magazine.label} — 매거진 — 수빈이네`,
    description: `${magazine.title} — ${magazine.subtitle}. 3D로 넘겨 보는 인터뷰 매거진.`,
  };
}

export default async function MagazinePage({
  params,
}: PageProps<"/extra/magazine/[slug]">) {
  const { slug } = await params;
  const magazine = getMagazine(slug);
  if (!magazine) notFound();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.breadcrumb} aria-label="현재 위치">
          <Link href="/">수빈이네</Link>
          <span className={styles.separator} aria-hidden="true">/</span>
          <Link href="/#introduction">번외</Link>
          <span className={styles.separator} aria-hidden="true">/</span>
          <Link href={`/extra/magazine/${magazine.slug}`} aria-current="page">
            매거진
          </Link>
        </nav>

        <nav className={styles.tabs} aria-label="매거진">
          {MAGAZINES.map((m) => (
            <Link
              key={m.slug}
              href={`/extra/magazine/${m.slug}`}
              className={styles.tab}
              aria-current={m.slug === magazine.slug ? "page" : undefined}
            >
              {m.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* 권이 바뀌면 3D 장면을 새로 만든다 */}
      <MagazineViewer key={magazine.slug} magazine={magazine} />
    </main>
  );
}
