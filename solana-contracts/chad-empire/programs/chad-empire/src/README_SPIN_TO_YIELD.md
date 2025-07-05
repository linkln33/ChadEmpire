# Spin-to-Yield Contract

## Overview

The Spin-to-Yield contract implements a gamified yield generation mechanism for the ChadEmpire ecosystem, allowing users to "spin" for variable yields with probability-based outcomes.

## Features

- **Probability Distribution**:
  - 80% chance: Base Yield (0.1-0.5%) from fees and farming
  - 20% chance: Moonshot Yield (1-3%) from jackpots and special allocations
- **Cooldown System**: 24-hour cooldown between spins
- **Fallback Yield**: 0.5% yield if user doesn't spin within the cooldown period
- **Booster System**: Three types of boosters to enhance spin outcomes:
  1. **Lucky Charm**: Increases winning probability by 10% for the next 5 spins
  2. **Yield Amplifier**: Increases yield by 1.5x for 24 hours
  3. **Chad Shield**: Guarantees at least break-even results for the next 3 spins

## Key Functions

### `initialize_spin_system`
Initializes the spin system with yield ranges, probabilities, and cooldown period.

```rust
pub fn initialize_spin_system(
    ctx: Context<InitializeSpinSystem>,
    base_yield_min_bps: u16,
    base_yield_max_bps: u16,
    moonshot_yield_min_bps: u16,
    moonshot_yield_max_bps: u16,
    moonshot_probability: u8,
    fallback_yield_bps: u16,
    cooldown_seconds: u32,
) -> Result<()>
```

### `spin_for_yield`
Allows users to spin for yield with probability-based outcomes.

```rust
pub fn spin_for_yield(ctx: Context<SpinForYield>) -> Result<()>
```

### `claim_fallback_yield`
Allows users to claim the fallback yield if they haven't spun within the cooldown period.

```rust
pub fn claim_fallback_yield(ctx: Context<ClaimFallbackYield>) -> Result<()>
```

### Booster Activation Functions

```rust
pub fn activate_lucky_charm(ctx: Context<ActivateBooster>, spins: u8) -> Result<()>
pub fn activate_yield_amplifier(ctx: Context<ActivateBooster>, hours: u8) -> Result<()>
pub fn activate_chad_shield(ctx: Context<ActivateBooster>, spins: u8) -> Result<()>
```

### `update_spin_config`
Updates the spin configuration parameters (only callable by authority).

```rust
pub fn update_spin_config(
    ctx: Context<UpdateSpinConfig>,
    base_yield_min_bps: Option<u16>,
    base_yield_max_bps: Option<u16>,
    moonshot_yield_min_bps: Option<u16>,
    moonshot_yield_max_bps: Option<u16>,
    moonshot_probability: Option<u8>,
    fallback_yield_bps: Option<u16>,
    cooldown_seconds: Option<u32>,
) -> Result<()>
```

## Account Structures

### `SpinConfig`
Stores the spin system configuration including yield ranges, probabilities, and cooldown period.

### `UserSpinInfo`
Tracks individual user spin information including last spin time, total spins, yields earned, and booster states.

### `SpinHistory`
Records the history of spins including timestamp, yield amount, and whether it was a moonshot.

## Integration with Staking

The Spin-to-Yield system complements the Staking contract by providing an additional, gamified way to earn yields. Users who prefer a more passive approach can rely on the base 0.5% daily yield from staking, while those who want to engage more actively can use the Spin-to-Yield system for potentially higher returns.
