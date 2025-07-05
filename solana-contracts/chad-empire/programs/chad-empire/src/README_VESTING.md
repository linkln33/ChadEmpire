# Vesting Contract

## Overview

The Vesting contract implements a linear token vesting mechanism for the ChadEmpire ecosystem, primarily designed for dev team and marketing allocations. It supports initial token release at TGE (Token Generation Event), cliff periods, and linear vesting over time.

## Features

- **Initial TGE Release**: Configurable percentage of tokens released at TGE
- **Cliff Period**: Optional period before vesting begins
- **Linear Vesting**: Tokens vest linearly over the vesting duration
- **Multiple Recipients**: Support for multiple vesting recipients with individual allocations
- **Secure Claiming**: Validation to prevent double-claiming and ensure proper vesting schedule

## Key Functions

### `initialize_vesting`
Initializes the vesting contract with total allocation, TGE release percentage, vesting duration, and cliff period.

```rust
pub fn initialize_vesting(
    ctx: Context<InitializeVesting>,
    total_allocation: u64,
    tge_release_bps: u16,
    vesting_start_time: i64,
    vesting_duration_seconds: i64,
    cliff_seconds: i64,
) -> Result<()>
```

### `add_recipient`
Adds a new recipient to the vesting contract with a specific allocation.

```rust
pub fn add_recipient(
    ctx: Context<AddRecipient>,
    allocation: u64,
) -> Result<()>
```

### `claim_vested_tokens`
Allows recipients to claim their vested tokens based on the vesting schedule.

```rust
pub fn claim_vested_tokens(ctx: Context<ClaimVestedTokens>) -> Result<()>
```

### `update_vesting_schedule`
Updates the vesting schedule parameters (only callable by authority).

```rust
pub fn update_vesting_schedule(
    ctx: Context<UpdateVestingSchedule>,
    tge_release_bps: Option<u16>,
    vesting_start_time: Option<i64>,
    vesting_duration_seconds: Option<i64>,
    cliff_seconds: Option<i64>,
) -> Result<()>
```

## Account Structures

### `VestingConfig`
Stores the vesting configuration including total allocation, TGE release percentage, vesting duration, and cliff period.

```rust
pub struct VestingConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub token_vault: Pubkey,
    pub total_allocation: u64,
    pub allocated_amount: u64,
    pub tge_release_bps: u16,
    pub vesting_start_time: i64,
    pub vesting_duration_seconds: i64,
    pub cliff_seconds: i64,
}
```

### `RecipientAccount`
Tracks individual recipient information including allocation, claimed amount, and last claim timestamp.

```rust
pub struct RecipientAccount {
    pub recipient: Pubkey,
    pub allocation: u64,
    pub claimed_amount: u64,
    pub last_claim_timestamp: i64,
}
```

## Vesting Calculation

The vesting calculation follows this formula:

1. At TGE, a percentage of tokens (tge_release_bps) is immediately available
2. After the cliff period, remaining tokens vest linearly over the vesting duration
3. The amount of tokens vested at any time is calculated as:
   ```
   vested_amount = (tge_release * allocation) + 
                   (remaining_allocation * (elapsed_time - cliff) / vesting_duration)
   ```
4. Users can only claim the difference between vested_amount and previously claimed_amount

## Security Considerations

- Authority checks for administrative functions
- Validation to prevent double-claiming
- Secure arithmetic to prevent overflow/underflow
- Checks to ensure vesting parameters are valid
