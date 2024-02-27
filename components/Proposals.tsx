"use client";

import { useEffect, useState } from "react";
import styles from "../app/page.module.css";
import { Contract } from "ethers";
import { useSharedContext } from "./context/sharedContext";
import ESCROW_ABI from "../lib/ABI/escrow.json";
import { displayPartialAddress } from "@/lib/utils";
import { blockchainData, config } from "@imtbl/sdk";

export default function Proposals() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [escrowContract, setEscrowContract] = useState<Contract>();
  const [userAddress, setUserAddress] = useState<string>("");
  const [proposalState, setProposalState] = useState<boolean>(false);

  const { evmSigner } = useSharedContext();

  useEffect(() => {
    const getProposals = async () => {
      try {
        if (!evmSigner) return;

        await evmSigner.getAddress().then((address) => {
          setUserAddress(address);
        });

        const client = new blockchainData.BlockchainData({
          baseConfig: {
            environment: config.Environment.SANDBOX,
            publishableKey: process.env.NEXT_PUBLIC_IMMUTABLE_PUBLISHABLE_KEY,
          },
        });
        const chainName = "imtbl-zkevm-testnet";

        const contract = new Contract(
          process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS!,
          ESCROW_ABI,
          evmSigner
        );

        setEscrowContract(contract);

        const proposalResponse = await contract.getProposals();

        let _proposals = [];

        for (const proposal of proposalResponse) {
          _proposals.push({
            id: parseInt(proposal.id),
            proposer: proposal.proposer,
            proposee: proposal.proposee,
            proposerNFT: {
              nftContractAddress: proposal.proposerNFT[0],
              nftTokenId: parseInt(proposal.proposerNFT[1]),
              imageLink: (
                await client.getNFT({
                  contractAddress: proposal.proposerNFT[0],
                  tokenId: `${parseInt(proposal.proposerNFT[1])}`,
                  chainName,
                })
              ).result.image,
            },
            proposeeNFT: {
              nftContractAddress: proposal.proposeeNFT[0],
              nftTokenId: parseInt(proposal.proposeeNFT[1]),
              imageLink: (
                await client.getNFT({
                  contractAddress: proposal.proposeeNFT[0],
                  tokenId: `${parseInt(proposal.proposeeNFT[1])}`,
                  chainName,
                })
              ).result.image,
            },
            status:
              parseInt(proposal.status) == 0
                ? "Swap Proposed"
                : parseInt(proposal.status) == 1
                ? "Swap Completed"
                : "Swap Rejected",
          });
        }

        setProposals(_proposals);
      } catch (error) {
        console.log("error getting proposals ", error);
      }
    };

    getProposals();
  }, [proposalState, evmSigner]);

  const acceptSwap = async (
    proposalId: number,
    proposeeNFTContract: string,
    proposeeTokenId: number
  ) => {
    // Transfer the proposee NFT to escrow
    // This function is expected to be called by only the proposee
    const proposerNFTContract = new Contract(
      proposeeNFTContract,
      [
        "function safeTransferFrom(address from, address to, uint256 tokenId) public",
        "function ownerOf(uint tokenId) public returns (address)",
      ],
      evmSigner
    );

    const proposee = await proposerNFTContract?.ownerOf.staticCall(
      proposeeTokenId
    );

    const transfer = await proposerNFTContract?.safeTransferFrom(
      proposee,
      process.env.NEXT_PUBLIC_ESCROW_EOA_ADDRESS,
      proposeeTokenId,
      {
        maxPriorityFeePerGas: 10e9,
        maxFeePerGas: 15e9,
      }
    );

    await transfer
      ?.wait()
      .then(async (receipt: any) => {
        console.log("NFT transferred to Escrow ", receipt.hash);
      })
      .catch((err: any) => {
        console.log("error transferring NFT ", err);
      });

    await escrowContract
      ?.acceptSwapProposal(proposalId)
      .then(() => setProposalState(!proposalState))
      .catch((error) => console.log("error accepting swap", error));
  };

  const cancelSwap = async (proposalId: number) => {
    await escrowContract
      ?.cancelProposal(proposalId)
      .then(() => setProposalState(!proposalState))
      .catch((error) => console.log("error cancelling swap", error));
  };

  const rejectSwap = async (proposalId: number) => {
    await escrowContract
      ?.rejectProposal(proposalId)
      .then(() => setProposalState(!proposalState))
      .catch((error) => console.log("error accepting swap", error));
  };

  return (
    <div className={styles.description}>
      <div>
        <h2>Swap Proposals</h2>
        <div className={styles.description}>
          <div className={styles.grid}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Proposal Id</th>
                  <th>Proposer</th>
                  <th>Proposee</th>
                  <th>Proposer NFT</th>
                  <th>Proposee NFT</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr key={proposal.id}>
                    {/* <pre>{JSON.stringify(proposal)}</pre> */}
                    <td>{proposal.id}</td>
                    <td>{displayPartialAddress(proposal.proposer)}</td>
                    <td>{displayPartialAddress(proposal.proposee)}</td>
                    <td style={{ alignContent: "center" }}>
                      <a
                        href={proposal.proposerNFT.imageLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginBottom: "30px", marginTop: "20px" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proposal.proposerNFT.imageLink}
                          alt=""
                          width={50}
                          height={50}
                        />
                      </a>
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            proposal.proposerNFT.nftContractAddress
                          );
                          console.log(
                            "copied contract address ",
                            proposal.proposerNFT.nftContractAddress
                          );
                        }}
                      >
                        Contract:
                        {displayPartialAddress(
                          proposal.proposerNFT.nftContractAddress
                        )}
                      </span>
                      <br />
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            proposal.proposerNFT.nftContractAddress
                          );
                          console.log(
                            "copied token id ",
                            proposal.proposerNFT.nftTokenId
                          );
                        }}
                      >
                        Token Id: {proposal.proposerNFT.nftTokenId}
                        {/* TODO: Add nft owner */}
                      </span>
                    </td>
                    <td style={{ alignItems: "center" }}>
                      <a
                        href={proposal.proposeeNFT.imageLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginBottom: "30px", marginTop: "20px" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proposal.proposeeNFT.imageLink}
                          alt=""
                          width={50}
                          height={50}
                        />
                      </a>
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            proposal.proposeeNFT.nftContractAddress
                          );
                          console.log(
                            "copied contract address ",
                            proposal.proposeeNFT.nftContractAddress
                          );
                        }}
                      >
                        Contract:
                        {displayPartialAddress(
                          proposal.proposeeNFT.nftContractAddress
                        )}
                      </span>
                      <br />
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            proposal.proposeeNFT.nftContractAddress
                          );
                          console.log(
                            "copied token id ",
                            proposal.proposeeNFT.nftTokenId
                          );
                        }}
                      >
                        Token Id: {proposal.proposeeNFT.nftTokenId}
                      </span>
                    </td>
                    <td>{proposal.status}</td>
                    <td>
                      {proposal.status === "Swap Proposed" &&
                        (proposal.proposer === userAddress ? (
                          <button
                            onClick={() => cancelSwap(proposal.id)}
                            className={styles.button}
                          >
                            Cancel Swap
                          </button>
                        ) : (
                          proposal.proposee === userAddress && (
                            <div>
                              <button
                                onClick={() =>
                                  acceptSwap(
                                    proposal.id,
                                    proposal.proposeeNFT.nftContractAddress,
                                    proposal.proposeeNFT.nftTokenId
                                  )
                                }
                                className={styles.button}
                              >
                                Accept Swap
                              </button>
                              <button
                                onClick={() => rejectSwap(proposal.id)}
                                className={styles.button}
                              >
                                Reject Swap
                              </button>
                            </div>
                          )
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
