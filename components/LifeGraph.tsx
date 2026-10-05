"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { lifeGraphData, type LifeNode } from "@/content/life-graph";
import styles from "./LifeGraph.module.css";

const EMPTY_TEXT = "아직 적지 않았다.";
const LAST = lifeGraphData.length - 1;

function statusLabel(node: LifeNode) {
  if (node.kind === "start") return "시작";
  if (node.kind === "end") return "지금";
  return node.status === "past" ? "지나간 욕망" : "지금도 이어지는 욕망";
}

/* "2009 · 14세". 둘 다 없으면 null. */
function formatMeta(node: LifeNode) {
  const parts = [
    node.year !== undefined ? String(node.year) : null,
    node.age !== undefined ? `${node.age}세` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function nodeClassName(node: LifeNode, index: number) {
  const tone =
    node.kind !== "desire"
      ? styles.edge
      : node.status === "ongoing"
        ? styles.ongoing
        : styles.past;
  const side = index % 2 === 0 ? styles.above : styles.below;
  const anchor =
    index === 0 ? styles.first : index === LAST ? styles.last : "";
  // 다음 노드가 ongoing이면 그쪽으로 가는 선분이 점선이다(세로 그래프용).
  const next = lifeGraphData[index + 1];
  const nextOngoing = next?.status === "ongoing" ? styles.toOngoing : "";
  return [styles.node, tone, side, anchor, nextOngoing].filter(Boolean).join(" ");
}

type PositionStyle = CSSProperties & { "--x": string };

export function LifeGraph() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openNode: LifeNode | null =
    openIndex === null ? null : lifeGraphData[openIndex];

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

  function onNodeKeyDown(e: React.KeyboardEvent, index: number) {
    const isNext = e.key === "ArrowRight" || e.key === "ArrowDown";
    const isPrev = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (!isNext && !isPrev) return;
    e.preventDefault();
    const nextIndex = isNext ? Math.min(index + 1, LAST) : Math.max(index - 1, 0);
    nodeRefs.current[nextIndex]?.focus();
  }

  const openMeta = openNode ? formatMeta(openNode) : null;

  return (
    <section className={styles.root} aria-label="인생그래프">
      <div className={styles.graph}>
        {/* 가로 기준선. ongoing 노드로 이어지는 구간만 점선. */}
        {lifeGraphData.slice(1).map((node, i) => (
          <span
            key={`segment-${i}`}
            aria-hidden="true"
            className={`${styles.segment} ${
              node.status === "ongoing" ? styles.segmentDashed : ""
            }`}
            style={{
              left: `${(i / LAST) * 100}%`,
              width: `${100 / LAST}%`,
            }}
          />
        ))}

        <ol className={styles.nodes}>
          {lifeGraphData.map((node, index) => {
            const meta = formatMeta(node);
            const position: PositionStyle = { "--x": `${(index / LAST) * 100}%` };
            return (
              <li key={index} className={styles.nodeItem} style={position}>
                <button
                  type="button"
                  ref={(el) => {
                    nodeRefs.current[index] = el;
                  }}
                  className={nodeClassName(node, index)}
                  aria-haspopup="dialog"
                  aria-expanded={index === openIndex}
                  aria-label={`${node.title}, ${statusLabel(node)}`}
                  onClick={(e) => openModal(index, e.currentTarget)}
                  onKeyDown={(e) => onNodeKeyDown(e, index)}
                >
                  <span className={styles.marker} aria-hidden="true" />
                  <span className={styles.stem} aria-hidden="true" />
                  <span className={styles.label}>
                    <span className={styles.title}>{node.title}</span>
                    {meta ? <span className={styles.meta}>{meta}</span> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <ul className={styles.legend} aria-label="범례">
        <li>
          <span className={`${styles.legendMark} ${styles.past}`} aria-hidden="true" />
          지나간 욕망
        </li>
        <li>
          <span className={`${styles.legendMark} ${styles.ongoing}`} aria-hidden="true" />
          지금도 이어지는 욕망
        </li>
      </ul>

      {openNode ? (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div
            className={styles.modalContent}
            role="dialog"
            aria-modal="true"
            aria-label={openNode.title}
            tabIndex={-1}
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            {openMeta ? <p className={styles.modalYear}>{openMeta}</p> : null}
            <p className={styles.modalTitle}>{openNode.title}</p>
            {openNode.text.trim() ? (
              <p className={styles.modalText}>{openNode.text}</p>
            ) : (
              <p className={`${styles.modalText} ${styles.modalEmpty}`}>
                {EMPTY_TEXT}
              </p>
            )}
            {openNode.image ? (
              <div className={styles.modalImageSlot}>
                <Image
                  src={openNode.image}
                  alt={openNode.title}
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
