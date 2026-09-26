"use client";

import { useEffect, useState } from "react";
import styles from "./Greeting.module.css";

const TEXT = "안녕하세요";
const CONTINUATION = "저는";

/**
 * 메인의 인사. 회색으로 놓였다가 한 글자씩 흰색으로 밝아진다.
 *
 * 글자마다 span으로 쪼개고 animation-delay만 어긋나게 준다. 스크린 리더가
 * 낱글자를 하나씩 읽지 않도록 각 span은 aria-hidden으로 감추고, 문장은
 * 바깥 h1의 aria-label로 한 번만 읽히게 했다.
 *
 * 한 번 밝아지면 그 상태로 머문다(forwards). 계속 물결치게 하려면
 * Greeting.module.css의 .ch에서 animation을 infinite로 바꾸면 된다.
 */
export function Greeting() {
  const [typedCount, setTypedCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTypedCount(CONTINUATION.length);
      return;
    }

    const firstCharacter = window.setTimeout(() => setTypedCount(1), 2450);
    const secondCharacter = window.setTimeout(() => setTypedCount(2), 3500);

    return () => {
      window.clearTimeout(firstCharacter);
      window.clearTimeout(secondCharacter);
    };
  }, []);

  const cursorClass =
    typedCount === 0
      ? styles.cursor
      : typedCount < CONTINUATION.length
        ? `${styles.cursor} ${styles.cursorActive}`
        : `${styles.cursor} ${styles.cursorBlinking}`;

  return (
    <div className={styles.greetingBlock}>
      <h1 className={styles.greeting} aria-label={TEXT}>
        {Array.from(TEXT).map((ch, i) => (
          <span
            key={i}
            className={styles.ch}
            style={{ animationDelay: `${0.3 + i * 0.24}s` }}
            aria-hidden="true"
          >
            {ch}
          </span>
        ))}
      </h1>
      <p className={styles.continuation} aria-label={CONTINUATION}>
        <span aria-hidden="true">{CONTINUATION.slice(0, typedCount)}</span>
        <span className={cursorClass} aria-hidden="true" />
      </p>
    </div>
  );
}
