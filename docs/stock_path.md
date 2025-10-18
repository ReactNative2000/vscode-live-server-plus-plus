# Tokenized Equity / Stock Research (High-level)

This document outlines the realistic legal and technical paths to issue equity-like tokens or represent shares on-chain. This is research-level guidance — consult securities counsel before taking action.

Major legal paths

- Reg CF (Crowdfunding): allow raising up to a statutory limit from many investors; platforms handle compliance.
- Reg A+: public offering with limits and audited financials — higher cost, broader investor pool.
- Security Token Offering (STO): treat token as a security, work with broker-dealers and transfer agents.
- Traditional equity issuance: corporate formation, cap table, and share issuance via broker and transfer agent.

Key considerations

- Securities laws: tokens that represent ownership or profit-sharing are likely securities in many jurisdictions.
- Custody & transfer: need a regulated transfer agent or custodian for off-chain share registry mapping to on-chain tokens.
- Exchange listing: tokenized securities require intermediaries and may not be freely tradable on public DEXs without approval.
- Investor protections: KYC/AML and disclosure obligations apply.

Technical options

- On-chain token that represents ownership: ERC-20/1400 with KYC gating, but real-world legal mapping needed.
- Off-chain ledger with on-chain receipts: store official cap table off-chain and use NFTs or hashes on-chain to prove records.
- Use regulated platforms: tokenization platforms (Securitize, Polymath) provide compliance tooling.

Practical research steps

1. Talk to securities counsel to choose a legal path (Reg CF vs Reg A+ etc.).
2. Evaluate tokenization providers (Securitize, Tokeny, Polymath) and their onboarding requirements.
3. Prototype a non-transferable (soulbound) certificate NFT to represent membership without tradability; this reduces securities suspicion.
4. If proceeding with tradable tokens, plan KYC, whitelist smart contracts, and integrate with regulated custodians.

Risks and constraints

- Regulatory risk: high — do not treat this lightly.
- Market liquidity: tokenized securities may have limited exchange options.
- Reporting obligations: taxes, investor reporting, and audit requirements.

Conclusion

Tokenized equity is possible but complex and regulated. For most projects, start with non-security membership tokens for product features and test user demand before exploring equity tokenization.
