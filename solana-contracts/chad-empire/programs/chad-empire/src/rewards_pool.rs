use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use solana_program::{program::invoke, system_instruction};
use std::convert::TryInto;

#[account]
pub struct RewardsPoolConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub rewards_vault: Pubkey,
    pub total_rewards_distributed: u64,
    pub staking_allocation_bps: u16,     // Percentage allocated to staking rewards in basis points
    pub spin_allocation_bps: u16,        // Percentage allocated to spin-to-yield in basis points
    pub referral_allocation_bps: u16,    // Percentage allocated to referral rewards in basis points
    pub emergency_reserve_bps: u16,      // Percentage kept as emergency reserve in basis points
    pub last_distribution_timestamp: i64,
    pub distribution_frequency_seconds: i64, // How often rewards are distributed to sub-pools
}

impl RewardsPoolConfig {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 2 + 2 + 2 + 2 + 8 + 8;
}

#[account]
pub struct SubPool {
    pub pool_type: u8,                   // 1 = staking, 2 = spin, 3 = referral, 4 = reserve
    pub token_account: Pubkey,
    pub allocation_bps: u16,
    pub total_received: u64,
    pub total_distributed: u64,
}

impl SubPool {
    pub const LEN: usize = 1 + 32 + 2 + 8 + 8;
}

#[account]
pub struct DistributionHistory {
    pub timestamp: i64,
    pub total_amount: u64,
    pub staking_amount: u64,
    pub spin_amount: u64,
    pub referral_amount: u64,
    pub reserve_amount: u64,
}

impl DistributionHistory {
    pub const LEN: usize = 8 + 8 + 8 + 8 + 8 + 8;
}

pub fn initialize_rewards_pool(
    ctx: Context<InitializeRewardsPool>,
    staking_allocation_bps: u16,
    spin_allocation_bps: u16,
    referral_allocation_bps: u16,
    emergency_reserve_bps: u16,
    distribution_frequency_seconds: i64,
) -> Result<()> {
    // Validate parameters
    require!(
        staking_allocation_bps + spin_allocation_bps + referral_allocation_bps + emergency_reserve_bps == 10000,
        ErrorCode::InvalidAllocationPercentages
    );
    require!(distribution_frequency_seconds > 0, ErrorCode::InvalidDistributionFrequency);
    
    // Initialize rewards pool config
    let rewards_pool_config = &mut ctx.accounts.rewards_pool_config;
    rewards_pool_config.authority = ctx.accounts.authority.key();
    rewards_pool_config.token_mint = ctx.accounts.token_mint.key();
    rewards_pool_config.rewards_vault = ctx.accounts.rewards_vault.key();
    rewards_pool_config.total_rewards_distributed = 0;
    rewards_pool_config.staking_allocation_bps = staking_allocation_bps;
    rewards_pool_config.spin_allocation_bps = spin_allocation_bps;
    rewards_pool_config.referral_allocation_bps = referral_allocation_bps;
    rewards_pool_config.emergency_reserve_bps = emergency_reserve_bps;
    rewards_pool_config.last_distribution_timestamp = 0;
    rewards_pool_config.distribution_frequency_seconds = distribution_frequency_seconds;
    
    // Initialize staking sub-pool
    let staking_sub_pool = &mut ctx.accounts.staking_sub_pool;
    staking_sub_pool.pool_type = 1; // Staking
    staking_sub_pool.token_account = ctx.accounts.staking_token_account.key();
    staking_sub_pool.allocation_bps = staking_allocation_bps;
    staking_sub_pool.total_received = 0;
    staking_sub_pool.total_distributed = 0;
    
    // Initialize spin sub-pool
    let spin_sub_pool = &mut ctx.accounts.spin_sub_pool;
    spin_sub_pool.pool_type = 2; // Spin
    spin_sub_pool.token_account = ctx.accounts.spin_token_account.key();
    spin_sub_pool.allocation_bps = spin_allocation_bps;
    spin_sub_pool.total_received = 0;
    spin_sub_pool.total_distributed = 0;
    
    // Initialize referral sub-pool
    let referral_sub_pool = &mut ctx.accounts.referral_sub_pool;
    referral_sub_pool.pool_type = 3; // Referral
    referral_sub_pool.token_account = ctx.accounts.referral_token_account.key();
    referral_sub_pool.allocation_bps = referral_allocation_bps;
    referral_sub_pool.total_received = 0;
    referral_sub_pool.total_distributed = 0;
    
    // Initialize reserve sub-pool
    let reserve_sub_pool = &mut ctx.accounts.reserve_sub_pool;
    reserve_sub_pool.pool_type = 4; // Reserve
    reserve_sub_pool.token_account = ctx.accounts.reserve_token_account.key();
    reserve_sub_pool.allocation_bps = emergency_reserve_bps;
    reserve_sub_pool.total_received = 0;
    reserve_sub_pool.total_distributed = 0;
    
    Ok(())
}

