"use client";

import { use, useEffect, useState } from "react";
import styles from "../app/page.module.css";
import { useSharedContext } from "./context/sharedContext";
import { Contract, JsonRpcProvider, Signer, Wallet, ethers } from "ethers";
import ESCROW_ABI from "../lib/ABI/escrow.json";
import { AbiCoder } from "ethers";

/**
 * NFT Swapping.
 */
export default function SwapNFT({
  proposeeNFTContractAddress,
  proposeeNFTTokenId,
}: any) {
  const [proposerNFTContractAddress, setProposerNFTContractAddress] =
    useState<string>("");
  const [proposerNFTTokenId, setProposerNFTTokenId] = useState<string>("");
  const [escrowSigner, setEscrowSigner] = useState<Signer>();
  const [escrowContract, setEscrowContract] = useState<Contract>();

  const { evmSigner, evmProvider } = useSharedContext();

  const handleSmartContractInputChange = (e: any) => {
    setProposerNFTContractAddress(e.target.value);
  };

  const handleTokenIdInputChange = (e: any) => {
    setProposerNFTTokenId(e.target.value);
  };

  // Function to handle form submission
  const handleSubmit = async (e: any) => {
    try {
      e.preventDefault();

      // Make sure user is not trying to swap the same NFT
      if (
        proposerNFTContractAddress === proposeeNFTContractAddress &&
        proposerNFTTokenId === proposeeNFTTokenId
      ) {
        alert("You cant swap an NFT with itself");
        return;
      }

      console.log("proposer contract address ", proposerNFTContractAddress);
      console.log("proposer token id ", proposerNFTTokenId);

      console.log("proposee contract address ", proposeeNFTContractAddress);
      console.log("proposee token id ", proposeeNFTTokenId);

      const proposerNFT = {
        nftAddress: proposerNFTContractAddress,
        tokenId: proposerNFTTokenId,
      };

      const proposeeNFT = {
        nftAddress: proposeeNFTContractAddress,
        tokenId: proposeeNFTTokenId,
      };

      const proposal = await escrowContract?.proposeSwap(
        proposerNFT,
        proposeeNFT
      );

      console.log("proposal ", proposal);

      await proposal
        ?.wait()
        .then(async (receipt: any) => {
          console.log("proposal created ", receipt);

          // Transfer proposer NFT to escrow
          const proposerNFTContract = new Contract(
            proposerNFTContractAddress,
            [
              "function safeTransferFrom(address from, address to, uint256 tokenId) public",
              "function ownerOf(uint tokenId) public returns (address)",
            ],
            evmSigner
          );

          const proposer = await proposerNFTContract?.ownerOf.staticCall(
            proposerNFTTokenId
          );

          const transfer = await proposerNFTContract?.safeTransferFrom(
            proposer,
            process.env.NEXT_PUBLIC_ESCROW_EOA_ADDRESS,
            proposerNFTTokenId
          );

          await transfer
            ?.wait()
            .then(async (receipt: any) => {
              console.log("NFT transferred to Escrow ", receipt);
            })
            .catch((err: any) => {
              console.log("error transferring NFT ", err);
            });
        })
        .catch((error: any) => {
          console.log("Error creating proposal ", error);
        });
    } catch (error) {
      console.log("error ", error);
    }
  };

  useEffect(() => {
    const signer = new Wallet(
      process.env.NEXT_PUBLIC_ESCROW_PRIVATE_KEY!,
      new JsonRpcProvider("https://rpc.testnet.immutable.com")
    );

    const contract = new Contract(
      process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS!,
      ESCROW_ABI,
      evmSigner
    );

    setEscrowSigner(signer);
    setEscrowContract(contract);
  }, []);

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
                value={proposerNFTContractAddress}
                type="text"
                required
                className={styles.input}
              />
            </div>
            <div style={{ marginTop: "20px" }}>
              Token Id:
              <input
                onChange={handleTokenIdInputChange}
                value={proposerNFTTokenId}
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
