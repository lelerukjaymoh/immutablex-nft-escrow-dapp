# Immutable NFT Escrow

This is an escrow dapp that enables two parties to exchange NFts in a "trustless" way. It is built on Immutable Zkevm powered by Polygon.

## How it works

Party A creates a swap proposal with an NFT they are willing to exchange and the NFT they want to get from the swap. Once all checks are completed, a swap proposal is created. Party B will need to accept the proposal for teh proposal to be completed <br>
Once the proposal is accepted by party B, the escrow initiates an exchange of the two parties NFTS.

## Design and Architecture

![https://www.figma.com/file/VNecHQLcRfuC7W2lIqTMek/Immutable-NFT-escrow?type=whiteboard&node-id=4%3A43&t=oX1ian8jN4UTiqZa-1](./public/Immutable%20NFT%20escrow.png)

The user interacts with the Dapp to either create, accept or reject a swap proposal.<br>
Before the user can interact with the Dapp, s/he needs to be authenticated. The Dapp uses [immutable passport](https://www.immutable.com/products/passport) a non-custodial wallet and authentication solution that streamlines user onboarding through passwordless sign-on and automated wallet creation. Authenticating is either through a social logins or email sign in.

NFTs on immutable need to implement the Operator allowlist contract interface that enables token approvals and transfers to be restricted to allow listed users. This enables on-chain royalties to be enforced by restricting a contract's transfers to Immutable's version of the Seaport contract that honors royalties.

The escrow contract holds the NFTs and ensures all checks are completed before executing the swap transfers. It also manages the state of the swap proposals
