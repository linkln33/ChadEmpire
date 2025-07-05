use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use solana_program::{program::invoke, system_instruction};
use std::convert::TryInto;

#[account]
pub struct SpinConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub rewards_pool: Pubkey,
    pub staking_config: Pubkey,
    pub base_yield_min_bps: u16,  // Min base yield in basis points (0.1% = 10 bps)
    pub base_yield_max_bps: u16,  // Max base yield in basis points (0.5% = 50 bps)
    pub moonshot_yield_min_bps: u16, // Min moonshot yield in basis points (1% = 100 bps)
    pub moonshot_yield_max_bps: u16, // Max moonshot yield in basis points (3% = 300 bps)
    pub moonshot_probability: u8,    // Probability of moonshot in percentage (20%)
    pub fallback_yield_bps: u16,     // Fallback yield if no spin (0.5% = 50 bps)
    pub cooldown_seconds: u32,       // Cooldown between spins (24 hours = 86400 seconds)
}

impl SpinConfig {
    pub const LEN: usize = 32 + 32 + 32 + 32 + 2 + 2 + 2 + 2 + 1 + 2 + 4;
}

#[account]
pub struct UserSpinInfo {
    pub user: Pubkey,
    pub last_spin_timestamp: i64,
    pub total_spins: u32,
    pub total_base_yield_earned: u64,
    pub total_moonshot_yield_earned: u64,
    pub lucky_charm_spins_remaining: u8,  // Booster: Increases winning probability
    pub yield_amplifier_end_time: i64,    // Booster: Increases yield by 1.5x
    pub chad_shield_spins_remaining: u8,  // Booster: Guarantees break-even
}

impl UserSpinInfo {
    pub const LEN: usize = 32 + 8 + 4 + 8 + 8 + 1 + 8 + 1;
}

#[account]
pub struct SpinHistory {
    pub user: Pubkey,
    pub timestamp: i64,
    pub yield_bps: u16,
    pub is_moonshot: bool,
    pub tokens_earned: u64,
    pub boosters_active: [bool; 3], // [lucky_charm, yield_amplifier, chad_shield]
}

impl SpinHistory {
    pub const LEN: usize = 32 + 8 + 2 + 1 + 8 + 3;
}

pub fn initialize_spin_system(
    ctx: Context<InitializeSpinSystem>,
    base_yield_min_bps: u16,
    base_yield_max_bps: u16,
    moonshot_yield_min_bps: u16,
    moonshot_yield_max_bps: u16,
    moonshot_probability: u8,
    fallback_yield_bps: u16,
    cooldown_seconds: u32,
) -> Result<()> {
    // Validate parameters
    require!(base_yield_min_bps <= base_yield_max_bps, ErrorCode::InvalidYieldRange);
    require!(moonshot_yield_min_bps <= moonshot_yield_max_bps, ErrorCode::InvalidYieldRange);
    require!(moonshot_probability <= 100, ErrorCode::InvalidProbability);
    require!(cooldown_seconds > 0, ErrorCode::InvalidCooldown);
    
    let spin_config = &mut ctx.accounts.spin_config;
    spin_config.authority = ctx.accounts.authority.key();
    spin_config.token_mint = ctx.accounts.token_mint.key();
    spin_config.rewards_pool = ctx.accounts.rewards_pool.key();
    spin_config.staking_config = ctx.accounts.staking_config.key();
    spin_config.base_yield_min_bps = base_yield_min_bps;
    spin_config.base_yield_max_bps = base_yield_max_bps;
    spin_config.moonshot_yield_min_bps = moonshot_yield_min_bps;
    spin_config.moonshot_yield_max_bps = moonshot_yield_max_bps;
    spin_config.moonshot_probability = moonshot_probability;
    spin_config.fallback_yield_bps = fallback_yield_bps;
    spin_config.cooldown_seconds = cooldown_seconds;
    
    Ok(())
}

