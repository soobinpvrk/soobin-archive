"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./RotatingHomeButton.module.css";

const PHOTOS = [
  "/baby-home.jpg",
  "/baby-home-2.jpg",
  "/baby-home-3.jpg",
] as const;

export function RotatingHomeButton() {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setActiveIndex((currentIndex) => {
        const randomIndex = Math.floor(Math.random() * PHOTOS.length);

        if (currentIndex !== null && randomIndex === currentIndex) {
          return (randomIndex + 1) % PHOTOS.length;
        }

        return randomIndex;
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <Link href="/" className={styles.button} aria-label="메인 화면으로 이동">
      <span className={styles.label}>안녕하세요?</span>
      <span
        className={`${styles.imageFrame} ${activeIndex !== null ? styles.imageFrameReady : ""}`}
        aria-hidden="true"
      >
        {PHOTOS.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={64}
            height={64}
            priority={index === 0}
            className={`${styles.photo} ${index === activeIndex ? styles.photoActive : ""}`}
          />
        ))}
      </span>
    </Link>
  );
}
