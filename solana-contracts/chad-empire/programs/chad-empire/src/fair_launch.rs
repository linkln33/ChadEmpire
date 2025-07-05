use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use solana_program::{program::invoke, system_instruction};
use std::convert::TryInto;

#[account]
pub struct FairLaunchConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub sol_vault: Pubkey,
    pub token_vault: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub total_sol_raised: u64,
    pub total_tokens_allocated: u64,
    pub liquidity_created: bool,
    pub investment_days: u8,
    pub referral_bonus_bps: u16, // Basis points for referral bonus (e.g., 1000 = 10%)
}

impl FairLaunchConfig {
    pub const LEN: usize = 32 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 1 + 1 + 2;
}

#[account]
pub struct InvestorInfo {
    pub investor: Pubkey,
    pub total_sol_invested: u64,
    pub total_tokens_allocated: u64,
    pub claimed: bool,
    pub referrer: Pubkey, // Address of the referrer, if any
}

impl InvestorInfo {
    pub const LEN: usize = 32 + 8 + 8 + 1 + 32;
}

#[account]
pub struct DailyStats {
    pub day: u8,
    pub total_sol_invested: u64,
    pub total_tokens_allocated: u64,
    pub min_supply: u64,
    pub max_supply: u64,
    pub actual_supply: u64,
    pub supply_generated: bool,
}

impl DailyStats {
    pub const LEN: usize = 1 + 8 + 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct ReferralInfo {
    pub referrer: Pubkey,
    pub total_sol_referred: u64,
    pub total_bonus_tokens: u64,
    pub claimed: bool,
}

impl ReferralInfo {
    pub const LEN: usize = 32 + 8 + 8 + 1;
}

pub fn initialize_fair_launch(
    ctx: Context<InitializeFairLaunch>,
    start_time: i64,
    investment_days: u8,
    referral_bonus_bps: u16,
) -> Result<()> {
    require!(investment_days > 0 && investment_days <= 7, ErrorCode::InvalidInvestmentDays);
    require!(referral_bonus_bps <= 1000, ErrorCode::ReferralBonusTooHigh); // Max 10% referral bonus

    let fair_launch_config = &mut ctx.accounts.fair_launch_config;
    fair_launch_config.authority = ctx.accounts.authority.key();
    fair_launch_config.token_mint = ctx.accounts.token_mint.key();
    fair_launch_config.sol_vault = ctx.accounts.sol_vault.key();
    fair_launch_config.token_vault = ctx.accounts.token_vault.key();
    fair_launch_config.start_time = start_time;
    fair_launch_config.end_time = start_time + (investment_days as i64 * 86400); // days in seconds
    fair_launch_config.total_sol_raised = 0;
    fair_launch_config.total_tokens_allocated = 0;
    fair_launch_config.liquidity_created = false;
    fair_launch_config.investment_days = investment_days;
    fair_launch_config.referral_bonus_bps = referral_bonus_bps;

    // Initialize daily stats for each investment day
    for day in 1..=investment_days {
        let seeds = &[
            b"daily_stats".as_ref(),
            &[day],
            ctx.accounts.fair_launch_config.key().as_ref(),
            &[ctx.bumps.daily_stats],
        ];
        let signer = &[&seeds[..]];

        let daily_stats = &mut ctx.accounts.daily_stats;
        daily_stats.day = day;
        daily_stats.total_sol_invested = 0;
        daily_stats.total_tokens_allocated = 0;
        daily_stats.min_supply = 5_000_000; // 5 million tokens minimum per day
        daily_stats.max_supply = 10_000_000; // 10 million tokens maximum per day
        daily_stats.actual_supply = 0;
        daily_stats.supply_generated = false;
    }

    Ok(())
}

pub fn contribute(
    ctx: Context<Contribute>,
    amount: u64,
    day: u8,
    referrer: Option<Pubkey>,
) -> Result<()> {
    let fair_launch_config = &mut ctx.accounts.fair_launch_config;
    let daily_stats = &mut ctx.accounts.daily_stats;
    let investor_info = &mut ctx.accounts.investor_info;
    
    // Check if fair launch is active
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        current_time >= fair_launch_config.start_time && 
        current_time <= fair_launch_config.end_time,
        ErrorCode::FairLaunchNotActive
    );
    
    // Check if the selected day is valid
    require!(
        day > 0 && day <= fair_launch_config.investment_days,
        ErrorCode::InvalidInvestmentDay
    );
    
    // Check if the selected day is still available
    let day_start = fair_launch_config.start_time + ((day - 1) as i64 * 86400);
    require!(current_time <= day_start + 86400, ErrorCode::DayAlreadyPassed);
    
