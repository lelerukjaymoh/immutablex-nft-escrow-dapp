import Link from "next/link";
import styles from "../../app/page.module.css";

/**
 * Header.
 */
export default function Header() {
  return (
    <div className={styles.description}>
      <h2>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          NFT Escrow on Immutable X
        </a>
      </h2>
      <div style={{ display: "inherit" }}>
        <p style={{ marginLeft: "40px" }}>
          <Link className="button" href={`/swap}`}>
            Swap
          </Link>
        </p>
        <p style={{ marginLeft: "40px" }}>Login</p>
      </div>
    </div>
  );
}
