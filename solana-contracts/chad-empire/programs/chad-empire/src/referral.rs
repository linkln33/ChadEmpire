use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use solana_program::{program::invoke, system_instruction};
use std::convert::TryInto;

#[account]
pub struct ReferralConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub rewards_pool: Pubkey,
    pub standard_commission_bps: u16,     // Standard commission in basis points (e.g., 500 = 5%)
    pub super_affiliate_threshold: u64,   // SOL amount to qualify as super affiliate
    pub super_affiliate_commission_bps: u16, // Super affiliate commission in basis points (e.g., 1000 = 10%)
    pub total_referrers: u32,
    pub total_referred_users: u32,
    pub total_commissions_paid: u64,
}

impl ReferralConfig {
    pub const LEN: usize = 32 + 32 + 32 + 2 + 8 + 2 + 4 + 4 + 8;
}

#[account]
pub struct ReferrerInfo {
    pub referrer: Pubkey,
    pub total_referred_users: u32,
    pub total_referred_sol: u64,
    pub total_commissions_earned: u64,
    pub is_super_affiliate: bool,
    pub referred_users: Vec<Pubkey>, // Limited to a reasonable number in initialize function
}

impl ReferrerInfo {
    pub fn space(max_referred_users: usize) -> usize {
        8 + // discriminator
        32 + // referrer
        4 + // total_referred_users
        8 + // total_referred_sol
        8 + // total_commissions_earned
        1 + // is_super_affiliate
        4 + // vec length
        (32 * max_referred_users) // referred_users
    }
}

#[account]
pub struct ReferredUserInfo {
    pub user: Pubkey,
    pub referrer: Pubkey,
    pub total_sol_contributed: u64,
    pub registration_timestamp: i64,
}

impl ReferredUserInfo {
    pub const LEN: usize = 32 + 32 + 8 + 8;
}

pub fn initialize_referral_system(
    ctx: Context<InitializeReferralSystem>,
    standard_commission_bps: u16,
    super_affiliate_threshold: u64,
    super_affiliate_commission_bps: u16,
) -> Result<()> {
    // Validate parameters
    require!(standard_commission_bps <= 1000, ErrorCode::CommissionTooHigh); // Max 10%
    require!(super_affiliate_commission_bps <= 2000, ErrorCode::CommissionTooHigh); // Max 20%
    require!(super_affiliate_threshold > 0, ErrorCode::InvalidThreshold);
    
    let referral_config = &mut ctx.accounts.referral_config;
    referral_config.authority = ctx.accounts.authority.key();
    referral_config.token_mint = ctx.accounts.token_mint.key();
    referral_config.rewards_pool = ctx.accounts.rewards_pool.key();
    referral_config.standard_commission_bps = standard_commission_bps;
    referral_config.super_affiliate_threshold = super_affiliate_threshold;
    referral_config.super_affiliate_commission_bps = super_affiliate_commission_bps;
    referral_config.total_referrers = 0;
    referral_config.total_referred_users = 0;
    referral_config.total_commissions_paid = 0;
    
    Ok(())
}

pub fn register_referral(
    ctx: Context<RegisterReferral>,
    referrer_code: Pubkey,
) -> Result<()> {
    // Validate referrer code
    require!(referrer_code != ctx.accounts.user.key(), ErrorCode::CannotReferSelf);
    require!(referrer_code != Pubkey::default(), ErrorCode::InvalidReferrerCode);
    
    let referral_config = &mut ctx.accounts.referral_config;
    let referred_user_info = &mut ctx.accounts.referred_user_info;
    let referrer_info = &mut ctx.accounts.referrer_info;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Check if user is already referred
    require!(referred_user_info.user == Pubkey::default(), ErrorCode::AlreadyReferred);
    
    // Initialize referred user info
    referred_user_info.user = ctx.accounts.user.key();
    referred_user_info.referrer = referrer_code;
    referred_user_info.total_sol_contributed = 0;
    referred_user_info.registration_timestamp = current_time;
    
    // Update or initialize referrer info
    if referrer_info.referrer == Pubkey::default() {
        referrer_info.referrer = referrer_code;
        referrer_info.total_referred_users = 1;
        referrer_info.total_referred_sol = 0;
        referrer_info.total_commissions_earned = 0;
        referrer_info.is_super_affiliate = false;
        
        // Initialize with empty vector of referred users
        referrer_info.referred_users = Vec::new();
        referrer_info.referred_users.push(ctx.accounts.user.key());
        
        // Update total referrers in config
        referral_config.total_referrers = referral_config.total_referrers.checked_add(1).unwrap();
    } else {
        // Update existing referrer info
        referrer_info.total_referred_users = referrer_info.total_referred_users.checked_add(1).unwrap();
        
        // Add user to referred users list if not already at max capacity
        if referrer_info.referred_users.len() < 100 { // Limit to prevent excessive growth
            referrer_info.referred_users.push(ctx.accounts.user.key());
        }
    }
    
    // Update total referred users in config
    referral_config.total_referred_users = referral_config.total_referred_users.checked_add(1).unwrap();
    
    Ok(())
}

