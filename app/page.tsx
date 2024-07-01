import NFT from "@/components/NFT";
import styles from "./page.module.css";
import Header from "@/components/shared/Header";
import { ThirdwebProvider } from "thirdweb/react";

export default function Home() {
  return (
    <ThirdwebProvider>
      <main className={styles.main}>
        <Header />
        <NFT />
      </main>
    </ThirdwebProvider>
  );
}
