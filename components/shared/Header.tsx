"use client";

import Link from "next/link";
import styles from "../../app/page.module.css";
import { passport } from "@imtbl/sdk";
import { passportInstance } from "@/lib/config";
import { useEffect, useState } from "react";
import { displayPartialAddress } from "@/lib/utils";

/**
 * Header.
 */
export default function Header() {
  const [userInfo, setUserInfo] = useState<passport.UserProfile | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [imxProvider, setImxProvider] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      console.log("rerendering init ");
      try {
        if (!isLoggedIn) return;

        const user = await passportInstance.getUserInfo();
        console.log("user ", user);

        if (user) {
          setIsLoggedIn(true);
        }

        const provider = await passportInstance.connectImx();
        const evmProvider = passportInstance.connectEvm();

        console.log("evm provider ", evmProvider);

        if (provider) {
          const isRegistered = await provider.isRegisteredOffchain();

          console.log("is registered ", isRegistered);
          if (!isRegistered) {
            await provider.registerOffchain();
          }

          const userAddress = await provider.getAddress();
          console.log("user address ", userAddress);
          setUserInfo(user!);
          setUserAddress(userAddress);
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
      setUserAddress(null);
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
        {/* <p style={{ marginLeft: "40px" }}>
          <Link className="button" href={`/swap`}>
            Swap
          </Link>
        </p> */}

        {!userInfo ? (
          <p style={{ marginLeft: "40px", cursor: "pointer" }} onClick={login}>
            Login {userAddress}
          </p>
        ) : (
          <div className={styles.grid}>
            <p style={{ marginLeft: "20px" }}>{userInfo.email}</p>
            <p style={{ marginLeft: "20px" }}>
              {" "}
              {displayPartialAddress(userAddress!)}
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
