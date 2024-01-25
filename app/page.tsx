import styles from "./page.module.css";
import Header from "@/components/shared/Header";

export default function Home() {
  return (
    <main className={styles.main}>
      <Header />
    </main>
  );
}
