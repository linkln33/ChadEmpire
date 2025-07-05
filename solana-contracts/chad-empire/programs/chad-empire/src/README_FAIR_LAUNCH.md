# Fair Launch Contract

## Overview

The Fair Launch contract implements a 7-day fair launch mechanism for the ChadEmpire ecosystem, allowing users to contribute SOL in exchange for CHAD tokens with daily token allocation.

## Features

- **7-Day Launch Period**: Users can contribute SOL over a 7-day period
- **Daily Supply Generation**: Random daily token supply generation within min/max bounds
- **Raydium Liquidity**: Automatic liquidity pairing with Raydium AMM (placeholder implementation)
- **Referral Integration**: Tracks referrals and provides bonuses to referrers
- **Token Claiming**: Allows users to claim their allocated tokens after the launch period

## Key Functions

### `initialize_fair_launch`
Initializes the fair launch with start time, duration, and referral bonus rate.

```rust
pub fn initialize_fair_launch(
    ctx: Context<InitializeFairLaunch>,
    start_time: i64,
    investment_days: u8,
    referral_bonus_bps: u16,
) -> Result<()>
```

### `contribute`
Allows users to contribute SOL for a specific day with optional referrer.

```rust
pub fn contribute(
    ctx: Context<Contribute>,
    amount: u64,
    day: u8,
    referrer: Option<Pubkey>,
) -> Result<()>
```

### `generate_daily_supply`
Generates the token supply for a specific day using pseudo-random number generation.

```rust
pub fn generate_daily_supply(ctx: Context<GenerateDailySupply>, day: u8) -> Result<()>
```

### `create_liquidity`
Creates liquidity on Raydium AMM after the fair launch period ends.

```rust
pub fn create_liquidity(ctx: Context<CreateLiquidity>) -> Result<()>
```

### `claim_tokens`
Allows users to claim their allocated tokens after the fair launch.

```rust
pub fn claim_tokens(ctx: Context<ClaimTokens>) -> Result<()>
```

### `claim_referral_bonus`
Allows referrers to claim their referral bonuses.

```rust
pub fn claim_referral_bonus(ctx: Context<ClaimReferralBonus>) -> Result<()>
```

## Account Structures

### `FairLaunchConfig`
Stores the fair launch configuration including start time, duration, and referral bonus rate.

### `InvestorInfo`
Tracks individual investor contributions, token allocations, and referral information.

### `DailyStats`
Records daily statistics including SOL collected and token supply.

## Security Considerations

- Minimum contribution amount to prevent dust attacks
- Day validation to ensure contributions are within the fair launch period
- Claim status tracking to prevent double-claiming
- Authority checks for administrative functions