pub fn distribute_rewards(ctx: Context<DistributeRewards>) -> Result<()> {
    let rewards_pool_config = &mut ctx.accounts.rewards_pool_config;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Check if it's time for distribution
    require!(
        current_time >= rewards_pool_config.last_distribution_timestamp + rewards_pool_config.distribution_frequency_seconds,
        ErrorCode::DistributionTooEarly
    );
    
    // Get current balance of the rewards vault
    let rewards_vault = &ctx.accounts.rewards_vault;
    let distributable_amount = rewards_vault.amount;
    
    // Ensure there are rewards to distribute
    require!(distributable_amount > 0, ErrorCode::NoRewardsToDistribute);
    
    // Calculate amounts for each sub-pool
    let staking_amount = calculate_allocation_amount(distributable_amount, rewards_pool_config.staking_allocation_bps);
    let spin_amount = calculate_allocation_amount(distributable_amount, rewards_pool_config.spin_allocation_bps);
    let referral_amount = calculate_allocation_amount(distributable_amount, rewards_pool_config.referral_allocation_bps);
    let reserve_amount = calculate_allocation_amount(distributable_amount, rewards_pool_config.emergency_reserve_bps);
    
    // Transfer to staking sub-pool
    if staking_amount > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.rewards_vault.to_account_info(),
                    to: ctx.accounts.staking_token_account.to_account_info(),
                    authority: ctx.accounts.rewards_pool_config.to_account_info(),
                },
                &[&[
                    b"rewards_pool".as_ref(),
                    rewards_pool_config.token_mint.as_ref(),
                    &[ctx.bumps.rewards_pool_config],
                ]],
            ),
            staking_amount,
        )?;
        
        // Update staking sub-pool stats
        let staking_sub_pool = &mut ctx.accounts.staking_sub_pool;
        staking_sub_pool.total_received = staking_sub_pool.total_received.checked_add(staking_amount).unwrap();
    }
    
    // Transfer to spin sub-pool
    if spin_amount > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.rewards_vault.to_account_info(),
                    to: ctx.accounts.spin_token_account.to_account_info(),
                    authority: ctx.accounts.rewards_pool_config.to_account_info(),
                },
                &[&[
                    b"rewards_pool".as_ref(),
                    rewards_pool_config.token_mint.as_ref(),
                    &[ctx.bumps.rewards_pool_config],
                ]],
            ),
            spin_amount,
        )?;
        
        // Update spin sub-pool stats
        let spin_sub_pool = &mut ctx.accounts.spin_sub_pool;
        spin_sub_pool.total_received = spin_sub_pool.total_received.checked_add(spin_amount).unwrap();
    }
    
    // Transfer to referral sub-pool
    if referral_amount > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.rewards_vault.to_account_info(),
                    to: ctx.accounts.referral_token_account.to_account_info(),
                    authority: ctx.accounts.rewards_pool_config.to_account_info(),
                },
                &[&[
                    b"rewards_pool".as_ref(),
                    rewards_pool_config.token_mint.as_ref(),
                    &[ctx.bumps.rewards_pool_config],
                ]],
            ),
            referral_amount,
        )?;
        
        // Update referral sub-pool stats
        let referral_sub_pool = &mut ctx.accounts.referral_sub_pool;
        referral_sub_pool.total_received = referral_sub_pool.total_received.checked_add(referral_amount).unwrap();
    }
    
    // Transfer to reserve sub-pool
    if reserve_amount > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.rewards_vault.to_account_info(),
                    to: ctx.accounts.reserve_token_account.to_account_info(),
                    authority: ctx.accounts.rewards_pool_config.to_account_info(),
                },
                &[&[
                    b"rewards_pool".as_ref(),
                    rewards_pool_config.token_mint.as_ref(),
                    &[ctx.bumps.rewards_pool_config],
                ]],
            ),
            reserve_amount,
        )?;
        
        // Update reserve sub-pool stats
        let reserve_sub_pool = &mut ctx.accounts.reserve_sub_pool;
        reserve_sub_pool.total_received = reserve_sub_pool.total_received.checked_add(reserve_amount).unwrap();
    }
    
    // Record distribution history
    let distribution_history = &mut ctx.accounts.distribution_history;
    distribution_history.timestamp = current_time;
    distribution_history.total_amount = distributable_amount;
    distribution_history.staking_amount = staking_amount;
    distribution_history.spin_amount = spin_amount;
    distribution_history.referral_amount = referral_amount;
    distribution_history.reserve_amount = reserve_amount;
    
    // Update rewards pool config
    rewards_pool_config.total_rewards_distributed = rewards_pool_config.total_rewards_distributed
        .checked_add(distributable_amount)
        .unwrap();
    rewards_pool_config.last_distribution_timestamp = current_time;
    
    Ok(())
}

