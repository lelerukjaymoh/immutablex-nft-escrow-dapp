"use client";

import { useState, useEffect } from "react";
import styles from "../app/page.module.css";
import { useSharedContext } from "./context/sharedContext";
import { blockchainData, config } from "@imtbl/sdk";
import { displayPartialAddress } from "@/lib/utils";
import SwapNFT from "./Swap";
import Proposals from "./Proposals";
import axios from "axios";
import { Contract } from "ethers";

/**
 * NFT Display.
 */
export default function NFT() {
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [availableNFTs, setAvailableNFTs] = useState<any[]>([]);
  const { accountAddress, evmSigner, evmProvider } = useSharedContext();

  useEffect(() => {
    const client = new blockchainData.BlockchainData({
      baseConfig: {
        environment: config.Environment.SANDBOX,
        publishableKey: "pk_imapik-test-DRLBqW2TJLX79i3pybk5",
      },
    });

    const getNFTs = async () => {
      console.log("Getting nfts ", accountAddress);
      try {
        // Get NFTs owned by logged in user
        const chainName = "imtbl-zkevm-testnet";
        const response = await client.listNFTsByAccountAddress({
          chainName,
          accountAddress,
          contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!,
        });

        const _userNFTs = response.result;
        if (_userNFTs) setUserNFTs(_userNFTs);

        // Get all NFTs available for swap
        const allNFTsResponse = await client.listNFTs({
          chainName,
          contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!,
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
  }, [accountAddress]);

  const mint = async () => {
    try {
      const image = await getImage();

      console.log("returned image ", image);

      if (image) {
        const contract = new Contract(
          process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!,
          [
            "function mint(address to, uint256 tokenId) public payable",
            "function totalSupply() public view returns (uint256)",
            "function grantMinterRole(address account) public",
            "function totalSupply() public view returns (uint256)",
          ],
          evmSigner
        );

        const totalTokens = await contract.totalSupply(evmProvider as any);
        const tokenId = parseInt(totalTokens) + 1;

        console.log("new token id ", tokenId);

        const txnData = await contract.mint.populateTransaction(
          accountAddress,
          tokenId
        );

        const transaction = await evmSigner?.sendTransaction(txnData);

        console.log("transaction submitted ", transaction);

        await transaction?.wait().then(async (receipt: any) => {
          console.log("receipt ", receipt);
          await refreshNFTMetadata(image, tokenId);
        });
      }
    } catch (error) {
      console.log("Error minting NFT ", error);
    }
  };

  const refreshNFTMetadata = async (image: any, tokenId: number) => {
    const options = {
      method: "POST",
      url: `https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/collections/${process
        .env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!}/nfts/refresh-metadata`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-immutable-api-key": process.env.NEXT_PUBLIC_IMMUTABLE_API_KEY!,
      },
      data: {
        nft_metadata: [
          {
            name: image.name,
            description: image.description,
            image: image.imageLink,
            external_url: image.imageLink,
            animation_url: image.imageLink,
            youtube_url: image.imageLink,
            attributes: [],
            token_id: tokenId.toString(),
          },
        ],
      },
    };

    try {
      const { data } = await axios.request(options);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getImage = async () => {
    try {
      const { data } = await axios.get(
        "https://api.unsplash.com/photos/random",
        {
          headers: {
            Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      console.log("response ", data);

      const description = data.description;
      const altDescription = data.alt_description
        ? data.alt_description
        : "Data unavailable";

      const imageName = description
        ? description
        : altDescription.split(" ").slice(0, 2).join(" ");

      const image = {
        name: imageName,
        description: altDescription,
        imageLink: data.urls.full,
      };

      console.log("image ", image);

      return image;
    } catch (error) {
      console.error("Error fetching image:", error);
    }

    return null;
  };

  return (
    <div style={{ top: "10px" }}>
      <div style={{ marginTop: "100px" }}>
        <div className={styles.grid}>
          <h2>User NFTs</h2>
          <button
            style={{ width: "fit-content", padding: "10px" }}
            onClick={mint}
          >
            Mint NFT
          </button>
        </div>
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
                    <img
                      src={nft.image}
                      alt={nft.description}
                      width={200}
                      height={200}
                    />
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
                    <img
                      src={nft.image}
                      alt={nft.description}
                      width={200}
                      height={200}
                    />
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
                    proposeeContractAddress={nft.contract_address}
                    proposeeTokenId={nft.token_id}
                  />
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
