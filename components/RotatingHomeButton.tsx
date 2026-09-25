"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./RotatingHomeButton.module.css";

const PHOTOS = [
  "/baby-home.jpg",
  "/baby-home-2.jpg",
  "/baby-home-3.jpg",
] as const;

function shufflePhotoOrder() {
  const order = PHOTOS.map((_, index) => index);

  for (let index = order.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
  }

  return order;
}

export function RotatingHomeButton() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let order = shufflePhotoOrder();
    let position = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      setActiveIndex(order[0]);
    });

    const timer = window.setInterval(() => {
      position += 1;

      if (position >= order.length) {
        const previousIndex = order[order.length - 1];

        do {
          order = shufflePhotoOrder();
        } while (order[0] === previousIndex);

        position = 0;
      }

      setActiveIndex(order[position]);
    }, 3200);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <Link href="/" className={styles.button} aria-label="메인 화면으로 이동">
      <span className={styles.label}>안녕하세요?</span>
      <span className={styles.imageFrame} aria-hidden="true">
        {PHOTOS.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={72}
            height={72}
            priority={index === 0}
            className={`${styles.photo} ${index === activeIndex ? styles.photoActive : ""}`}
          />
        ))}
      </span>
    </Link>
  );
}
