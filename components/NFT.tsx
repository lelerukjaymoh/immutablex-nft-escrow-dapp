"use client";

import { useState, useEffect } from "react";
import styles from "../app/page.module.css";
import { useSharedContext } from "./context/sharedContext";
import { blockchainData, config } from "@imtbl/sdk";
import { displayPartialAddress } from "@/lib/utils";
import SwapNFT from "./Swap";
import Proposals from "./Proposals";

/**
 * NFT Display.
 */
export default function NFT() {
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [availableNFTs, setAvailableNFTs] = useState<any[]>([]);
  const { accountAddress } = useSharedContext();

  useEffect(() => {
    const client = new blockchainData.BlockchainData({
      baseConfig: {
        environment: config.Environment.SANDBOX,
        publishableKey: "pk_imapik-test-DRLBqW2TJLX79i3pybk5",
      },
    });

    const getNFTs = async () => {
      try {
        // Get NFTs owned by logged in user
        const chainName = "imtbl-zkevm-testnet";
        const contractAddress = "0x939660e5a9dd3efcc1ec0357b365b7625dd6f522";
        const response = await client.listNFTsByAccountAddress({
          chainName,
          accountAddress: "0x7937ce7F2e6e316E91814055Bc430c4f5Cc226C6",
          contractAddress,
        });

        const _userNFTs = response.result;
        if (_userNFTs) setUserNFTs(_userNFTs);

        // Get all NFTs available for swap
        const allNFTsResponse = await client.listNFTs({
          chainName,
          contractAddress,
        });

        const allNFTs = allNFTsResponse.result;

        // Filter out NFTs owned by logged in user
        const userNFTsIDs: string[] = _userNFTs.map((nft) => {
          return nft.token_id;
        });

        // return nfts from all nfts that are not owned by logged in user
        const filteredNFTs = allNFTs.filter((nft) => {
          return !userNFTsIDs.includes(nft.token_id);
        });

        console.log("user nfts ", _userNFTs);
        console.log("filtered nfts ", filteredNFTs);

        if (filteredNFTs) setAvailableNFTs(filteredNFTs);
      } catch (error) {
        console.log("error ", error);
      }
    };

    getNFTs();
  }, []);

  return (
    <div style={{ top: "10px" }}>
      <div style={{ marginTop: "100px" }}>
        <h2>User NFTs</h2>
        <div className={styles.description}>
          <div className={styles.grid}>
            {userNFTs.map((nft) => {
              return (
                <div
                  key={nft.token_id}
                  className={styles.card}
                  style={{ marginTop: "20px" }}
                >
                  <h2 style={{ textAlign: "center" }}>{nft.name}</h2>

                  <a href={nft.image} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={nft.image} alt={nft.description} />
                  </a>
                  <div style={{ marginTop: "20px", width: "100%" }}>
                    <span style={{ paddingBottom: "10px" }}>
                      {nft.description}
                    </span>
                    <span
                      onClick={() => {
                        navigator.clipboard.writeText(nft.contract_address);
                        console.log(
                          "copied contract address ",
                          nft.contract_address
                        );
                      }}
                      style={{ paddingBottom: "10px", cursor: "pointer" }}
                    >
                      Contract: {displayPartialAddress(nft.contract_address)}
                    </span>
                    <span
                      onClick={() => {
                        navigator.clipboard.writeText(nft.token_id);
                        console.log("copied token id ", nft.token_id);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      Token ID: {nft.token_id}
                    </span>
                  </div>
                  <SwapNFT
                    proposerContractAddress={nft.contract_address}
                    proposerTokenId={nft.token_id}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ marginTop: "100px" }}>
        <h2>NFTs available for swap</h2>
        <div className={styles.description}>
          <div className={styles.grid}>
            {availableNFTs.map((nft) => {
              return (
                <div
                  key={nft.token_id}
                  className={styles.card}
                  style={{ marginTop: "20px" }}
                >
                  <h2 style={{ textAlign: "center" }}>{nft.name}</h2>

                  <a href={nft.image} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={nft.image} alt={nft.description} />
                  </a>
                  <div style={{ marginTop: "20px", width: "100%" }}>
                    <span style={{ paddingBottom: "10px" }}>
                      {nft.description}
                    </span>
                    <span
                      onClick={() => {
                        navigator.clipboard.writeText(nft.contract_address);
                        console.log(
                          "copied contract address ",
                          nft.contract_address
                        );
                      }}
                      style={{ paddingBottom: "10px", cursor: "pointer" }}
                    >
                      Contract: {displayPartialAddress(nft.contract_address)}
                    </span>
                    <span
                      onClick={() => {
                        navigator.clipboard.writeText(nft.token_id);
                        console.log("copied token id ", nft.token_id);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      Token ID: {nft.token_id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ marginTop: "100px" }}>
        <Proposals />
      </div>
    </div>
  );
}