pub fn spin_for_yield(ctx: Context<SpinForYield>) -> Result<()> {
    let spin_config = &ctx.accounts.spin_config;
    let user_spin_info = &mut ctx.accounts.user_spin_info;
    let spin_history = &mut ctx.accounts.spin_history;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Check cooldown
    if user_spin_info.last_spin_timestamp > 0 {
        let time_since_last_spin = current_time - user_spin_info.last_spin_timestamp;
        require!(
            time_since_last_spin >= spin_config.cooldown_seconds as i64,
            ErrorCode::CooldownNotMet
        );
    }
    
    // Get stake amount from staking account
    let stake_account = &ctx.accounts.stake_account;
    require!(stake_account.stake_amount > 0, ErrorCode::NoStake);
    
    // Generate random number for spin result
    // In a real implementation, we would use a VRF (Verifiable Random Function)
    // For simplicity, we'll use a deterministic approach based on the block hash
    let recent_blockhash = ctx.accounts.recent_blockhashes.to_account_info().key();
    let seed = &[
        b"spin_result".as_ref(),
        user_spin_info.user.as_ref(),
        &user_spin_info.total_spins.to_le_bytes(),
        recent_blockhash.as_ref(),
    ];
    let (_, bump) = Pubkey::find_program_address(seed, ctx.program_id);
    
    // Determine if this is a moonshot (20% chance by default)
    // Adjust probability if Lucky Charm booster is active
    let mut moonshot_probability = spin_config.moonshot_probability;
    let lucky_charm_active = user_spin_info.lucky_charm_spins_remaining > 0;
    if lucky_charm_active {
        // Lucky Charm increases winning probability by 10%
        moonshot_probability = moonshot_probability.saturating_add(10);
        user_spin_info.lucky_charm_spins_remaining = user_spin_info.lucky_charm_spins_remaining.saturating_sub(1);
    }
    
    // Use the bump as a source of randomness (not secure for production)
    let is_moonshot = (bump as u8) % 100 < moonshot_probability;
    
    // Determine yield based on result
    let yield_bps = if is_moonshot {
        // Moonshot yield (1-3%)
        let range = spin_config.moonshot_yield_max_bps - spin_config.moonshot_yield_min_bps;
        let random_value = (bump as u16) % (range + 1);
        spin_config.moonshot_yield_min_bps + random_value
    } else {
        // Base yield (0.1-0.5%)
        let range = spin_config.base_yield_max_bps - spin_config.base_yield_min_bps;
        let random_value = (bump as u16) % (range + 1);
        spin_config.base_yield_min_bps + random_value
    };
    
    // Apply Chad Shield if active (guarantees at least break-even)
    let chad_shield_active = user_spin_info.chad_shield_spins_remaining > 0;
    let final_yield_bps = if chad_shield_active && yield_bps < spin_config.fallback_yield_bps {
        user_spin_info.chad_shield_spins_remaining = user_spin_info.chad_shield_spins_remaining.saturating_sub(1);
        spin_config.fallback_yield_bps
    } else {
        yield_bps
    };
    
    // Apply Yield Amplifier if active (1.5x yield)
    let yield_amplifier_active = current_time < user_spin_info.yield_amplifier_end_time;
    let amplified_yield_bps = if yield_amplifier_active {
        (final_yield_bps as u32)
            .checked_mul(150)
            .unwrap()
            .checked_div(100)
            .unwrap() as u16
    } else {
        final_yield_bps
    };
    
    // Calculate tokens earned based on stake amount and yield
    let tokens_earned = (stake_account.stake_amount as u128)
        .checked_mul(amplified_yield_bps as u128)
        .unwrap()
        .checked_div(10000)
        .unwrap() as u64;
    
    // Transfer tokens from rewards pool to user
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.rewards_pool.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.spin_config.to_account_info(),
            },
            &[&[
                b"spin_config".as_ref(),
                spin_config.token_mint.as_ref(),
                &[ctx.bumps.spin_config],
            ]],
        ),
        tokens_earned,
    )?;
    
    // Update user spin info
    user_spin_info.last_spin_timestamp = current_time;
    user_spin_info.total_spins = user_spin_info.total_spins.checked_add(1).unwrap();
    if is_moonshot {
        user_spin_info.total_moonshot_yield_earned = user_spin_info
            .total_moonshot_yield_earned
            .checked_add(tokens_earned)
            .unwrap();
    } else {
        user_spin_info.total_base_yield_earned = user_spin_info
            .total_base_yield_earned
            .checked_add(tokens_earned)
            .unwrap();
    }
    
    // Record spin history
    spin_history.user = ctx.accounts.user.key();
    spin_history.timestamp = current_time;
    spin_history.yield_bps = amplified_yield_bps;
    spin_history.is_moonshot = is_moonshot;
    spin_history.tokens_earned = tokens_earned;
    spin_history.boosters_active = [
        lucky_charm_active,
        yield_amplifier_active,
        chad_shield_active,
    ];
    
    Ok(())
}

