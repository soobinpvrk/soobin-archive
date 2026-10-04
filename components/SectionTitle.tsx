import type { ReactNode } from "react";
import styles from "./SectionTitle.module.css";

export const headingClassName = styles.heading;

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className={`${styles.heading} ${styles.section}`}>{children}</h2>;
}
