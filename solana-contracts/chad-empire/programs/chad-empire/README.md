# ChadEmpire Solana Smart Contracts

This directory contains the complete suite of Solana smart contracts for the ChadEmpire ecosystem, built using the Anchor framework.

## Contract Overview

The ChadEmpire ecosystem consists of the following interconnected contracts:

1. **CHAD Token**: Core token with buy/sell tax mechanism
2. **Fair Launch**: 7-day fair launch with daily token allocation
3. **Staking**: Token staking with tiered penalties and rewards
4. **Spin-to-Yield**: Gamified yield generation with probability distribution
5. **Referral**: Multi-tiered referral system with super affiliates
6. **Vesting**: Linear token vesting for team and partners
7. **Rewards Pool**: Treasury management and reward distribution
8. **Governance**: DAO governance for ecosystem decisions

## Getting Started

### Prerequisites

- Solana CLI (v1.16.0 or later)
- Anchor CLI (v0.30.1 or later)
- Rust (latest stable)

### Installation

```bash
# Clone the repository
git clone https://github.com/linkln33/ChadEmpire.git
cd ChadEmpire/solana-contracts/chad-empire

# Install dependencies
npm install

# Build the program
anchor build
```

### Deployment

```bash
# Deploy to localnet for testing
anchor deploy --provider.cluster localnet

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet
```

## Testing

```bash
# Run all tests
anchor test

# Run specific test
anchor test -- -t test_name
```

## License

[MIT](LICENSE)