pub fn record_contribution(
    ctx: Context<RecordContribution>,
    sol_amount: u64,
) -> Result<()> {
    let referral_config = &ctx.accounts.referral_config;
    let referred_user_info = &mut ctx.accounts.referred_user_info;
    let referrer_info = &mut ctx.accounts.referrer_info;
    
    // Update referred user's contribution
    referred_user_info.total_sol_contributed = referred_user_info
        .total_sol_contributed
        .checked_add(sol_amount)
        .unwrap();
    
    // Update referrer's referred SOL amount
    referrer_info.total_referred_sol = referrer_info
        .total_referred_sol
        .checked_add(sol_amount)
        .unwrap();
    
    // Check if referrer qualifies for super affiliate status
    if !referrer_info.is_super_affiliate && 
       referrer_info.total_referred_sol >= referral_config.super_affiliate_threshold {
        referrer_info.is_super_affiliate = true;
    }
    
    // Calculate commission based on referrer status
    let commission_bps = if referrer_info.is_super_affiliate {
        referral_config.super_affiliate_commission_bps
    } else {
        referral_config.standard_commission_bps
    };
    
    // Calculate commission amount
    let commission_amount = (sol_amount as u128)
        .checked_mul(commission_bps as u128)
        .unwrap()
        .checked_div(10000)
        .unwrap() as u64;
    
    // If commission is greater than zero, pay it
    if commission_amount > 0 {
        // Convert SOL commission to token equivalent
        // In a real implementation, this would use an oracle or AMM to get the exchange rate
        // For simplicity, we'll use a fixed rate of 1 SOL = 1000 tokens
        let token_commission = commission_amount.checked_mul(1000).unwrap();
        
        // Transfer tokens from rewards pool to referrer
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.rewards_pool.to_account_info(),
                    to: ctx.accounts.referrer_token_account.to_account_info(),
                    authority: ctx.accounts.referral_config.to_account_info(),
                },
                &[&[
                    b"referral_config".as_ref(),
                    referral_config.token_mint.as_ref(),
                    &[ctx.bumps.referral_config],
                ]],
            ),
            token_commission,
        )?;
        
        // Update referrer's commission earned
        referrer_info.total_commissions_earned = referrer_info
            .total_commissions_earned
            .checked_add(token_commission)
            .unwrap();
        
        // Update total commissions paid in config
        let mut mutable_config = ctx.accounts.referral_config.to_account_info();
        let referral_config = &mut AccountLoader::<ReferralConfig>::try_from(&mutable_config)?.load_mut()?;
        referral_config.total_commissions_paid = referral_config
            .total_commissions_paid
            .checked_add(token_commission)
            .unwrap();
    }
    
    Ok(())
}

pub fn update_commission_rates(
    ctx: Context<UpdateCommissionRates>,
    standard_commission_bps: Option<u16>,
    super_affiliate_commission_bps: Option<u16>,
    super_affiliate_threshold: Option<u64>,
) -> Result<()> {
    require!(
        ctx.accounts.authority.key() == ctx.accounts.referral_config.authority,
        ErrorCode::Unauthorized
    );
    
    let referral_config = &mut ctx.accounts.referral_config;
    
    // Update only the provided parameters
    if let Some(value) = standard_commission_bps {
        require!(value <= 1000, ErrorCode::CommissionTooHigh); // Max 10%
        referral_config.standard_commission_bps = value;
    }
    
    if let Some(value) = super_affiliate_commission_bps {
        require!(value <= 2000, ErrorCode::CommissionTooHigh); // Max 20%
        referral_config.super_affiliate_commission_bps = value;
    }
    
    if let Some(value) = super_affiliate_threshold {
        require!(value > 0, ErrorCode::InvalidThreshold);
        referral_config.super_affiliate_threshold = value;
    }
    
    Ok(())
}