pub fn claim_fallback_yield(ctx: Context<ClaimFallbackYield>) -> Result<()> {
    let spin_config = &ctx.accounts.spin_config;
    let user_spin_info = &mut ctx.accounts.user_spin_info;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Check if user has spun in the last 24 hours
    let time_since_last_spin = current_time - user_spin_info.last_spin_timestamp;
    require!(
        time_since_last_spin >= spin_config.cooldown_seconds as i64,
        ErrorCode::AlreadySpunToday
    );
    
    // Get stake amount from staking account
    let stake_account = &ctx.accounts.stake_account;
    require!(stake_account.stake_amount > 0, ErrorCode::NoStake);
    
    // Calculate fallback yield (0.5%)
    let tokens_earned = (stake_account.stake_amount as u128)
        .checked_mul(spin_config.fallback_yield_bps as u128)
        .unwrap()
        .checked_div(10000)
        .unwrap() as u64;
    
    // Transfer tokens from rewards pool to user
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.rewards_pool.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.spin_config.to_account_info(),
            },
            &[&[
                b"spin_config".as_ref(),
                spin_config.token_mint.as_ref(),
                &[ctx.bumps.spin_config],
            ]],
        ),
        tokens_earned,
    )?;
    
    // Update user spin info
    user_spin_info.last_spin_timestamp = current_time;
    user_spin_info.total_base_yield_earned = user_spin_info
        .total_base_yield_earned
        .checked_add(tokens_earned)
        .unwrap();
    
    Ok(())
}

pub fn activate_lucky_charm(ctx: Context<ActivateBooster>, spins: u8) -> Result<()> {
    require!(spins > 0 && spins <= 5, ErrorCode::InvalidBoosterValue);
    
    let user_spin_info = &mut ctx.accounts.user_spin_info;
    let booster_cost = calculate_booster_cost(BoosterType::LuckyCharm, spins);
    
    // Transfer tokens from user to rewards pool (booster payment)
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.rewards_pool.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        booster_cost,
    )?;
    
    // Activate booster
    user_spin_info.lucky_charm_spins_remaining = user_spin_info
        .lucky_charm_spins_remaining
        .checked_add(spins)
        .unwrap();
    
    Ok(())
}

pub fn activate_yield_amplifier(ctx: Context<ActivateBooster>, hours: u8) -> Result<()> {
    require!(hours > 0 && hours <= 24, ErrorCode::InvalidBoosterValue);
    
    let user_spin_info = &mut ctx.accounts.user_spin_info;
    let current_time = Clock::get()?.unix_timestamp;
    let booster_cost = calculate_booster_cost(BoosterType::YieldAmplifier, hours);
    
    // Transfer tokens from user to rewards pool (booster payment)
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.rewards_pool.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        booster_cost,
    )?;
    
    // Activate booster
    let duration_seconds = (hours as i64) * 3600;
    let new_end_time = current_time.checked_add(duration_seconds).unwrap();
    
    // If already active, extend the duration
    if current_time < user_spin_info.yield_amplifier_end_time {
        user_spin_info.yield_amplifier_end_time = user_spin_info
            .yield_amplifier_end_time
            .checked_add(duration_seconds)
            .unwrap();
    } else {
        user_spin_info.yield_amplifier_end_time = new_end_time;
    }
    
    Ok(())
}

pub fn activate_chad_shield(ctx: Context<ActivateBooster>, spins: u8) -> Result<()> {
    require!(spins > 0 && spins <= 3, ErrorCode::InvalidBoosterValue);
    
    let user_spin_info = &mut ctx.accounts.user_spin_info;
    let booster_cost = calculate_booster_cost(BoosterType::ChadShield, spins);
    
    // Transfer tokens from user to rewards pool (booster payment)
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.rewards_pool.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        booster_cost,
    )?;
    
    // Activate booster
    user_spin_info.chad_shield_spins_remaining = user_spin_info
        .chad_shield_spins_remaining
        .checked_add(spins)
        .unwrap();
    
    Ok(())
}

pub fn update_spin_config(
    ctx: Context<UpdateSpinConfig>,
    base_yield_min_bps: Option<u16>,
    base_yield_max_bps: Option<u16>,
    moonshot_yield_min_bps: Option<u16>,
    moonshot_yield_max_bps: Option<u16>,
    moonshot_probability: Option<u8>,
    fallback_yield_bps: Option<u16>,
    cooldown_seconds: Option<u32>,
) -> Result<()> {
    require!(
        ctx.accounts.authority.key() == ctx.accounts.spin_config.authority,
        ErrorCode::Unauthorized
    );
    
    let spin_config = &mut ctx.accounts.spin_config;
    
    // Update only the provided parameters
    if let Some(value) = base_yield_min_bps {
        spin_config.base_yield_min_bps = value;
    }
    
    if let Some(value) = base_yield_max_bps {
        spin_config.base_yield_max_bps = value;
    }
    
    if let Some(value) = moonshot_yield_min_bps {
        spin_config.moonshot_yield_min_bps = value;
    }
    
    if let Some(value) = moonshot_yield_max_bps {
        spin_config.moonshot_yield_max_bps = value;
    }
    
    if let Some(value) = moonshot_probability {
        require!(value <= 100, ErrorCode::InvalidProbability);
        spin_config.moonshot_probability = value;
    }
    
    if let Some(value) = fallback_yield_bps {
        spin_config.fallback_yield_bps = value;
    }
    
    if let Some(value) = cooldown_seconds {
        require!(value > 0, ErrorCode::InvalidCooldown);
        spin_config.cooldown_seconds = value;
    }
    
    // Validate that min values are less than or equal to max values
    require!(
        spin_config.base_yield_min_bps <= spin_config.base_yield_max_bps,
        ErrorCode::InvalidYieldRange
    );
    
    require!(
        spin_config.moonshot_yield_min_bps <= spin_config.moonshot_yield_max_bps,
        ErrorCode::InvalidYieldRange
    );
    
    Ok(())
}

