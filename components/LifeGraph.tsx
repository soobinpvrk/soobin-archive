"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { lifeGraphData, type LifePoint } from "@/content/life-graph";
import styles from "./LifeGraph.module.css";

const YEAR_MIN = 1996;
const YEAR_MAX = 2026;
const SCORE_MAX = 10;
const DESKTOP_PAD_X = 6;
const DESKTOP_PAD_Y = 22;
const GRID_SCORES = [10, 5, 0, -5, -10] as const;

function xFromYear(year: number) {
  const ratio = (year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN);
  return DESKTOP_PAD_X + ratio * (100 - DESKTOP_PAD_X * 2);
}

function yFromScore(score: number) {
  const halfHeight = 50 - DESKTOP_PAD_Y;
  return 50 - (score / SCORE_MAX) * halfHeight;
}

function formatScore(score: number) {
  return score > 0 ? `+${score}` : `${score}`;
}

function moveByArrowKey(
  key: string,
  index: number,
  total: number,
  refs: Array<HTMLButtonElement | null>,
) {
  const isNext = key === "ArrowRight" || key === "ArrowDown";
  const isPrev = key === "ArrowLeft" || key === "ArrowUp";
  if (!isNext && !isPrev) return null;
  const nextIndex = isNext
    ? Math.min(index + 1, total - 1)
    : Math.max(index - 1, 0);
  refs[nextIndex]?.focus();
  return nextIndex;
}

export function LifeGraph() {
  const data = [...lifeGraphData].sort((a, b) => a.year - b.year);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const desktopDotRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const mobileDotRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openPoint: LifePoint | null = openIndex === null ? null : data[openIndex];

  function openModal(index: number, trigger: HTMLElement) {
    triggerRef.current = trigger;
    setOpenIndex(index);
  }

  function closeModal() {
    setOpenIndex(null);
  }

  useEffect(() => {
    if (openIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeModal();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [openIndex]);

  const points = data.map((point, index) => ({
    point,
    index,
    x: xFromYear(point.year),
    y: yFromScore(point.score),
  }));

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <section className={styles.root} aria-label="인생그래프">
      <div className={styles.graphDesktop}>
        <svg
          className={styles.svg}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {GRID_SCORES.map((v) => (
            <line
              key={v}
              x1="0"
              x2="100"
              y1={yFromScore(v)}
              y2={yFromScore(v)}
              vectorEffect="non-scaling-stroke"
              className={v === 0 ? styles.gridZero : styles.gridLine}
            />
          ))}
          <polyline
            points={polylinePoints}
            vectorEffect="non-scaling-stroke"
            className={styles.line}
          />
        </svg>

        {points.map(({ point, index, x, y }) => {
          const isOpen = index === openIndex;
          const above = index % 2 === 0;

          return (
            <div
              key={point.year}
              className={styles.pointWrap}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div
                className={`${styles.textBlock} ${
                  above ? styles.textAbove : styles.textBelow
                }`}
              >
                <button
                  type="button"
                  className={styles.yearButton}
                  aria-haspopup="dialog"
                  aria-expanded={isOpen}
                  aria-label={`${point.year}년 사건 상세 보기`}
                  onClick={(e) => openModal(index, e.currentTarget)}
                >
                  {point.year}
                </button>
                <span className={styles.labelText}>{point.title}</span>
              </div>
              <button
                type="button"
                ref={(el) => {
                  desktopDotRefs.current[index] = el;
                }}
                className={`${styles.dot} ${isOpen ? styles.dotActive : ""}`}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-label={`${point.year} · ${point.title}`}
                onClick={(e) => openModal(index, e.currentTarget)}
                onKeyDown={(e) => {
                  moveByArrowKey(e.key, index, data.length, desktopDotRefs.current);
                }}
              >
                {isOpen ? <span className={styles.ring} aria-hidden="true" /> : null}
              </button>
            </div>
          );
        })}
      </div>

      <ol className={styles.timelineMobile}>
        {points.map(({ point, index }) => {
          const isOpen = index === openIndex;

          return (
            <li key={point.year} className={styles.timelineRow}>
              <button
                type="button"
                className={styles.timelineYearButton}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-label={`${point.year}년 사건 상세 보기`}
                onClick={(e) => openModal(index, e.currentTarget)}
              >
                {point.year}
              </button>
              <span className={styles.timelineTrack}>
                <button
                  type="button"
                  ref={(el) => {
                    mobileDotRefs.current[index] = el;
                  }}
                  className={`${styles.dot} ${isOpen ? styles.dotActive : ""}`}
                  aria-haspopup="dialog"
                  aria-expanded={isOpen}
                  aria-label={`${point.year} · ${point.title}`}
                  onClick={(e) => openModal(index, e.currentTarget)}
                  onKeyDown={(e) => {
                    moveByArrowKey(e.key, index, data.length, mobileDotRefs.current);
                  }}
                >
                  {isOpen ? <span className={styles.ring} aria-hidden="true" /> : null}
                </button>
              </span>
              <span className={styles.timelineLabel}>{point.title}</span>
            </li>
          );
        })}
      </ol>

      {openPoint ? (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div
            className={styles.modalContent}
            role="dialog"
            aria-modal="true"
            aria-label={`${openPoint.year} · ${openPoint.title}`}
            tabIndex={-1}
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <p className={styles.modalYear}>{openPoint.year}</p>
            <p className={styles.modalHeadline}>
              <span className={styles.modalScore}>
                {formatScore(openPoint.score)}
              </span>
              <span className={styles.modalTitle}>{openPoint.title}</span>
            </p>
            <p className={styles.modalText}>{openPoint.text}</p>
            {openPoint.image ? (
              <div className={styles.modalImageSlot}>
                <Image
                  src={openPoint.image}
                  alt={`${openPoint.year} ${openPoint.title}`}
                  fill
                  sizes="(max-width: 600px) 100vw, 480px"
                  className={styles.modalImage}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
