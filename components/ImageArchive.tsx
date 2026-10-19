"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ArchiveImage } from "@/data/introduction-5";
import styles from "./ImageArchive.module.css";

/* src가 null이면 파일이 아직 없는 자리라 회색 플레이스홀더로 그린다. */
export type ArchiveItem = Omit<ArchiveImage, "src"> & { src: string | null };

type View = "grid" | "table";

type Props = {
  items: ArchiveItem[];
  about: string;
  author: string;
  started: string;
  modified: string;
};

export function ImageArchive({ items, about, author, started, modified }: Props) {
  const [view, setView] = useState<View>("grid");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((i) =>
        i === null ? i : (i + delta + items.length) % items.length,
      ),
    [items.length],
  );

  return (
    <>
      <section className={styles.info}>
        <div className={styles.infoColumn}>
          <h2 className={styles.infoLabel}>Info</h2>
          <dl className={styles.meta}>
            <dt>Started</dt>
            <dd>{started}</dd>
            <dt>Modified</dt>
            <dd>{modified}</dd>
            <dt>Length</dt>
            <dd>
              {items.length} {items.length === 1 ? "image" : "images"}
            </dd>
          </dl>
        </div>

        <div className={`${styles.infoColumn} ${styles.about}`}>
          <h2 className={styles.infoLabel}>About</h2>
          <p className={styles.aboutText}>{about}</p>
        </div>

        <div className={styles.infoColumn}>
          <h2 className={styles.infoLabel}>View</h2>
          <div className={styles.toggle} role="group" aria-label="보기 방식">
            {(["grid", "table"] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={styles.toggleButton}
                aria-pressed={view === v}
                onClick={() => setView(v)}
              >
                {v === "grid" ? "Grid" : "Table"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {view === "grid" ? (
        <ul className={styles.grid}>
          <li className={styles.cell}>
            {/* 업로드 기능은 없다. 모양만 보여 주는 자리. */}
            <div className={`${styles.square} ${styles.dropzone}`} aria-hidden="true">
              <span>Drop or choose files</span>
            </div>
          </li>
          {items.map((item, index) => (
            <li key={item.id} className={styles.cell}>
              <button
                type="button"
                className={styles.cellButton}
                onClick={() => setOpenIndex(index)}
              >
                <span className={styles.square}>
                  <Thumb item={item} sizes="(max-width: 600px) 50vw, (max-width: 1024px) 33vw, 20vw" />
                </span>
                <span className={styles.cellTitle}>{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.thumbCol}>
                <span className={styles.visuallyHidden}>썸네일</span>
              </th>
              <th scope="col">Title</th>
              <th scope="col" className={styles.dateCol}>Added</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} onClick={() => setOpenIndex(index)}>
                <td>
                  <span className={styles.tableThumb}>
                    <Thumb item={item} sizes="56px" />
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className={styles.rowButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenIndex(index);
                    }}
                  >
                    {item.title}
                  </button>
                </td>
                <td className={styles.dateCol}>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {openIndex !== null && (
        <Detail
          item={items[openIndex]}
          author={author}
          onClose={close}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
        />
      )}
    </>
  );
}

function Thumb({ item, sizes }: { item: ArchiveItem; sizes: string }) {
  if (!item.src) return <span className={styles.placeholder} />;
  return (
    <Image
      src={item.src}
      alt={item.title}
      fill
      sizes={sizes}
      className={styles.image}
    />
  );
}

type DetailProps = {
  item: ArchiveItem;
  author: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

function Detail({ item, author, onClose, onPrev, onNext }: DetailProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [dimensions, setDimensions] = useState<{ src: string; value: string } | null>(null);

  /* 열린 동안 배경 스크롤을 잠그고, 닫히면 원래 포커스로 돌려준다. */
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      html.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  /* next/image는 줄인 사본을 내려주므로 실제 크기는 원본을 따로 읽는다. */
  useEffect(() => {
    if (!item.src) return;
    const src = item.src;
    const img = new window.Image();
    img.onload = () =>
      setDimensions({ src, value: `${img.naturalWidth} × ${img.naturalHeight}` });
    img.src = src;
    return () => {
      img.onload = null;
    };
  }, [item.src]);

  const dimensionText = !item.src
    ? "—"
    : dimensions?.src === item.src
      ? dimensions.value
      : "Loading…";

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.controls}>
        <button type="button" className={styles.control} onClick={onPrev} aria-label="이전 이미지">
          ←
        </button>
        <button type="button" className={styles.control} onClick={onNext} aria-label="다음 이미지">
          →
        </button>
        <button
          ref={closeRef}
          type="button"
          className={styles.control}
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>
      </div>

      <div
        className={styles.stage}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className={styles.stageFrame}>
          {item.src ? (
            <Image
              key={item.src}
              src={item.src}
              alt={item.title}
              fill
              sizes="(max-width: 860px) 100vw, 70vw"
              className={styles.image}
              priority
            />
          ) : (
            <span className={styles.placeholder} />
          )}
        </div>
      </div>

      <aside className={styles.panel}>
        <h2 className={styles.panelTitle}>{item.title}</h2>
        <p className={styles.panelDate}>{item.date}</p>
        <p className={styles.panelDescription}>{item.description}</p>
        <dl className={`${styles.meta} ${styles.panelMeta}`}>
          <dt>Added</dt>
          <dd>{item.date}</dd>
          <dt>By</dt>
          <dd>{author}</dd>
          <dt>Dimensions</dt>
          <dd>{dimensionText}</dd>
        </dl>
      </aside>
    </div>
  );
}