// Helper function to calculate booster cost
fn calculate_booster_cost(booster_type: BoosterType, value: u8) -> u64 {
    match booster_type {
        BoosterType::LuckyCharm => {
            // 1000 tokens per spin
            (value as u64) * 1000 * 10u64.pow(9)
        }
        BoosterType::YieldAmplifier => {
            // 500 tokens per hour
            (value as u64) * 500 * 10u64.pow(9)
        }
        BoosterType::ChadShield => {
            // 2000 tokens per spin
            (value as u64) * 2000 * 10u64.pow(9)
        }
    }
}

enum BoosterType {
    LuckyCharm,
    YieldAmplifier,
    ChadShield,
}

#[derive(Accounts)]
pub struct InitializeSpinSystem<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + SpinConfig::LEN,
        seeds = [b"spin_config".as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub spin_config: Account<'info, SpinConfig>,
    
    #[account(
        mut,
        token::mint = token_mint,
    )]
    pub rewards_pool: Account<'info, TokenAccount>,
    
    /// CHECK: This is the staking config account
    pub staking_config: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct SpinForYield<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        seeds = [b"spin_config".as_ref(), spin_config.token_mint.as_ref()],
        bump
    )]
    pub spin_config: Account<'info, SpinConfig>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserSpinInfo::LEN,
        seeds = [b"user_spin".as_ref(), user.key().as_ref(), spin_config.key().as_ref()],
        bump
    )]
    pub user_spin_info: Account<'info, UserSpinInfo>,
    
    #[account(
        init,
        payer = user,
        space = 8 + SpinHistory::LEN,
        seeds = [
            b"spin_history".as_ref(),
            user.key().as_ref(),
            &user_spin_info.total_spins.to_le_bytes(),
            spin_config.key().as_ref()
        ],
        bump
    )]
    pub spin_history: Account<'info, SpinHistory>,
    
    #[account(
        constraint = stake_account.owner == user.key()
    )]
    pub stake_account: Account<'info, crate::staking::StakeAccount>,
    
    #[account(
        mut,
        token::mint = spin_config.token_mint,
        token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = spin_config.token_mint,
        constraint = rewards_pool.key() == spin_config.rewards_pool
    )]
    pub rewards_pool: Account<'info, TokenAccount>,
    
    /// CHECK: Used for randomness
    pub recent_blockhashes: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimFallbackYield<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        seeds = [b"spin_config".as_ref(), spin_config.token_mint.as_ref()],
        bump
    )]
    pub spin_config: Account<'info, SpinConfig>,
    
    #[account(
        mut,
        seeds = [b"user_spin".as_ref(), user.key().as_ref(), spin_config.key().as_ref()],
        bump
    )]
    pub user_spin_info: Account<'info, UserSpinInfo>,
    
    #[account(
        constraint = stake_account.owner == user.key()
    )]
    pub stake_account: Account<'info, crate::staking::StakeAccount>,
    
    #[account(
        mut,
        token::mint = spin_config.token_mint,
        token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = spin_config.token_mint,
        constraint = rewards_pool.key() == spin_config.rewards_pool
    )]
    pub rewards_pool: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ActivateBooster<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub spin_config: Account<'info, SpinConfig>,
    
    #[account(
        mut,
        seeds = [b"user_spin".as_ref(), user.key().as_ref(), spin_config.key().as_ref()],
        bump
    )]
    pub user_spin_info: Account<'info, UserSpinInfo>,
    
    #[account(
        mut,
        token::mint = spin_config.token_mint,
        token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = spin_config.token_mint,
        constraint = rewards_pool.key() == spin_config.rewards_pool
    )]
    pub rewards_pool: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateSpinConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"spin_config".as_ref(), spin_config.token_mint.as_ref()],
        bump
    )]
    pub spin_config: Account<'info, SpinConfig>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid yield range")]
    InvalidYieldRange,
    #[msg("Invalid probability")]
    InvalidProbability,
    #[msg("Invalid cooldown")]
    InvalidCooldown,
    #[msg("Cooldown not met")]
    CooldownNotMet,
    #[msg("No stake found")]
    NoStake,
    #[msg("Already spun today")]
    AlreadySpunToday,
    #[msg("Invalid booster value")]
    InvalidBoosterValue,
    #[msg("Unauthorized")]
    Unauthorized,
}