pub fn update_allocation_percentages(
    ctx: Context<UpdateAllocationPercentages>,
    staking_allocation_bps: u16,
    spin_allocation_bps: u16,
    referral_allocation_bps: u16,
    emergency_reserve_bps: u16,
) -> Result<()> {
    // Validate authority
    require!(
        ctx.accounts.authority.key() == ctx.accounts.rewards_pool_config.authority,
        ErrorCode::Unauthorized
    );
    
    // Validate percentages add up to 100%
    require!(
        staking_allocation_bps + spin_allocation_bps + referral_allocation_bps + emergency_reserve_bps == 10000,
        ErrorCode::InvalidAllocationPercentages
    );
    
    // Update rewards pool config
    let rewards_pool_config = &mut ctx.accounts.rewards_pool_config;
    rewards_pool_config.staking_allocation_bps = staking_allocation_bps;
    rewards_pool_config.spin_allocation_bps = spin_allocation_bps;
    rewards_pool_config.referral_allocation_bps = referral_allocation_bps;
    rewards_pool_config.emergency_reserve_bps = emergency_reserve_bps;
    
    // Update sub-pools
    let staking_sub_pool = &mut ctx.accounts.staking_sub_pool;
    staking_sub_pool.allocation_bps = staking_allocation_bps;
    
    let spin_sub_pool = &mut ctx.accounts.spin_sub_pool;
    spin_sub_pool.allocation_bps = spin_allocation_bps;
    
    let referral_sub_pool = &mut ctx.accounts.referral_sub_pool;
    referral_sub_pool.allocation_bps = referral_allocation_bps;
    
    let reserve_sub_pool = &mut ctx.accounts.reserve_sub_pool;
    reserve_sub_pool.allocation_bps = emergency_reserve_bps;
    
    Ok(())
}

pub fn emergency_withdraw(
    ctx: Context<EmergencyWithdraw>,
    amount: u64,
) -> Result<()> {
    // Validate authority
    require!(
        ctx.accounts.authority.key() == ctx.accounts.rewards_pool_config.authority,
        ErrorCode::Unauthorized
    );
    
    // Validate amount
    require!(amount > 0, ErrorCode::InvalidAmount);
    require!(amount <= ctx.accounts.reserve_token_account.amount, ErrorCode::InsufficientFunds);
    
    // Transfer from reserve to destination
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.reserve_token_account.to_account_info(),
                to: ctx.accounts.destination_token_account.to_account_info(),
                authority: ctx.accounts.rewards_pool_config.to_account_info(),
            },
            &[&[
                b"rewards_pool".as_ref(),
                ctx.accounts.rewards_pool_config.token_mint.as_ref(),
                &[ctx.bumps.rewards_pool_config],
            ]],
        ),
        amount,
    )?;
    
    // Update reserve sub-pool stats
    let reserve_sub_pool = &mut ctx.accounts.reserve_sub_pool;
    reserve_sub_pool.total_distributed = reserve_sub_pool.total_distributed.checked_add(amount).unwrap();
    
    Ok(())
}

// Helper function to calculate allocation amount based on percentage
fn calculate_allocation_amount(total_amount: u64, allocation_bps: u16) -> u64 {
    ((total_amount as u128) * (allocation_bps as u128) / 10000) as u64
}