    // Check minimum contribution
    require!(amount >= 50_000_000, ErrorCode::ContributionTooSmall); // 0.05 SOL minimum
    
    // Transfer SOL to the vault
    invoke(
        &system_instruction::transfer(
            ctx.accounts.investor.key,
            ctx.accounts.sol_vault.key,
            amount,
        ),
        &[
            ctx.accounts.investor.to_account_info(),
            ctx.accounts.sol_vault.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;
    
    // Update investor info
    if investor_info.investor == Pubkey::default() {
        investor_info.investor = ctx.accounts.investor.key();
    }
    investor_info.total_sol_invested = investor_info.total_sol_invested.checked_add(amount).unwrap();
    investor_info.claimed = false;
    
    // Set referrer if provided and valid
    if let Some(ref_pubkey) = referrer {
        if ref_pubkey != ctx.accounts.investor.key() && ref_pubkey != Pubkey::default() {
            investor_info.referrer = ref_pubkey;
            
            // Update referral info if it exists
            if let Some(referral_info) = &mut ctx.accounts.referral_info {
                if referral_info.referrer == Pubkey::default() {
                    referral_info.referrer = ref_pubkey;
                }
                referral_info.total_sol_referred = referral_info
                    .total_sol_referred
                    .checked_add(amount)
                    .unwrap();
            }
        }
    }
    
    // Update daily stats
    daily_stats.total_sol_invested = daily_stats.total_sol_invested.checked_add(amount).unwrap();
    
    // Update fair launch config
    fair_launch_config.total_sol_raised = fair_launch_config.total_sol_raised.checked_add(amount).unwrap();
    
    Ok(())
}

pub fn generate_daily_supply(ctx: Context<GenerateDailySupply>, day: u8) -> Result<()> {
    let fair_launch_config = &ctx.accounts.fair_launch_config;
    let daily_stats = &mut ctx.accounts.daily_stats;
    
    // Check if the day is valid
    require!(
        day > 0 && day <= fair_launch_config.investment_days,
        ErrorCode::InvalidInvestmentDay
    );
    
    // Check if the day has passed
    let current_time = Clock::get()?.unix_timestamp;
    let day_end = fair_launch_config.start_time + (day as i64 * 86400);
    require!(current_time > day_end, ErrorCode::DayNotYetEnded);
    
    // Check if supply has already been generated
    require!(!daily_stats.supply_generated, ErrorCode::SupplyAlreadyGenerated);
    
    // Check if there were any investments for this day
    require!(daily_stats.total_sol_invested > 0, ErrorCode::NoInvestmentsForDay);
    
    // Generate random supply between min and max
    // In a real implementation, we would use a VRF (Verifiable Random Function)
    // For simplicity, we'll use a deterministic approach based on the block hash
    let recent_blockhash = ctx.accounts.recent_blockhashes.to_account_info().key();
    let seed = &[
        b"supply_generation".as_ref(),
        &[day],
        recent_blockhash.as_ref(),
    ];
    let (_, bump) = Pubkey::find_program_address(seed, ctx.program_id);
    
    // Use the bump as a source of randomness (not secure for production)
    let range = daily_stats.max_supply - daily_stats.min_supply;
    let random_value = (bump as u64) % range;
    let actual_supply = daily_stats.min_supply + random_value;
    
    daily_stats.actual_supply = actual_supply;
    daily_stats.supply_generated = true;
    
    // Calculate token allocation based on SOL invested
    if daily_stats.total_sol_invested > 0 {
        let tokens_per_sol = actual_supply
            .checked_mul(1_000_000_000) // Scale for precision
            .unwrap()
            .checked_div(daily_stats.total_sol_invested)
            .unwrap();
        
        daily_stats.total_tokens_allocated = actual_supply;
    }
    
    Ok(())
}

pub fn create_liquidity(ctx: Context<CreateLiquidity>) -> Result<()> {
    let fair_launch_config = &mut ctx.accounts.fair_launch_config;
    
    // Check if fair launch has ended
    let current_time = Clock::get()?.unix_timestamp;
    require!(current_time > fair_launch_config.end_time, ErrorCode::FairLaunchNotEnded);
    
    // Check if liquidity has already been created
    require!(!fair_launch_config.liquidity_created, ErrorCode::LiquidityAlreadyCreated);
    
    // Check if all daily supplies have been generated
    // In a real implementation, we would check each day's stats
    
    // Calculate token amount for liquidity (30% of total supply)
    let total_tokens_for_liquidity = 300_000_000 * 10u64.pow(9); // 300M tokens with 9 decimals
    
    // Calculate SOL amount for liquidity (90% of raised SOL)
    let sol_for_liquidity = fair_launch_config
        .total_sol_raised
        .checked_mul(90)
        .unwrap()
        .checked_div(100)
        .unwrap();
    
    // In a real implementation, we would:
    // 1. Transfer tokens to the AMM (Raydium)
    // 2. Transfer SOL to the AMM
    // 3. Create the liquidity pool
    
    // For now, we'll just mark liquidity as created
    fair_launch_config.liquidity_created = true;
    
    Ok(())
}

pub fn claim_tokens(ctx: Context<ClaimTokens>) -> Result<()> {
    let fair_launch_config = &ctx.accounts.fair_launch_config;
    let investor_info = &mut ctx.accounts.investor_info;
    
    // Check if fair launch has ended and liquidity has been created
    require!(fair_launch_config.liquidity_created, ErrorCode::LiquidityNotCreatedYet);
    
    // Check if investor has already claimed
    require!(!investor_info.claimed, ErrorCode::AlreadyClaimed);
    
    // Calculate tokens to claim based on SOL invested and daily allocations
    // In a real implementation, we would sum up allocations across all days
    
    // For simplicity, we'll use a fixed ratio
    let tokens_to_claim = investor_info
        .total_sol_invested
        .checked_mul(fair_launch_config.total_tokens_allocated)
        .unwrap()
        .checked_div(fair_launch_config.total_sol_raised)
        .unwrap();
    
    // Transfer tokens to investor
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.token_vault.to_account_info(),
                to: ctx.accounts.investor_token_account.to_account_info(),
                authority: ctx.accounts.fair_launch_config.to_account_info(),
            },
            &[&[
                b"fair_launch".as_ref(),
                fair_launch_config.token_mint.as_ref(),
                &[ctx.bumps.fair_launch_config],
            ]],
        ),
        tokens_to_claim,
    )?;
    
    // Mark as claimed
    investor_info.claimed = true;
    
    Ok(())
}

