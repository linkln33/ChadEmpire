# ChadEmpire Solana Smart Contracts - Implementation Plan

## Project Overview
ChadEmpire is a Next.js React TypeScript application integrating with the Solana blockchain, featuring fair launch mechanics, staking with penalties, spin-to-yield gamification, and referral systems.

## Tech Stack
- **Frontend**: Next.js, React, TypeScript
- **Blockchain**: Solana
- **Smart Contract Framework**: Anchor
- **Wallet Integration**: Solana Wallet Adapter
- **Off-chain Data**: Supabase/Postgres (for tracking spin history, referrals, stake snapshots, leaderboards)

## Smart Contract System (8 Main Contracts)

### 1. CHAD Token Contract
- SPL token with 1 billion total supply
- 10% buy tax and 10% sell tax
- Minting locked post-deployment
- All tax directed to rewards pool (100% of tax feeds the rewards pool)
- Penalties and other taxes also feed the rewards pool

### 2. Fair Launch Contract
- 7-day randomized token generation event
- Accepts SOL contributions
- Referral system integration
- Anti-bot measures
- Automatic liquidity provision on Raydium (90% of collected SOL paired with 30% of CHAD tokens)
- Inspired by WISE token's Liquidity Transformer design

### 3. Staking Contract
- Stake/unstake functionality
- Daily yield (0.5% base APR)
- Lock periods with tiered early unstake penalties:
  - <24h: 50% penalty (feeds rewards pool)
  - <48h: 35% penalty (feeds rewards pool)
  - <96h: 15% penalty (feeds rewards pool)
  - ≥96h: 0% penalty ("Chad Freedom")

### 4. Spin-to-Yield Contract
- RNG-based daily spin for yield
- Probability distribution:
  - 80% chance: Base Yield (0.1-0.5%) from fees and farming
  - 20% chance: Moonshot Yield (1-3%) from jackpots, NFT fees, spin burns
- Fallback 0.5% yield if no spin
- 24-hour cooldown period
- Booster integration

### 5. Rewards Pool Contract
- Treasury holding 30% of tokens for staking and spin rewards
- Manages distribution of rewards
- Receives all buy/sell taxes (10% each)
- Receives penalties from early unstaking
- Sustainable reward mechanism

### 6. Referral Contract
- Tracks referrals
- Calculates and distributes commissions
- Super affiliate commissions (10% on total SOL brought)
- Protection against abuse

### 7. Dev & Marketing Vesting Contract
- Holds 10% allocation
- Linear vesting schedule:
  - 5% released at TGE (Token Generation Event)
  - Remaining 95% vested linearly over 12 months

### 8. DAO Governance Contract (Future Phase)
- Planned for far future implementation
- Ecosystem parameter control
- Community voting

## Booster System

Three main boosters:
1. **Yield Amplifier**: 1.5x yield for 24 hours
2. **Lucky Charm**: +10% winning probability for next 5 spins
3. **Chad Shield**: Guarantees break-even for next 3 spins

Boosters can be:
- Purchased
- Earned via staking milestones
- Received as referral rewards
- Obtained through special events

## Security Measures
- CAPTCHA integration
- Cooldowns and rate limiting
- Reentrancy guards
- Emergency pause functionality
- Multisig for admin functions

## Technical Implementation Notes
- Use Program Derived Addresses (PDAs) for deterministic account management
- Cross-Program Invocation (CPI) for inter-contract calls
- Handle Solana-specific constraints (transaction size limits, compute budgets)
- Frontend integration via existing `solana.ts` utilities

## Token Distribution
- 30% - Rewards Pool (for staking and spin rewards)
- 30% - Fair Launch (paired with 90% of collected SOL for liquidity)
- 30% - Community Incentives, Marketing, Partnerships
- 10% - Dev Team (vested: 5% at TGE, 95% over 12 months)

## Implementation Roadmap
1. Set up Anchor development environment
2. Implement CHAD Token contract with tax logic
3. Develop Fair Launch contract with referral and liquidity provision features
4. Implement Staking and Spin-to-Yield contracts with booster logic
5. Build Dev Vesting and Referral contracts
6. Conduct thorough testing on devnet
7. Plan for security audits before mainnet deployment

## Contract Interactions
- **Fair Launch → Token**: Mints initial tokens and creates liquidity
- **Token → Rewards Pool**: Directs all taxes to rewards pool
- **Staking → Rewards Pool**: Requests rewards for stakers
- **Spin-to-Yield → Rewards Pool**: Requests rewards for spinners
- **Referral → Fair Launch**: Tracks referrals during fair launch
- **Boosters → Spin/Stake**: Modifies yield calculations

## Environmental Variables
- `NEXT_PUBLIC_PROGRAM_ID` for Solana program ID
- `NEXT_PUBLIC_SOLANA_RPC_URL` for Solana RPC endpoint
- Configurable tokenomics parameters (tax rate, vesting percentages, penalty rates)
