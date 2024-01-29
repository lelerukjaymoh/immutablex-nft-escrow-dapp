"use client";

import { useState } from "react";
import styles from "../app/page.module.css";

/**
 * NFT Swapping.
 */
export default function SwapNFT({
  proposerContractAddress,
  proposerTokenId,
}: any) {
  const [contractAddress, setContractAddress] = useState<string>("");
  const [tokenId, setTokenId] = useState<string>("");

  const handleSmartContractInputChange = (e: any) => {
    setContractAddress(e.target.value);
  };

  const handleTokenIdInputChange = (e: any) => {
    setTokenId(e.target.value);
  };

  // Function to handle form submission
  const handleSubmit = (e: any) => {
    e.preventDefault();

    // Make sure user is not trying to swap the same NFT
    if (
      contractAddress === proposerContractAddress &&
      tokenId === proposerTokenId
    ) {
      alert("You cant swap an NFT with itself");
      return;
    }

    console.log("contract address ", contractAddress);
    console.log("token id ", tokenId);

    console.log("proposer contract address ", proposerContractAddress);
    console.log("proposer token id ", proposerTokenId);

    // setContractAddress("");
    // setTokenId("");
  };

  return (
    <div style={{ marginTop: "50px" }} className={styles.description}>
      <div>
        <h4>Swap Your NFT with any of the available below</h4>
        <div style={{ marginTop: "30px" }}>
          <span>
            Enter the contract address and token ID of the NFT you want to swap
            with. Click the contract address or the token ID to copy it
          </span>
          <form style={{ marginTop: "30px" }} onSubmit={handleSubmit}>
            <div>
              Contract Address:
              <input
                onChange={handleSmartContractInputChange}
                value={contractAddress}
                type="text"
                required
                className={styles.input}
              />
            </div>
            <div style={{ marginTop: "20px" }}>
              Token Id:
              <input
                onChange={handleTokenIdInputChange}
                value={tokenId}
                type="text"
                required
                className={styles.input}
              />
            </div>
            <button
              className={styles.button}
              type="submit"
              style={{ marginTop: "30px", width: "fit-content" }}
            >
              Propose Swap
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
