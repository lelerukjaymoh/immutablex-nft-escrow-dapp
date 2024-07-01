"use client";

import { useState, useEffect } from "react";
import styles from "../app/page.module.css";
import { blockchainData, config } from "@imtbl/sdk";
import { displayPartialAddress } from "@/lib/utils";
import SwapNFT from "./Swap";
import Proposals from "./Proposals";
import axios from "axios";
import { Contract, JsonRpcProvider } from "ethers";
import { Wallet } from "ethers";
import { TransactionButton } from "thirdweb/react";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
} from "thirdweb";
import { polygonAmoy } from "thirdweb/chains";

/**
 * NFT Display.
 */
export default function NFT() {
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [availableNFTs, setAvailableNFTs] = useState<any[]>([]);
  const [mintState, setMintState] = useState<boolean>(false);

  useEffect(() => {}, [mintState]);

  const mint = () => {};

  const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
  });

  const contract = getContract({
    client,
    chain: polygonAmoy,
    address: "0x20b24f1cafe28f58dBcaBC510bB46f41443E88CA",
    abi: [
      {
        inputs: [
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
        ],
        name: "safeMint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
  });

  return (
    <div style={{ top: "10px" }}>
      <div style={{ marginTop: "100px" }}>
        <div className={styles.grid}>
          {/* <button
            style={{ width: "fit-content", padding: "10px", cursor: "pointer" }}
            onClick={mint}
          >
            Mint NFT
          </button> */}

          <TransactionButton
            transaction={() => {
              // Create a transaction object and return it
              const tx = prepareContractCall({
                contract,
                method: "safeMint",
                params: ["0xc8BCFe21Cb973B86A863E50f308cdC1d0D43279b"],
              });
              return tx;
            }}
            onTransactionSent={(result) => {
              console.log("Transaction submitted", result.transactionHash);
            }}
            onTransactionConfirmed={(receipt) => {
              console.log("Transaction confirmed", receipt.transactionHash);
            }}
            onError={(error) => {
              console.error("Transaction error", error);
            }}
          >
            Mint NFT for free
          </TransactionButton>
        </div>
      </div>
    </div>
  );
}
