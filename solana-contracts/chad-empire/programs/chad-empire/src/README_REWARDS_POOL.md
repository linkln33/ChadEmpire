# Rewards Pool Contract

## Overview

The Rewards Pool contract manages the treasury and distributes rewards across different parts of the ChadEmpire ecosystem. It collects taxes from token transfers, penalties from early unstaking, and other fees, then allocates them to various sub-pools based on configurable percentages.

## Features

- **Configurable Allocation Percentages**: Customizable allocation to different sub-pools
- **Sub-pool Management**: Separate pools for staking rewards, spin-to-yield, referral rewards, and emergency reserve
- **Periodic Distribution**: Automated distribution of accumulated rewards
- **Distribution History**: Tracking of all distributions for transparency
- **Emergency Withdrawal**: Authorized withdrawal from emergency reserve

## Key Functions

### `initialize_rewards_pool`
Initializes the rewards pool with allocation percentages for each sub-pool.

```rust
pub fn initialize_rewards_pool(
    ctx: Context<InitializeRewardsPool>,
    staking_allocation_bps: u16,
    spin_allocation_bps: u16,
    referral_allocation_bps: u16,
    reserve_allocation_bps: u16,
) -> Result<()>
```

### `distribute_rewards`
Distributes accumulated rewards to sub-pools based on allocation percentages.

```rust
pub fn distribute_rewards(ctx: Context<DistributeRewards>) -> Result<()>
```

### `update_allocations`
Updates the allocation percentages for sub-pools (only callable by authority).

```rust
pub fn update_allocations(
    ctx: Context<UpdateAllocations>,
    staking_allocation_bps: Option<u16>,
    spin_allocation_bps: Option<u16>,
    referral_allocation_bps: Option<u16>,
    reserve_allocation_bps: Option<u16>,
) -> Result<()>
```

### `emergency_withdraw`
Allows the authority to withdraw tokens from the emergency reserve.

```rust
pub fn emergency_withdraw(
    ctx: Context<EmergencyWithdraw>,
    amount: u64,
) -> Result<()>
```

## Account Structures

### `RewardsPoolConfig`
Stores the rewards pool configuration including allocation percentages and distribution information.

```rust
pub struct RewardsPoolConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub main_vault: Pubkey,
    pub staking_allocation_bps: u16,
    pub spin_allocation_bps: u16,
    pub referral_allocation_bps: u16,
    pub reserve_allocation_bps: u16,
    pub last_distribution_time: i64,
    pub distribution_count: u64,
    pub total_distributed: u64,
}
```

### `SubPoolAccount`
Tracks information about each sub-pool including tokens received and distributed.

```rust
pub struct SubPoolAccount {
    pub pool_type: u8,  // 1 = staking, 2 = spin, 3 = referral, 4 = reserve
    pub vault: Pubkey,
    pub tokens_received: u64,
    pub tokens_distributed: u64,
}
```

### `DistributionRecord`
Records information about each distribution event.

```rust
pub struct DistributionRecord {
    pub timestamp: i64,
    pub total_amount: u64,
    pub staking_amount: u64,
    pub spin_amount: u64,
    pub referral_amount: u64,
    pub reserve_amount: u64,
}
```

## Security Considerations

- Validation that allocation percentages sum to 100% (10000 basis points)
- Authority checks for administrative functions
- Minimum time between distributions to prevent excessive gas costs
- Secure arithmetic to prevent overflow/underflow