pub fn claim_referral_bonus(ctx: Context<ClaimReferralBonus>) -> Result<()> {
    let fair_launch_config = &ctx.accounts.fair_launch_config;
    let referral_info = &mut ctx.accounts.referral_info;
    
    // Check if fair launch has ended and liquidity has been created
    require!(fair_launch_config.liquidity_created, ErrorCode::LiquidityNotCreatedYet);
    
    // Check if referrer has already claimed
    require!(!referral_info.claimed, ErrorCode::AlreadyClaimed);
    
    // Calculate bonus tokens based on referred SOL
    let bonus_tokens = referral_info
        .total_sol_referred
        .checked_mul(fair_launch_config.referral_bonus_bps as u64)
        .unwrap()
        .checked_div(10000)
        .unwrap()
        .checked_mul(10u64.pow(9)) // Add decimals
        .unwrap();
    
    // Transfer bonus tokens to referrer
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.token_vault.to_account_info(),
                to: ctx.accounts.referrer_token_account.to_account_info(),
                authority: ctx.accounts.fair_launch_config.to_account_info(),
            },
            &[&[
                b"fair_launch".as_ref(),
                fair_launch_config.token_mint.as_ref(),
                &[ctx.bumps.fair_launch_config],
            ]],
        ),
        bonus_tokens,
    )?;
    
    // Mark as claimed
    referral_info.claimed = true;
    referral_info.total_bonus_tokens = bonus_tokens;
    
    Ok(())
}

#[derive(Accounts)]
#[instruction(start_time: i64, investment_days: u8, referral_bonus_bps: u16)]
pub struct InitializeFairLaunch<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + FairLaunchConfig::LEN,
        seeds = [b"fair_launch".as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub fair_launch_config: Account<'info, FairLaunchConfig>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + DailyStats::LEN,
        seeds = [b"daily_stats".as_ref(), &[1u8], fair_launch_config.key().as_ref()],
        bump
    )]
    pub daily_stats: Account<'info, DailyStats>,
    
    /// CHECK: This is a PDA that will hold SOL
    #[account(
        seeds = [b"sol_vault".as_ref(), fair_launch_config.key().as_ref()],
        bump
    )]
    pub sol_vault: UncheckedAccount<'info>,
    
    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = fair_launch_config,
    )]
    pub token_vault: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(amount: u64, day: u8, referrer: Option<Pubkey>)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub investor: Signer<'info>,
    
    #[account(mut)]
    pub fair_launch_config: Account<'info, FairLaunchConfig>,
    
    #[account(
        mut,
        seeds = [b"daily_stats".as_ref(), &[day], fair_launch_config.key().as_ref()],
        bump
    )]
    pub daily_stats: Account<'info, DailyStats>,
    
    #[account(
        init_if_needed,
        payer = investor,
        space = 8 + InvestorInfo::LEN,
        seeds = [b"investor".as_ref(), investor.key().as_ref(), fair_launch_config.key().as_ref()],
        bump
    )]
    pub investor_info: Account<'info, InvestorInfo>,
    
    #[account(
        init_if_needed,
        payer = investor,
        space = 8 + ReferralInfo::LEN,
        seeds = [b"referral".as_ref(), referrer.unwrap_or_default().as_ref(), fair_launch_config.key().as_ref()],
        bump
    )]
    pub referral_info: Option<Account<'info, ReferralInfo>>,
    
    /// CHECK: This is a PDA that will hold SOL
    #[account(
        mut,
        seeds = [b"sol_vault".as_ref(), fair_launch_config.key().as_ref()],
        bump
    )]
    pub sol_vault: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(day: u8)]
