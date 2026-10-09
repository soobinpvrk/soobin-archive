"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import {
  type DesireStatus,
  lifeGraphData,
  type LifeNode,
} from "@/content/life-graph";
import styles from "./LifeGraph.module.css";

const EMPTY_TEXT = "아직 적지 않았다.";
const LAST = lifeGraphData.length - 1;

const STATUS_LABEL: Record<DesireStatus, string> = {
  fulfilled: "충족된 것",
  unfulfilled: "충족되지 않은 것",
  released: "충족할 필요가 없어진 것",
};

const LEGEND: DesireStatus[] = ["fulfilled", "unfulfilled", "released"];

function statusLabel(node: LifeNode) {
  if (node.kind !== "desire") return node.kind === "start" ? "시작" : "지금";
  return STATUS_LABEL[node.status];
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
    node.kind === "desire"
      ? `${styles.desire} ${styles[node.status]}`
      : styles.edge;
  const side = index % 2 === 0 ? styles.above : styles.below;
  const anchor =
    index === 0 ? styles.first : index === LAST ? styles.last : "";
  return [styles.node, tone, side, anchor].filter(Boolean).join(" ");
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
        {/* 가로 기준선. 상태는 점이 말하므로 선은 한 가지로 두고,
            빈 점 안으로 선이 지나가지 않게 노드 앞뒤에서 끊는다. */}
        {lifeGraphData.slice(1).map((_, i) => (
          <span
            key={`segment-${i}`}
            aria-hidden="true"
            className={styles.segment}
            style={{
              left: `calc(${(i / LAST) * 100}% + var(--node-clear))`,
              width: `calc(${100 / LAST}% - 2 * var(--node-clear))`,
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
                  <span
                    className={`${styles.marker} ${
                      node.kind === "desire" ? styles.dot : ""
                    }`}
                    aria-hidden="true"
                  />
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
        {LEGEND.map((status) => (
          <li key={status} className={styles[status]}>
            <span className={styles.dot} aria-hidden="true" />
            {STATUS_LABEL[status]}
          </li>
        ))}
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
