"use client";

import { useState, useEffect } from "react";
import styles from "../app/page.module.css";
import { useSharedContext } from "./context/sharedContext";
import { blockchainData, config } from "@imtbl/sdk";
import { displayPartialAddress } from "@/lib/utils";
import SwapNFT from "./Swap";
import Proposals from "./Proposals";
import axios from "axios";
import { Contract, JsonRpcProvider } from "ethers";
import { Wallet } from "ethers";

/**
 * NFT Display.
 */
export default function NFT() {
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [availableNFTs, setAvailableNFTs] = useState<any[]>([]);
  const [mintState, setMintState] = useState<boolean>(false);

  const { accountAddress, evmSigner, evmProvider } = useSharedContext();

  useEffect(() => {
    const client = new blockchainData.BlockchainData({
      baseConfig: {
        environment: config.Environment.SANDBOX,
        publishableKey: process.env.NEXT_PUBLIC_IMMUTABLE_PUBLISHABLE_KEY,
      },
    });

    const getNFTs = async () => {
      try {
        // Get NFTs owned by logged in user
        if (!accountAddress) return;

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
        let filteredNFTs = allNFTs.filter((nft) => {
          return !userNFTsIDs.includes(nft.token_id);
        });

        // filter out nfts that are owned by the escrow EOA address
        const escrowNFTs = await client.listNFTsByAccountAddress({
          chainName,
          accountAddress: process.env.NEXT_PUBLIC_ESCROW_EOA_ADDRESS!,
          contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!,
        });

        const escrowNFTsIDs: string[] = escrowNFTs.result.map((nft) => {
          return nft.token_id;
        });

        filteredNFTs = filteredNFTs.filter((nft) => {
          return !escrowNFTsIDs.includes(nft.token_id);
        });

        if (filteredNFTs) setAvailableNFTs(filteredNFTs);
      } catch (error) {
        console.log("error ", error);
      }
    };

    getNFTs();
  }, [accountAddress, mintState]);

  const mint = async () => {
    try {
      const image = await getImage();

      if (image) {
        const contract = new Contract(
          process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!,
          [
            "function mint(address to, uint256 tokenId) public payable",
            "function totalSupply() public view returns (uint256)",
            "function hasRole(bytes32 role, address account) public view returns (bool)",
            "function MINTER_ROLE() public view returns (bytes32)",
          ],
          evmSigner
        );

        // Get miter role
        const minterRole = await contract.MINTER_ROLE();

        // First check if user has the minter role
        const hasRole = await contract.hasRole(minterRole, accountAddress);

        console.log("User has minter role: ", hasRole);

        if (!hasRole) {
          console.log("Granting user minter role");

          // Grant minter role
          const _contract = new Contract(
            process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS!,
            ["function grantRole(bytes32 role, address account) public"],
            new Wallet(
              process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY!,
              new JsonRpcProvider(process.env.NEXT_PUBLIC_HTTP_URL!)
            )
          );

          await _contract
            .grantRole(minterRole, accountAddress, {
              maxPriorityFeePerGas: 10e9,
              maxFeePerGas: 15e9,
            })
            .then(async (receipt: any) => {
              console.log("role granted ", receipt);
              await receipt.wait();
            })
            .catch((error: any) => {
              console.log("error granting role ", error);
            });
        }

        const totalTokens = await contract.totalSupply();
        const tokenId = parseInt(totalTokens) + 1;

        console.log("Minting token with id ", tokenId);

        const txnData = await contract.mint.populateTransaction(
          accountAddress,
          tokenId,
          {
            maxFeePerGas: 15e9,
            gasLimit: 200000,
          }
        );

        const transaction = await evmSigner?.sendTransaction(txnData);

        await transaction?.wait().then(async (receipt: any) => {
          console.log("Token successfully minted ", receipt.hash);
          await refreshNFTMetadata(image, tokenId).then(() => {
            console.log("Token metadata updated");
            setMintState(!mintState);
          });
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

    await axios.request(options).catch((error) => {
      console.error("Error updating NFT metadata ", error);
    });
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

      return image;
    } catch (error) {
      console.log("Error fetching image from unsplash", error);
    }

    return null;
  };

  return (
    <div style={{ top: "10px" }}>
      <div style={{ marginTop: "100px" }}>
        <div className={styles.grid}>
          <h2>User NFTs</h2>
          <button
            style={{ width: "fit-content", padding: "10px", cursor: "pointer" }}
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
                    proposeeNFTContractAddress={nft.contract_address}
                    proposeeNFTTokenId={nft.token_id}
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
