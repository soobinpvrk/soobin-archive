import styles from "./page.module.css";
import { PlushHead } from "@/components/PlushHead";

export default function HomePage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>soobinpark</h1>
      <PlushHead />
    </main>
  );
}
