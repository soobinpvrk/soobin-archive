"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import styles from "./ScrollReveal.module.css";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

type RevealStyle = CSSProperties & {
  "--reveal-delay": string;
};

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setIsVisible(true);
        observer.unobserve(entry.target);
      },
      {
        rootMargin: "0px 0px -10%",
        threshold: 0.12,
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const style: RevealStyle = { "--reveal-delay": `${delay}ms` };

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${isVisible ? styles.visible : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
