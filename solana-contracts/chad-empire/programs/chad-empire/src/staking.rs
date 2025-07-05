use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use solana_program::{program::invoke, system_instruction};
use std::convert::TryInto;

#[account]
pub struct StakingConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub rewards_pool: Pubkey,
    pub total_staked: u64,
    pub base_apr_bps: u16,  // Base APR in basis points (e.g., 50 = 0.5%)
    pub daily_yield_bps: u16, // Daily yield in basis points for non-spinners (50 = 0.5%)
    pub early_unstake_penalty_tiers: [u16; 4], // Penalties in basis points for different tiers
    pub penalty_threshold_hours: [u8; 4],      // Time thresholds for penalty tiers in hours
}

impl StakingConfig {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 2 + 2 + (2 * 4) + (1 * 4);
}

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub stake_amount: u64,
    pub stake_timestamp: i64,
    pub last_claim_timestamp: i64,
    pub cumulative_rewards: u64,
}

impl StakeAccount {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 8;
}

pub fn initialize_staking(
    ctx: Context<InitializeStaking>,
    base_apr_bps: u16,
) -> Result<()> {
    let staking_config = &mut ctx.accounts.staking_config;
    staking_config.authority = ctx.accounts.authority.key();
    staking_config.token_mint = ctx.accounts.token_mint.key();
    staking_config.rewards_pool = ctx.accounts.rewards_pool.key();
    staking_config.total_staked = 0;
    
    // Default to 0.5% daily yield (50 basis points daily) if not specified
    // This is approximately 182.5% APR
    staking_config.base_apr_bps = if base_apr_bps == 0 { 50 } else { base_apr_bps };
    staking_config.daily_yield_bps = 50; // 0.5% daily yield for non-spinners
    
    // Set up penalty tiers as per requirements
    staking_config.early_unstake_penalty_tiers = [5000, 3500, 1500, 0]; // 50%, 35%, 15%, 0%
    staking_config.penalty_threshold_hours = [168, 336, 720, 744]; // 7 days, 14 days, 30 days, 31+ days
    
    Ok(())
}

pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
    require!(amount > 0, ErrorCode::InvalidAmount);
    
    let staking_config = &mut ctx.accounts.staking_config;
    let stake_account = &mut ctx.accounts.stake_account;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Transfer tokens from user to stake vault
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.stake_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount,
    )?;
    
    // Initialize stake account if new
    if stake_account.owner == Pubkey::default() {
        stake_account.owner = ctx.accounts.user.key();
        stake_account.stake_timestamp = current_time;
        stake_account.last_claim_timestamp = current_time;
        stake_account.stake_amount = amount;
        stake_account.cumulative_rewards = 0;
    } else {
        // If already staking, calculate pending rewards first
        let pending_rewards = calculate_rewards(
            stake_account.stake_amount,
            stake_account.last_claim_timestamp,
            current_time,
            staking_config.daily_yield_bps,
        )?;
        
        // Update stake account
        stake_account.stake_amount = stake_account.stake_amount.checked_add(amount).unwrap();
        stake_account.last_claim_timestamp = current_time;
        stake_account.cumulative_rewards = stake_account.cumulative_rewards.checked_add(pending_rewards).unwrap();
    }
    
    // Update total staked in config
    staking_config.total_staked = staking_config.total_staked.checked_add(amount).unwrap();
    
    Ok(())
}

pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
    require!(amount > 0, ErrorCode::InvalidAmount);
    
    let staking_config = &mut ctx.accounts.staking_config;
    let stake_account = &mut ctx.accounts.stake_account;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Check if user has enough staked
    require!(stake_account.stake_amount >= amount, ErrorCode::InsufficientStake);
    
    // Calculate pending rewards
    let pending_rewards = calculate_rewards(
        stake_account.stake_amount,
        stake_account.last_claim_timestamp,
        current_time,
        staking_config.base_apr_bps,
    )?;
    
    // Calculate penalty based on staking duration
    let stake_duration_hours = ((current_time - stake_account.stake_timestamp) / 3600) as u8;
    let penalty_tier = get_penalty_tier(stake_duration_hours, &staking_config.penalty_threshold_hours);
    let penalty_bps = staking_config.early_unstake_penalty_tiers[penalty_tier as usize];
    
    // Calculate penalty amount
    let penalty_amount = (amount as u128)
        .checked_mul(penalty_bps as u128)
        .unwrap()
        .checked_div(10000)
        .unwrap() as u64;
    
    // Amount to return to user after penalty
    let return_amount = amount.checked_sub(penalty_amount).unwrap();
    
    // Transfer tokens from stake vault to user
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.stake_vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.staking_config.to_account_info(),
            },
            &[&[
                b"staking".as_ref(),
                staking_config.token_mint.as_ref(),
                &[ctx.bumps.staking_config],
            ]],
        ),
        return_amount,
    )?;
    
    // If there's a penalty, transfer it to the rewards pool
    if penalty_amount > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.stake_vault.to_account_info(),
                    to: ctx.accounts.rewards_pool.to_account_info(),
                    authority: ctx.accounts.staking_config.to_account_info(),
                },
                &[&[
                    b"staking".as_ref(),
                    staking_config.token_mint.as_ref(),
                    &[ctx.bumps.staking_config],
                ]],
            ),
            penalty_amount,
        )?;
    }
    
    // Update stake account
    stake_account.stake_amount = stake_account.stake_amount.checked_sub(amount).unwrap();
    stake_account.last_claim_timestamp = current_time;
    stake_account.cumulative_rewards = stake_account.cumulative_rewards.checked_add(pending_rewards).unwrap();
    
    // If fully unstaked, reset stake timestamp
    if stake_account.stake_amount == 0 {
        stake_account.stake_timestamp = 0;
    }
    
    // Update total staked in config
    staking_config.total_staked = staking_config.total_staked.checked_sub(amount).unwrap();
    
    Ok(())
}

pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
    let staking_config = &ctx.accounts.staking_config;
    let stake_account = &mut ctx.accounts.stake_account;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Calculate pending rewards using daily yield (0.5% daily for non-spinners)
    let pending_rewards = calculate_rewards(
        stake_account.stake_amount,
        stake_account.last_claim_timestamp,
        current_time,
        staking_config.daily_yield_bps,
    )?
    
    // Check if there are rewards to claim
    require!(pending_rewards > 0, ErrorCode::NoRewardsToClaim);
    
    // Transfer rewards from rewards pool to user
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.rewards_pool.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.staking_config.to_account_info(),
            },
            &[&[
                b"staking".as_ref(),
                staking_config.token_mint.as_ref(),
                &[ctx.bumps.staking_config],
            ]],
        ),
        pending_rewards,
    )?;
    
    // Update stake account
    stake_account.last_claim_timestamp = current_time;
    stake_account.cumulative_rewards = stake_account.cumulative_rewards.checked_add(pending_rewards).unwrap();
    
    Ok(())
}

pub fn update_apr(
    ctx: Context<UpdateApr>,
    new_base_apr_bps: u16,
    new_daily_yield_bps: Option<u16>,
) -> Result<()> {
    require!(ctx.accounts.authority.key() == ctx.accounts.staking_config.authority, ErrorCode::Unauthorized);
    require!(new_base_apr_bps <= 10000, ErrorCode::InvalidParameter); // Max 100% APR
    
    let staking_config = &mut ctx.accounts.staking_config;
    staking_config.base_apr_bps = new_base_apr_bps;
    
    // Update daily yield if provided, otherwise keep current value
    if let Some(daily_yield) = new_daily_yield_bps {
        require!(daily_yield <= 1000, ErrorCode::InvalidParameter); // Max 10% daily yield
        staking_config.daily_yield_bps = daily_yield;
    }
    
    Ok(())
}

// Helper function to calculate rewards
fn calculate_rewards(
    stake_amount: u64,
    last_claim_timestamp: i64,
    current_timestamp: i64,
    daily_yield_bps: u16,
) -> Result<u64> {
    if stake_amount == 0 || current_timestamp <= last_claim_timestamp {
        return Ok(0);
    }
    
    // Calculate time difference in days (with precision)
    let time_diff_seconds = current_timestamp.checked_sub(last_claim_timestamp).unwrap();
    let time_diff_days = time_diff_seconds as f64 / 86400.0;
    
    // Calculate rewards: stake_amount * (daily_yield / 10000) * time_diff_days
    // This provides exactly 0.5% daily yield when daily_yield_bps = 50
    let daily_yield_decimal = daily_yield_bps as f64 / 10000.0;
    let rewards = (stake_amount as f64) * daily_yield_decimal * time_diff_days;
    
    Ok(rewards as u64)
}

// Helper function to determine penalty tier based on staking duration
fn get_penalty_tier(stake_duration_hours: u8, threshold_hours: &[u8; 4]) -> u8 {
    if stake_duration_hours < threshold_hours[0] {
        0 // Highest penalty tier
    } else if stake_duration_hours < threshold_hours[1] {
        1 // Second penalty tier
    } else if stake_duration_hours < threshold_hours[2] {
        2 // Third penalty tier
    } else {
        3 // No penalty ("Chad Freedom")
    }
}

#[derive(Accounts)]
pub struct InitializeStaking<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + StakingConfig::LEN,
        seeds = [b"staking".as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub staking_config: Account<'info, StakingConfig>,
    
    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = staking_config,
    )]
    pub stake_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = token_mint,
    )]
    pub rewards_pool: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub staking_config: Account<'info, StakingConfig>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + StakeAccount::LEN,
        seeds = [b"stake_account".as_ref(), user.key().as_ref(), staking_config.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(
        mut,
        token::mint = staking_config.token_mint,
        token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = staking_config.token_mint,
        token::authority = staking_config,
    )]
    pub stake_vault: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"staking".as_ref(), staking_config.token_mint.as_ref()],
        bump
    )]
    pub staking_config: Account<'info, StakingConfig>,
    
    #[account(
        mut,
        seeds = [b"stake_account".as_ref(), user.key().as_ref(), staking_config.key().as_ref()],
        bump,
        constraint = stake_account.owner == user.key()
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(
        mut,
        token::mint = staking_config.token_mint,
        token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = staking_config.token_mint,
        token::authority = staking_config,
    )]
    pub stake_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = staking_config.token_mint,
        constraint = rewards_pool.key() == staking_config.rewards_pool
    )]
    pub rewards_pool: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        seeds = [b"staking".as_ref(), staking_config.token_mint.as_ref()],
        bump
    )]
    pub staking_config: Account<'info, StakingConfig>,
    
    #[account(
        mut,
        seeds = [b"stake_account".as_ref(), user.key().as_ref(), staking_config.key().as_ref()],
        bump,
        constraint = stake_account.owner == user.key()
    )]
    pub stake_account: Account<'info, StakeAccount>,
    
    #[account(
        mut,
        token::mint = staking_config.token_mint,
        token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = staking_config.token_mint,
        constraint = rewards_pool.key() == staking_config.rewards_pool
    )]
    pub rewards_pool: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateApr<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"staking".as_ref(), staking_config.token_mint.as_ref()],
        bump
    )]
    pub staking_config: Account<'info, StakingConfig>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient stake")]
    InsufficientStake,
    #[msg("No rewards to claim")]
    NoRewardsToClaim,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("APR too high")]
    AprTooHigh,
}