pub struct GenerateDailySupply<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub fair_launch_config: Account<'info, FairLaunchConfig>,
    
    #[account(
        mut,
        seeds = [b"daily_stats".as_ref(), &[day], fair_launch_config.key().as_ref()],
        bump
    )]
    pub daily_stats: Account<'info, DailyStats>,
    
    /// CHECK: Used for randomness
    pub recent_blockhashes: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct CreateLiquidity<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        constraint = authority.key() == fair_launch_config.authority
    )]
    pub fair_launch_config: Account<'info, FairLaunchConfig>,
    
    /// CHECK: This is a PDA that holds SOL
    #[account(
        mut,
        seeds = [b"sol_vault".as_ref(), fair_launch_config.key().as_ref()],
        bump
    )]
    pub sol_vault: UncheckedAccount<'info>,
    
    #[account(
        mut,
        constraint = token_vault.owner == fair_launch_config.key()
    )]
    pub token_vault: Account<'info, TokenAccount>,
    
    /// CHECK: This would be the Raydium AMM program in a real implementation
    pub amm_program: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimTokens<'info> {
    #[account(mut)]
    pub investor: Signer<'info>,
    
    #[account(
        seeds = [b"fair_launch".as_ref(), fair_launch_config.token_mint.as_ref()],
        bump
    )]
    pub fair_launch_config: Account<'info, FairLaunchConfig>,
    
    #[account(
        mut,
        seeds = [b"investor".as_ref(), investor.key().as_ref(), fair_launch_config.key().as_ref()],
        bump,
        constraint = investor_info.investor == investor.key()
    )]
    pub investor_info: Account<'info, InvestorInfo>,
    
    #[account(
        mut,
        constraint = token_vault.owner == fair_launch_config.key()
    )]
    pub token_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = investor_token_account.owner == investor.key()
    )]
    pub investor_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimReferralBonus<'info> {
    #[account(mut)]
    pub referrer: Signer<'info>,
    
    #[account(
        seeds = [b"fair_launch".as_ref(), fair_launch_config.token_mint.as_ref()],
        bump
    )]
    pub fair_launch_config: Account<'info, FairLaunchConfig>,
    
    #[account(
        mut,
        seeds = [b"referral".as_ref(), referrer.key().as_ref(), fair_launch_config.key().as_ref()],
        bump,
        constraint = referral_info.referrer == referrer.key()
    )]
    pub referral_info: Account<'info, ReferralInfo>,
    
    #[account(
        mut,
        constraint = token_vault.owner == fair_launch_config.key()
    )]
    pub token_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = referrer_token_account.owner == referrer.key()
    )]
    pub referrer_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid investment days")]
    InvalidInvestmentDays,
    #[msg("Referral bonus too high")]
    ReferralBonusTooHigh,
    #[msg("Fair launch not active")]
    FairLaunchNotActive,
    #[msg("Invalid investment day")]
    InvalidInvestmentDay,
    #[msg("Day has already passed")]
    DayAlreadyPassed,
    #[msg("Contribution too small")]
    ContributionTooSmall,
    #[msg("Day not yet ended")]
    DayNotYetEnded,
    #[msg("Supply already generated")]
    SupplyAlreadyGenerated,
    #[msg("No investments for this day")]
    NoInvestmentsForDay,
    #[msg("Fair launch not ended")]
    FairLaunchNotEnded,
    #[msg("Liquidity already created")]
    LiquidityAlreadyCreated,
    #[msg("Liquidity not created yet")]
    LiquidityNotCreatedYet,
    #[msg("Already claimed")]
    AlreadyClaimed,
}
