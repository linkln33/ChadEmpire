# Referral Contract

## Overview

The Referral contract implements a multi-tiered referral system for the ChadEmpire ecosystem, rewarding users who bring in new participants and incentivizing community growth.

## Features

- **Standard Referral Commissions**: Base commission rate for referring new users
- **Super Affiliate Tiers**: Enhanced commission rates for high-performing referrers
- **Automatic Tracking**: Transparent tracking of referrals and commissions
- **Commission Payments**: Automatic payment of commissions from the rewards pool
- **Anti-abuse Measures**: Protections against self-referrals and other exploits

## Key Functions

### `initialize_referral_system`
Initializes the referral system with commission rates and super affiliate thresholds.

```rust
pub fn initialize_referral_system(
    ctx: Context<InitializeReferralSystem>,
    standard_commission_bps: u16,
    super_affiliate_threshold: u64,
    super_affiliate_commission_bps: u16,
) -> Result<()>
```

### `register_referral`
Registers a new referral relationship between a user and a referrer.

```rust
pub fn register_referral(
    ctx: Context<RegisterReferral>,
    referrer_code: Pubkey,
) -> Result<()>
```

### `record_contribution`
Records a contribution from a referred user and pays commission to the referrer.

```rust
pub fn record_contribution(
    ctx: Context<RecordContribution>,
    sol_amount: u64,
) -> Result<()>
```

### `update_commission_rates`
Updates the commission rates and super affiliate thresholds (only callable by authority).

```rust
pub fn update_commission_rates(
    ctx: Context<UpdateCommissionRates>,
    standard_commission_bps: Option<u16>,
    super_affiliate_commission_bps: Option<u16>,
    super_affiliate_threshold: Option<u64>,
) -> Result<()>
```

### `generate_referral_code`
Generates a unique referral code for a user.

```rust
pub fn generate_referral_code(ctx: Context<GenerateReferralCode>) -> Result<()>
```

## Account Structures

### `ReferralConfig`
Stores the referral system configuration including commission rates and super affiliate thresholds.

```rust
pub struct ReferralConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub rewards_pool: Pubkey,
    pub standard_commission_bps: u16,
    pub super_affiliate_threshold: u64,
    pub super_affiliate_commission_bps: u16,
    pub total_referrers: u64,
    pub total_referred: u64,
    pub total_commissions_paid: u64,
}
```

### `ReferrerInfo`
Tracks information about referrers including their referred users and commissions earned.

```rust
pub struct ReferrerInfo {
    pub referrer: Pubkey,
    pub referral_code: Pubkey,
    pub referred_users: u64,
    pub sol_referred: u64,
    pub commissions_earned: u64,
    pub is_super_affiliate: bool,
}
```

### `ReferredUserInfo`
Tracks information about referred users including their referrer and contributions.

```rust
pub struct ReferredUserInfo {
    pub user: Pubkey,
    pub referrer: Pubkey,
    pub total_contribution: u64,
    pub join_timestamp: i64,
}
```

## Security Considerations

- Anti-abuse checks to prevent self-referrals
- Validation to ensure users can only be referred once
- Authority checks for administrative functions
- Commission rate caps to prevent excessive payouts
