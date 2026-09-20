import { isValidElement, type ReactNode } from "react";
import styles from "./QA.module.css";

type QAProps = {
  number: string;
  question: string;
  word?: string;
  strike?: boolean;
  children?: ReactNode;
};

function getTextContent(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(getTextContent).join("");
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getTextContent(node.props.children);
  }
  return "";
}

export function QA({ number, question, word, strike, children }: QAProps) {
  const hasAnswer = getTextContent(children).trim().length > 0;
  const hasWord = Boolean(word && word.trim().length > 0);

  return (
    <div className={styles.block}>
      <p className={styles.number}>{number}</p>
      <p className={styles.question}>{question}</p>
      {hasWord ? (
        <p className={`${styles.word} ${strike ? styles.wordStrike : ""}`}>
          {word}
        </p>
      ) : null}
      <div className={styles.answer}>
        {hasAnswer ? (
          children
        ) : (
          <p className={styles.empty}>아직 답하지 않았다.</p>
        )}
      </div>
    </div>
  );
}
