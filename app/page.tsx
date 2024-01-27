import NFT from "@/components/NFT";
import styles from "./page.module.css";
import Header from "@/components/shared/Header";
import { SharedProvider } from "@/components/context/sharedContext";

export default function Home() {
  return (
    <SharedProvider>
      <main className={styles.main}>
        <Header />
        <NFT />
      </main>
    </SharedProvider>
  );
}
