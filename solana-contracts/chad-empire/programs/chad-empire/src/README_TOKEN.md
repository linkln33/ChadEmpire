# CHAD Token Contract

## Overview

The CHAD Token contract implements the core token functionality for the ChadEmpire ecosystem, featuring a built-in tax mechanism that feeds the rewards pool.

## Features

- **Total Supply**: 1 billion tokens with 9 decimals
- **Buy/Sell Tax**: 10% tax on all buy/sell transactions (configurable)
- **Tax Destination**: All taxes are sent to the rewards pool
- **Minting Lock**: Ability to permanently lock minting to prevent inflation
- **Authority Controls**: Only the authority can update tax rates and lock minting

## Key Functions

### `initialize_token`
Initializes the CHAD token with a fixed supply of 1 billion tokens.

```rust
pub fn initialize_token(ctx: Context<InitializeToken>, decimals: u8) -> Result<()>
```

### `lock_minting`
Permanently locks token minting to prevent inflation.

```rust
pub fn lock_minting(ctx: Context<LockMinting>) -> Result<()>
```

### `transfer_with_tax`
Transfers tokens with automatic tax calculation and collection.

```rust
pub fn transfer_with_tax(ctx: Context<TransferWithTax>, amount: u64) -> Result<()>
```

### `update_tax_rates`
Updates the buy and sell tax rates (only callable by authority).

```rust
pub fn update_tax_rates(
    ctx: Context<UpdateTaxRates>,
    new_buy_tax_bps: u16,
    new_sell_tax_bps: u16,
) -> Result<()>
```

## Account Structures

### `TokenConfig`
Stores the token configuration including authority, mint, rewards pool, tax rates, and supply information.

```rust
pub struct TokenConfig {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub rewards_pool: Pubkey,
    pub buy_tax_bps: u16,
    pub sell_tax_bps: u16,
    pub minting_locked: bool,
    pub total_supply: u64,
    pub decimals: u8,
}
```

## Security Considerations

- Only the authority can update tax rates and lock minting
- Tax rates are capped at 20% (2000 basis points)
- Once minting is locked, it cannot be unlocked
