"use client";

import Link from "next/link";
import styles from "../../app/page.module.css";
import { passport, config } from "@imtbl/sdk";
import { useEffect, useState } from "react";
import { displayPartialAddress } from "@/lib/utils";
import { useSharedContext } from "../context/sharedContext";
import { BrowserProvider } from "ethers";

/**
 * Header.
 */
export default function Header() {
  const [userInfo, setUserInfo] = useState<passport.UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // use context
  const { accountAddress, setEvmSigner, setEvmProvider, setAccountAddress } =
    useSharedContext();

  const passportInstance = new passport.Passport({
    baseConfig: {
      environment: config.Environment.SANDBOX,
      publishableKey: process.env.NEXT_PUBLIC_IMMUTABLE_PUBLISHABLE_KEY,
    },
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
    logoutRedirectUri: process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_URI!,
    audience: "platform_api",
    scope: "openid offline_access email transact",
  });

  useEffect(() => {
    const init = async () => {
      try {
        const user = await passportInstance.getUserInfo();
        console.log("Logged in user ", user);

        const cachedUserEmail = localStorage.getItem("user");
        if (cachedUserEmail && user && cachedUserEmail == user.email) {
          setIsLoggedIn(true);
          setUserInfo(user);
        }

        const _imxProvider = await passportInstance.connectImx();

        const provider = passportInstance.connectEvm();
        const evmProvider = new BrowserProvider(provider);
        const signer = await evmProvider.getSigner();
        setEvmSigner(signer);
        setEvmProvider(evmProvider);

        if (_imxProvider) {
          const isRegistered = await _imxProvider.isRegisteredOffchain();

          if (!isRegistered) {
            await _imxProvider.registerOffchain();
          }

          const userAddress = await _imxProvider.getAddress();
          setUserInfo(user!);
          setAccountAddress(userAddress);
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
        localStorage.setItem("user", JSON.stringify(profile.email));
      }
    } catch (error) {
      console.log("error logging in ", error);
    }
  };

  const logout = async () => {
    try {
      await passportInstance.logout();
      setUserInfo(null);
      setIsLoggedIn(false);
      setAccountAddress("");
      localStorage.removeItem("user");
    } catch (error) {
      console.log("error logging out ", error);
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
