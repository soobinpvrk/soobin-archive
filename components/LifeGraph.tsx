"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { lifeGraphData } from "@/content/life-graph";
import styles from "./LifeGraph.module.css";

const DESKTOP_PAD_X = 6;
const DESKTOP_PAD_Y = 22;
const GRID_VALUES = [100, 50, 0, -50, -100] as const;

function xFromIndex(index: number, total: number) {
  if (total <= 1) return 50;
  return DESKTOP_PAD_X + (index / (total - 1)) * (100 - DESKTOP_PAD_X * 2);
}

function yFromValue(value: number) {
  const halfHeight = 50 - DESKTOP_PAD_Y;
  return 50 - (value / 100) * halfHeight;
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
  const data = lifeGraphData;
  const [selectedIndex, setSelectedIndex] = useState(data.length - 1);
  const desktopRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const mobileRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selected = data[selectedIndex];

  const points = data.map((point, index) => ({
    point,
    index,
    x: xFromIndex(index, data.length),
    y: yFromValue(point.value),
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
          {GRID_VALUES.map((v) => (
            <line
              key={v}
              x1="0"
              x2="100"
              y1={yFromValue(v)}
              y2={yFromValue(v)}
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
          const isSelected = index === selectedIndex;
          const above = index % 2 === 0;

          return (
            <div
              key={point.id}
              className={styles.pointWrap}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div
                className={`${styles.textBlock} ${
                  above ? styles.textAbove : styles.textBelow
                }`}
              >
                <span className={styles.year}>{point.year}</span>
                <span className={styles.labelText}>{point.label}</span>
              </div>
              <button
                type="button"
                ref={(el) => {
                  desktopRefs.current[index] = el;
                }}
                className={`${styles.dot} ${isSelected ? styles.dotSelected : ""}`}
                aria-pressed={isSelected}
                aria-label={`${point.year} · ${point.label}`}
                onClick={() => setSelectedIndex(index)}
                onKeyDown={(e) => {
                  const nextIndex = moveByArrowKey(
                    e.key,
                    index,
                    data.length,
                    desktopRefs.current,
                  );
                  if (nextIndex !== null) {
                    e.preventDefault();
                    setSelectedIndex(nextIndex);
                  }
                }}
              >
                {isSelected ? (
                  <span className={styles.ring} aria-hidden="true" />
                ) : null}
              </button>
            </div>
          );
        })}
      </div>

      <ol className={styles.timelineMobile}>
        {points.map(({ point, index }) => {
          const isSelected = index === selectedIndex;

          return (
            <li key={point.id} className={styles.timelineRow}>
              <span className={styles.timelineYear}>{point.year}</span>
              <span className={styles.timelineTrack}>
                <button
                  type="button"
                  ref={(el) => {
                    mobileRefs.current[index] = el;
                  }}
                  className={`${styles.dot} ${isSelected ? styles.dotSelected : ""}`}
                  aria-pressed={isSelected}
                  aria-label={`${point.year} · ${point.label}`}
                  onClick={() => setSelectedIndex(index)}
                  onKeyDown={(e) => {
                    const nextIndex = moveByArrowKey(
                      e.key,
                      index,
                      data.length,
                      mobileRefs.current,
                    );
                    if (nextIndex !== null) {
                      e.preventDefault();
                      setSelectedIndex(nextIndex);
                    }
                  }}
                >
                  {isSelected ? (
                    <span className={styles.ring} aria-hidden="true" />
                  ) : null}
                </button>
              </span>
              <span className={styles.timelineLabel}>{point.label}</span>
            </li>
          );
        })}
      </ol>

      <div className={styles.detail}>
        <div className={styles.photoSlot}>
          {selected.photo ? (
            <Image
              key={selected.id}
              src={selected.photo}
              alt={`${selected.year} ${selected.label}`}
              fill
              sizes="260px"
              className={styles.photo}
            />
          ) : null}
        </div>
        <div className={styles.detailText}>
          <p className={styles.detailMeta}>
            <span className={styles.detailYear}>{selected.year}</span>
            <span className={styles.detailLabel}>{selected.label}</span>
          </p>
          <p className={styles.detailNote}>{selected.note}</p>
        </div>
      </div>
    </section>
  );
}
