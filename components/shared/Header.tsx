"use client";

import Link from "next/link";
import styles from "../../app/page.module.css";
import { passport } from "@imtbl/sdk";
import { passportInstance } from "@/lib/config";
import { useContext, useEffect, useState } from "react";
import { displayPartialAddress } from "@/lib/utils";
import { useSharedContext } from "../context/sharedContext";
import { BrowserProvider } from "ethers";

/**
 * Header.
 */
export default function Header() {
  const [userInfo, setUserInfo] = useState<passport.UserProfile | null>(null);
  const [imxProvider, setImxProvider] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // use context
  const { accountAddress, setAccountAddress } = useSharedContext();

  useEffect(() => {
    const init = async () => {
      console.log("rerendering init ");
      try {
        if (!isLoggedIn) return;

        const user = await passportInstance.getUserInfo();
        console.log("user ", user);

        const _imxProvider = await passportInstance.connectImx();

        if (_imxProvider) {
          const isRegistered = await _imxProvider.isRegisteredOffchain();

          console.log("is registered ", isRegistered);
          if (!isRegistered) {
            await _imxProvider.registerOffchain();
          }

          const userAddress = await _imxProvider.getAddress();
          console.log("user address ", userAddress);
          setUserInfo(user!);
          setAccountAddress(userAddress);
          console.log("user info ", user);
        }
      } catch (error) {
        console.log("error ", error);
      }
    };

    init();
  }, [isLoggedIn]);

  const login = async () => {
    try {
      const profile: passport.UserProfile | null =
        await passportInstance.login();

      if (profile) {
        setIsLoggedIn(true);
      }

      console.log("profile ", profile);
    } catch (error) {
      console.log("error ", error);
    }
  };

  const logout = async () => {
    try {
      await passportInstance.logout();
      setUserInfo(null);
      setAccountAddress("");
    } catch (error) {
      console.log("error ", error);
    }
  };

  return (
    <div className={styles.description}>
      <h2>
        <Link href={"/"}>NFT Escrow on Immutable X</Link>
      </h2>
      <div style={{ float: "right" }}>
        {!userInfo ? (
          <p style={{ marginLeft: "40px", cursor: "pointer" }} onClick={login}>
            Login
          </p>
        ) : (
          <div className={styles.grid}>
            <p style={{ marginLeft: "20px" }}>{userInfo.email}</p>
            <p style={{ marginLeft: "20px" }}>
              {displayPartialAddress(accountAddress!)}
            </p>
            <p
              style={{ marginLeft: "20px", cursor: "pointer" }}
              onClick={logout}
            >
              Log Out
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
