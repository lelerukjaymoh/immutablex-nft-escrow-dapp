"use client";

import { useState, useEffect } from "react";
import styles from "../app/page.module.css";

/**
 * NFT Container.
 */
export default function NFT() {
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);

  useEffect(() => {
    const getUserNFTs = async () => {
      try {
      } catch (error) {
        console.log("error ", error);
      }
    };

    getUserNFTs();
  }, []);

  return (
    <div style={{ top: "10px" }}>
      <div style={{ marginBottom: "100px" }}>
        <h2>User NFTs</h2>
        <div className={styles.description}>
          <div className={styles.grid}>
            {userNFTs.map((nft) => {
              return (
                <a
                  key={nft.id}
                  href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                  className={styles.card}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h2>
                    Docs <span>-&gt;</span>
                  </h2>
                  <p>
                    Find in-depth information about Next.js features and API.
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div>
        <h2>NFTs available for swap</h2>
        <div className={styles.description}>
          <div className={styles.grid}>
            {proposals.map((proposal) => {
              return (
                <a
                  key={proposal.id}
                  href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                  className={styles.card}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h2>
                    Docs <span>-&gt;</span>
                  </h2>
                  <p>
                    Find in-depth information about Next.js features and API.
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