#[derive(Accounts)]
pub struct InitializeRewardsPool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + RewardsPoolConfig::LEN,
        seeds = [b"rewards_pool".as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub rewards_pool_config: Account<'info, RewardsPoolConfig>,
    
    #[account(
        mut,
        token::mint = token_mint,
        token::authority = rewards_pool_config,
    )]
    pub rewards_vault: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = rewards_pool_config,
    )]
    pub staking_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = rewards_pool_config,
    )]
    pub spin_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = rewards_pool_config,
    )]
    pub referral_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = rewards_pool_config,
    )]
    pub reserve_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + SubPool::LEN,
        seeds = [b"staking_sub_pool".as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub staking_sub_pool: Account<'info, SubPool>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + SubPool::LEN,
        seeds = [b"spin_sub_pool".as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub spin_sub_pool: Account<'info, SubPool>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + SubPool::LEN,
        seeds = [b"referral_sub_pool".as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub referral_sub_pool: Account<'info, SubPool>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + SubPool::LEN,
        seeds = [b"reserve_sub_pool".as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub reserve_sub_pool: Account<'info, SubPool>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct DistributeRewards<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"rewards_pool".as_ref(), rewards_pool_config.token_mint.as_ref()],
        bump
    )]
    pub rewards_pool_config: Account<'info, RewardsPoolConfig>,
    
    #[account(
        mut,
        token::mint = rewards_pool_config.token_mint,
        token::authority = rewards_pool_config,
    )]
    pub rewards_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"staking_sub_pool".as_ref(), rewards_pool_config.token_mint.as_ref()],
        bump
    )]
    pub staking_sub_pool: Account<'info, SubPool>,
    
    #[account(
        mut,
        token::mint = rewards_pool_config.token_mint,
        token::authority = rewards_pool_config,
    )]
    pub staking_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"spin_sub_pool".as_ref(), rewards_pool_config.token_mint.as_ref()],
        bump
    )]
    pub spin_sub_pool: Account<'info, SubPool>,
    
    #[account(
        mut,
        token::mint = rewards_pool_config.token_mint,
        token::authority = rewards_pool_config,
    )]
    pub spin_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"referral_sub_pool".as_ref(), rewards_pool_config.token_mint.as_ref()],
        bump
    )]
    pub referral_sub_pool: Account<'info, SubPool>,
    
    #[account(
        mut,
        token::mint = rewards_pool_config.token_mint,
        token::authority = rewards_pool_config,
    )]
    pub referral_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"reserve_sub_pool".as_ref(), rewards_pool_config.token_mint.as_ref()],
        bump
    )]
    pub reserve_sub_pool: Account<'info, SubPool>,
    
    #[account(
        mut,
        token::mint = rewards_pool_config.token_mint,
        token::authority = rewards_pool_config,
    )]
    pub reserve_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + DistributionHistory::LEN,
        seeds = [
            b"distribution_history".as_ref(),
            rewards_pool_config.token_mint.as_ref(),
            &Clock::get()?.unix_timestamp.to_le_bytes()
        ],
        bump
    )]
    pub distribution_history: Account<'info, DistributionHistory>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateAllocationPercentages<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"rewards_pool".as_ref(), rewards_pool_config.token_mint.as_ref()],
        bump
    )]
    pub rewards_pool_config: Account<'info, RewardsPoolConfig>,
    
    #[account(
        mut,
        seeds = [b"staking_sub_pool".as_ref(), rewards_pool_config.token_mint.as_ref()],
        bump
    )]
    pub staking_sub_pool: Account<'info, SubPool>,
    
    #[account(
        mut,
        seeds = [b"spin_sub_pool".as_ref(), rewards_pool_config.token_mint.as_ref()],
        bump
    )]
    pub spin_sub_pool: Account<'info, SubPool>,
    
    #[account(
        mut,
        seeds = [b"referral_sub_pool".as_ref(), rewards_pool_config.token_mint.as_ref()],
        bump
    )]
    pub referral_sub_pool: Account<'info, SubPool>,
    
    #[account(
        mut,
        seeds = [b"reserve_sub_pool".as_ref(), rewards_pool_config.token_mint.as_ref()],
        bump
    )]
    pub reserve_sub_pool: Account<'info, SubPool>,
}

#[derive(Accounts)]
pub struct EmergencyWithdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        seeds = [b"rewards_pool".as_ref(), rewards_pool_config.token_mint.as_ref()],
        bump
    )]
    pub rewards_pool_config: Account<'info, RewardsPoolConfig>,
    
    #[account(
        mut,
        seeds = [b"reserve_sub_pool".as_ref(), rewards_pool_config.token_mint.as_ref()],
        bump
    )]
    pub reserve_sub_pool: Account<'info, SubPool>,
    
    #[account(
        mut,
        token::mint = rewards_pool_config.token_mint,
        token::authority = rewards_pool_config,
    )]
    pub reserve_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = rewards_pool_config.token_mint,
    )]
    pub destination_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid allocation percentages, must add up to 100%")]
    InvalidAllocationPercentages,
    #[msg("Invalid distribution frequency")]
    InvalidDistributionFrequency,
    #[msg("Distribution attempted too early")]
    DistributionTooEarly,
    #[msg("No rewards to distribute")]
    NoRewardsToDistribute,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient funds")]
    InsufficientFunds,
}
