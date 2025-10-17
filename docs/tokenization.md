# Membership Token (Non-security) Demo Plan

This document outlines a low-risk approach to prototype membership tokens (non-security) using NFTs on an Ethereum-compatible testnet. The goal is to demonstrate gated features, membership checks, and simple minting without creating a security offering.

Principles & legal note

- Treat tokens as utility/membership tokens (access badges, not investment contracts).
- Do not promise profit or revenue share tied to token ownership.
- Avoid resale guarantees, dividend-like benefits, or any language that implies profit from others' efforts.
- Consult legal counsel before offering tokens for sale in production.

Tech stack (fast prototype)

- Hardhat (local dev + testnet deploy)
- OpenZeppelin Contracts (ERC-721 for unique membership badges)
- Ethers.js for client interactions
- IPFS (or free pinning like Web3.Storage) for storing metadata

Demo plan (steps)

1. Minimal token contract

   - ERC-721 contract with a minting function restricted to the owner or a simple sale function that accepts testnet ETH.
   - Metadata includes: name, description, image, tier (bronze/silver/gold), and an external_url pointing to a member profile.

2. Local dev & testnet

   - Initialize a Hardhat project and write a deploy script that deploys to Goerli/Sepolia or a local Hardhat node.
   - Use a wallet (Metamask) connected to the testnet with test ETH.

3. Client integration

   - Add a front-end flow to request wallet connect, call a minting function, and then store the minted token ID in the user's local profile.
   - Example access check: contract.balanceOf(address) > 0 grants access to premium pages.

4. Simple marketplace (optional)

   - For prototyping, redirect users to OpenSea testnets or show a link to view the token metadata.

Example ERC-721 (solidity)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MembershipBadge is ERC721URIStorage, Ownable {
    uint256 public nextId;

    constructor() ERC721("MembershipBadge", "MBADGE") {}

    function mint(address to, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 id = ++nextId;
        _mint(to, id);
        _setTokenURI(id, tokenURI);
        return id;
    }
}
```

Hardhat + Ethers example (JS) — minting

```js
const { ethers } = require('hardhat');

async function main() {
  const Badge = await ethers.getContractFactory('MembershipBadge');
  const badge = await Badge.deploy();
  await badge.deployed();
  console.log('Deployed at', badge.address);

  // mint to signer[1]
  const [owner, user] = await ethers.getSigners();
  const tx = await badge.mint(user.address, 'ipfs://Qm...');
  await tx.wait();
  console.log('Minted to', user.address);
}

main().catch(console.error);
```

Quick UX ideas

- A "Mint membership" button that opens MetaMask and calls the mint method.
- After minting, the site stores token info in localStorage and shows a badge in the profile.
- Protected routes check web3 wallet or a backend signature to confirm ownership.

Testnet minting plan

1. Deploy to Sepolia or Goerli using Hardhat and an Infura/Alchemy key.
2. Mint a few tokens to test accounts and confirm metadata displays correctly.
3. Add the token ownership check to the reflection form to gate certain fields or a premium report download.

Security & next steps

- Use OpenZeppelin upgrades and standard patterns for production.
- If accepting payment, integrate a trusted payment provider or on-chain sale flow and follow KYC/AML guidance.
- Consider on-chain gasless minting via meta-transactions (e.g., Biconomy) for better UX.
