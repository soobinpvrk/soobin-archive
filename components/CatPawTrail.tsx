"use client";

import { useEffect, useRef } from "react";
import styles from "./CatPawTrail.module.css";

const MIN_DISTANCE = 20;
const MIN_INTERVAL = 45;
const MAX_PAWS = 28;

export function CatPawTrail() {
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trail = trailRef.current;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

    if (!trail || reducedMotion || coarsePointer) return;

    let lastX = -100;
    let lastY = -100;
    let lastTime = 0;
    let direction = 1;

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;

      const now = performance.now();
      const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY);

      if (distance < MIN_DISTANCE || now - lastTime < MIN_INTERVAL) return;

      const paw = document.createElement("span");
      paw.className = styles.paw;
      paw.style.left = `${event.clientX}px`;
      paw.style.top = `${event.clientY}px`;
      paw.style.setProperty("--paw-rotation", `${direction * 18}deg`);
      paw.addEventListener("animationend", () => paw.remove(), { once: true });
      trail.append(paw);

      if (trail.childElementCount > MAX_PAWS) {
        trail.firstElementChild?.remove();
      }

      lastX = event.clientX;
      lastY = event.clientY;
      lastTime = now;
      direction *= -1;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      trail.replaceChildren();
    };
  }, []);

  return <div ref={trailRef} className={styles.trail} aria-hidden="true" />;
}
