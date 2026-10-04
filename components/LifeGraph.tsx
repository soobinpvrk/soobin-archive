"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { lifeGraphData, type LifeNode } from "@/content/life-graph";
import styles from "./LifeGraph.module.css";

const EMPTY_TEXT = "아직 적지 않았다.";

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

function cardClassName(node: LifeNode) {
  if (node.kind !== "desire") return `${styles.card} ${styles.cardEdge}`;
  return `${styles.card} ${
    node.status === "ongoing" ? styles.cardOngoing : ""
  }`;
}

export function LifeGraph() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLOListElement | null>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
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

  // 새로고침 시 브라우저가 가로 스크롤 위치를 복원해도 첫 노드부터 보이게 한다.
  useEffect(() => {
    if (trackRef.current) trackRef.current.scrollLeft = 0;
  }, []);

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

  function onCardKeyDown(e: React.KeyboardEvent, index: number) {
    const isNext = e.key === "ArrowRight" || e.key === "ArrowDown";
    const isPrev = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (!isNext && !isPrev) return;
    e.preventDefault();
    const nextIndex = isNext
      ? Math.min(index + 1, lifeGraphData.length - 1)
      : Math.max(index - 1, 0);
    cardRefs.current[nextIndex]?.focus();
  }

  const openMeta = openNode ? formatMeta(openNode) : null;

  return (
    <section className={styles.root} aria-label="인생그래프">
      <ol className={styles.track} ref={trackRef}>
        {lifeGraphData.map((node, index) => {
          const meta = formatMeta(node);
          return (
            <li key={index} className={styles.item}>
              <button
                type="button"
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={cardClassName(node)}
                aria-haspopup="dialog"
                aria-expanded={index === openIndex}
                aria-label={`${node.title}, ${statusLabel(node)}`}
                onClick={(e) => openModal(index, e.currentTarget)}
                onKeyDown={(e) => onCardKeyDown(e, index)}
              >
                {node.title}
              </button>
              {meta ? <span className={styles.meta}>{meta}</span> : null}
            </li>
          );
        })}
      </ol>

      <ul className={styles.legend} aria-label="범례">
        <li>
          <span className={styles.legendSolid} aria-hidden="true" />
          지나간 욕망
        </li>
        <li>
          <span className={styles.legendDashed} aria-hidden="true" />
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
