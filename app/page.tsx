import styles from "./page.module.css";
import { SunHead } from "@/components/SunHead";

export default function HomePage() {
  return (
    <main className={styles.main}>
      <SunHead />
      <h1 className={styles.title}>soobinpark</h1>
    </main>
  );
}