pub fn generate_referral_code(ctx: Context<GenerateReferralCode>) -> Result<()> {
    // In Solana, we don't need to generate a special code
    // The user's public key can serve as their referral code
    
    // Initialize referrer info if it doesn't exist
    let referrer_info = &mut ctx.accounts.referrer_info;
    if referrer_info.referrer == Pubkey::default() {
        referrer_info.referrer = ctx.accounts.user.key();
        referrer_info.total_referred_users = 0;
        referrer_info.total_referred_sol = 0;
        referrer_info.total_commissions_earned = 0;
        referrer_info.is_super_affiliate = false;
        referrer_info.referred_users = Vec::new();
        
        // Update total referrers in config
        let mut mutable_config = ctx.accounts.referral_config.to_account_info();
        let referral_config = &mut AccountLoader::<ReferralConfig>::try_from(&mutable_config)?.load_mut()?;
        referral_config.total_referrers = referral_config.total_referrers.checked_add(1).unwrap();
    }
    
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeReferralSystem<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + ReferralConfig::LEN,
        seeds = [b"referral_config".as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub referral_config: Account<'info, ReferralConfig>,
    
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
pub struct RegisterReferral<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub referral_config: Account<'info, ReferralConfig>,
    
    #[account(
        init,
        payer = user,
        space = 8 + ReferredUserInfo::LEN,
        seeds = [b"referred_user".as_ref(), user.key().as_ref(), referral_config.key().as_ref()],
        bump
    )]
    pub referred_user_info: Account<'info, ReferredUserInfo>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = ReferrerInfo::space(100), // Allow up to 100 referred users
        seeds = [b"referrer".as_ref(), referrer_code.key().as_ref(), referral_config.key().as_ref()],
        bump
    )]
    pub referrer_info: Account<'info, ReferrerInfo>,
    
    /// CHECK: This is the referrer's public key
    pub referrer_code: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct RecordContribution<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        seeds = [b"referral_config".as_ref(), referral_config.token_mint.as_ref()],
        bump
    )]
    pub referral_config: Account<'info, ReferralConfig>,
    
    #[account(
        mut,
        seeds = [b"referred_user".as_ref(), user.key().as_ref(), referral_config.key().as_ref()],
        bump,
        constraint = referred_user_info.user == user.key()
    )]
    pub referred_user_info: Account<'info, ReferredUserInfo>,
    
    #[account(
        mut,
        seeds = [b"referrer".as_ref(), referred_user_info.referrer.as_ref(), referral_config.key().as_ref()],
        bump,
        constraint = referrer_info.referrer == referred_user_info.referrer
    )]
    pub referrer_info: Account<'info, ReferrerInfo>,
    
    #[account(
        mut,
        token::mint = referral_config.token_mint,
        constraint = rewards_pool.key() == referral_config.rewards_pool
    )]
    pub rewards_pool: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = referral_config.token_mint,
        token::authority = referred_user_info.referrer,
    )]
    pub referrer_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateCommissionRates<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"referral_config".as_ref(), referral_config.token_mint.as_ref()],
        bump
    )]
    pub referral_config: Account<'info, ReferralConfig>,
}

#[derive(Accounts)]
pub struct GenerateReferralCode<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub referral_config: Account<'info, ReferralConfig>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = ReferrerInfo::space(100), // Allow up to 100 referred users
        seeds = [b"referrer".as_ref(), user.key().as_ref(), referral_config.key().as_ref()],
        bump
    )]
    pub referrer_info: Account<'info, ReferrerInfo>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Commission rate too high")]
    CommissionTooHigh,
    #[msg("Invalid threshold")]
    InvalidThreshold,
    #[msg("Cannot refer yourself")]
    CannotReferSelf,
    #[msg("Invalid referrer code")]
    InvalidReferrerCode,
    #[msg("User is already referred")]
    AlreadyReferred,
    #[msg("Unauthorized")]
    Unauthorized,
}
