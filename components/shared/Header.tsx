"use client";

import Link from "next/link";
import styles from "../../app/page.module.css";
import { passport } from "@imtbl/sdk";
import { useEffect, useState } from "react";
import { displayPartialAddress } from "@/lib/utils";
import { ConnectButton, darkTheme } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { polygonAmoy, sepolia } from "thirdweb/chains";

/**
 * Header.
 */
export default function Header() {
  const [userInfo, setUserInfo] = useState<passport.UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // use context

  useEffect(() => {}, [isLoggedIn]);

  const wallets = [
    inAppWallet({
      smartAccount: {
        chain: polygonAmoy,
        sponsorGas: true,
      },
    }),
  ];

  const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
  });

  return (
    <div className={styles.description}>
      <h2>
        <Link href={"/"}>Mint an NFT for free</Link>
      </h2>
      <div>
        <ConnectButton
          client={client}
          wallets={wallets}
          theme={"dark"}
          accountAbstraction={{
            chain: polygonAmoy,
            sponsorGas: true,
          }}
        />
      </div>
    </div>
  );
}
