# Staking Contract

## Overview

The Staking contract enables users to stake their CHAD tokens to earn rewards. It features tiered early unstake penalties that feed the rewards pool and a base APR for all stakers.

## Features

- **Base APR**: 0.5% daily yield (182.5% APR) for all stakers
- **Tiered Penalties**: Early unstaking incurs penalties based on time staked:
  - 0-7 days: 50% penalty
  - 8-14 days: 35% penalty
  - 15-30 days: 15% penalty
  - 31+ days: No penalty
- **Penalty Destination**: All penalties are sent to the rewards pool
- **Pro-rata Rewards**: Rewards calculated based on time staked and amount
- **Configurable APR**: Authority can update the base APR

## Key Functions

### `initialize_staking`
Initializes the staking system with a base APR.

```rust
pub fn initialize_staking(
    ctx: Context<InitializeStaking>,
    base_apr_bps: u16,
) -> Result<()>
```

### `stake`
Allows users to stake their CHAD tokens.

```rust
pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()>
```

### `unstake`
Allows users to unstake their CHAD tokens with applicable penalties.

```rust
pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()>
```

### `claim_rewards`
Allows users to claim their staking rewards.

```rust
pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()>
```

### `update_apr`
Updates the base APR (only callable by authority).

```rust
pub fn update_apr(ctx: Context<UpdateApr>, new_base_apr_bps: u16) -> Result<()>
```

## Account Structures

### `StakingConfig`
Stores the staking configuration including base APR and penalty tiers.

```rust
pub struct StakingConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub rewards_pool: Pubkey,
    pub base_apr_bps: u16,
    pub penalty_tier1_bps: u16,  // 50% for 0-7 days
    pub penalty_tier2_bps: u16,  // 35% for 8-14 days
    pub penalty_tier3_bps: u16,  // 15% for 15-30 days
    pub penalty_tier1_seconds: i64,  // 7 days in seconds
    pub penalty_tier2_seconds: i64,  // 14 days in seconds
    pub penalty_tier3_seconds: i64,  // 30 days in seconds
    pub total_staked: u64,
}
```

### `StakeAccount`
Tracks individual user staking information.

```rust
pub struct StakeAccount {
    pub owner: Pubkey,
    pub stake_amount: u64,
    pub stake_timestamp: i64,
    pub last_claim_timestamp: i64,
    pub cumulative_rewards: u64,
}
```

## Important Note

The staking contract provides a base yield of 0.5% daily (182.5% APR) for all stakers, regardless of whether they participate in the Spin-to-Yield system. This ensures that users who prefer a more passive approach still receive competitive yields.
