"use client";

import { use, useEffect, useState } from "react";
import styles from "../app/page.module.css";
import { Contract } from "ethers";
import { useSharedContext } from "./context/sharedContext";
import ESCROW_ABI from "../lib/ABI/escrow.json";

export default function Proposals() {
  const [proposals, setProposals] = useState<any[]>([]);

  const { evmSigner } = useSharedContext();

  useEffect(() => {
    const getProposals = async () => {
      try {
        console.log("evm signer ", evmSigner);

        if (!evmSigner) return;

        const contract = new Contract(
          process.env.NEXT_PUBLIC_ESCROW_ADDRESS!,
          ESCROW_ABI,
          evmSigner
        );

        const proposals = await contract.getProposals();
        console.log("proposals ", proposals);
        setProposals(proposals);
      } catch (error) {
        console.log("error ", error);
      }
    };

    getProposals();
  }, [evmSigner]);

  return (
    <div className={styles.description}>
      <div>
        <h2>Swap Proposals</h2>
        <div className={styles.description}>
          <div className={styles.grid}>
            <table>
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
                    <td>{proposal.id}</td>
                    <td>{proposal.proposer}</td>
                    <td>{proposal.proposee}</td>
                    <td>
                      <span>{proposal.nftAddress}</span>
                      <span>{proposal.id}</span>
                    </td>
                    <td>
                      <span>{proposal.nftAddress}</span>
                      <span>{proposal.id}</span>
                    </td>
                    <td>{proposal.status}</td>
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
