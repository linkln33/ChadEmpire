use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use solana_program::{program::invoke, system_instruction};
use std::convert::TryInto;

#[account]
pub struct VestingConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub vesting_vault: Pubkey,
    pub total_allocation: u64,
    pub tge_release_bps: u16,     // Percentage of tokens released at TGE in basis points (e.g., 500 = 5%)
    pub vesting_start_timestamp: i64,
    pub vesting_duration_seconds: i64,
    pub cliff_seconds: i64,       // Cliff period in seconds
    pub total_claimed: u64,
}

impl VestingConfig {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 2 + 8 + 8 + 8 + 8;
}

#[account]
pub struct VestingRecipient {
    pub recipient: Pubkey,
    pub allocation_amount: u64,
    pub claimed_amount: u64,
    pub last_claim_timestamp: i64,
}

impl VestingRecipient {
    pub const LEN: usize = 32 + 8 + 8 + 8;
}

pub fn initialize_vesting(
    ctx: Context<InitializeVesting>,
    total_allocation: u64,
    tge_release_bps: u16,
    vesting_start_timestamp: i64,
    vesting_duration_seconds: i64,
    cliff_seconds: i64,
) -> Result<()> {
    // Validate parameters
    require!(total_allocation > 0, ErrorCode::InvalidAllocation);
    require!(tge_release_bps <= 10000, ErrorCode::InvalidReleasePercentage);
    require!(vesting_duration_seconds > 0, ErrorCode::InvalidVestingDuration);
    require!(cliff_seconds >= 0, ErrorCode::InvalidCliffDuration);
    
    let vesting_config = &mut ctx.accounts.vesting_config;
    vesting_config.authority = ctx.accounts.authority.key();
    vesting_config.token_mint = ctx.accounts.token_mint.key();
    vesting_config.vesting_vault = ctx.accounts.vesting_vault.key();
    vesting_config.total_allocation = total_allocation;
    vesting_config.tge_release_bps = tge_release_bps;
    vesting_config.vesting_start_timestamp = vesting_start_timestamp;
    vesting_config.vesting_duration_seconds = vesting_duration_seconds;
    vesting_config.cliff_seconds = cliff_seconds;
    vesting_config.total_claimed = 0;
    
    // Transfer tokens to vesting vault
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.authority_token_account.to_account_info(),
                to: ctx.accounts.vesting_vault.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        total_allocation,
    )?;
    
    Ok(())
}

pub fn add_recipient(
    ctx: Context<AddRecipient>,
    allocation_amount: u64,
) -> Result<()> {
    // Validate authority
    require!(
        ctx.accounts.authority.key() == ctx.accounts.vesting_config.authority,
        ErrorCode::Unauthorized
    );
    
    // Validate allocation
    require!(allocation_amount > 0, ErrorCode::InvalidAllocation);
    
    // Initialize recipient
    let vesting_recipient = &mut ctx.accounts.vesting_recipient;
    vesting_recipient.recipient = ctx.accounts.recipient.key();
    vesting_recipient.allocation_amount = allocation_amount;
    vesting_recipient.claimed_amount = 0;
    vesting_recipient.last_claim_timestamp = 0;
    
    Ok(())
}

pub fn claim_vested_tokens(ctx: Context<ClaimVestedTokens>) -> Result<()> {
    let vesting_config = &ctx.accounts.vesting_config;
    let vesting_recipient = &mut ctx.accounts.vesting_recipient;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Calculate claimable amount
    let claimable_amount = calculate_claimable_amount(
        vesting_recipient.allocation_amount,
        vesting_recipient.claimed_amount,
        vesting_config.tge_release_bps,
        vesting_config.vesting_start_timestamp,
        vesting_config.vesting_duration_seconds,
        vesting_config.cliff_seconds,
        current_time,
    )?;
    
    // Check if there are tokens to claim
    require!(claimable_amount > 0, ErrorCode::NoTokensToClaim);
    
    // Transfer tokens from vesting vault to recipient
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vesting_vault.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: ctx.accounts.vesting_config.to_account_info(),
            },
            &[&[
                b"vesting".as_ref(),
                vesting_config.token_mint.as_ref(),
                &[ctx.bumps.vesting_config],
            ]],
        ),
        claimable_amount,
    )?;
    
    // Update recipient info
    vesting_recipient.claimed_amount = vesting_recipient.claimed_amount.checked_add(claimable_amount).unwrap();
    vesting_recipient.last_claim_timestamp = current_time;
    
    // Update total claimed in config
    let mut mutable_config = ctx.accounts.vesting_config.to_account_info();
    let vesting_config = &mut AccountLoader::<VestingConfig>::try_from(&mutable_config)?.load_mut()?;
    vesting_config.total_claimed = vesting_config.total_claimed.checked_add(claimable_amount).unwrap();
    
    Ok(())
}

pub fn update_vesting_schedule(
    ctx: Context<UpdateVestingSchedule>,
    vesting_start_timestamp: Option<i64>,
    vesting_duration_seconds: Option<i64>,
    cliff_seconds: Option<i64>,
) -> Result<()> {
    require!(
        ctx.accounts.authority.key() == ctx.accounts.vesting_config.authority,
        ErrorCode::Unauthorized
    );
    
    let vesting_config = &mut ctx.accounts.vesting_config;
    
    // Update only the provided parameters
    if let Some(value) = vesting_start_timestamp {
        vesting_config.vesting_start_timestamp = value;
    }
    
    if let Some(value) = vesting_duration_seconds {
        require!(value > 0, ErrorCode::InvalidVestingDuration);
        vesting_config.vesting_duration_seconds = value;
    }
    
    if let Some(value) = cliff_seconds {
        require!(value >= 0, ErrorCode::InvalidCliffDuration);
        vesting_config.cliff_seconds = value;
    }
    
    Ok(())
}

// Helper function to calculate claimable amount
fn calculate_claimable_amount(
    allocation_amount: u64,
    claimed_amount: u64,
    tge_release_bps: u16,
    vesting_start_timestamp: i64,
    vesting_duration_seconds: i64,
    cliff_seconds: i64,
    current_timestamp: i64,
) -> Result<u64> {
    // If nothing allocated, nothing to claim
    if allocation_amount == 0 {
        return Ok(0);
    }
    
    // Calculate TGE release amount
    let tge_release_amount = (allocation_amount as u128)
        .checked_mul(tge_release_bps as u128)
        .unwrap()
        .checked_div(10000)
        .unwrap() as u64;
    
    // Amount subject to vesting schedule
    let vesting_amount = allocation_amount.checked_sub(tge_release_amount).unwrap();
    
    // Check if vesting has started
    if current_timestamp < vesting_start_timestamp {
        // Only TGE release is available before vesting starts
        let available = tge_release_amount;
        let remaining = available.checked_sub(claimed_amount).unwrap_or(0);
        return Ok(remaining);
    }
    
    // Check if cliff period has passed
    let cliff_end = vesting_start_timestamp.checked_add(cliff_seconds).unwrap();
    if current_timestamp < cliff_end {
        // Only TGE release is available during cliff period
        let available = tge_release_amount;
        let remaining = available.checked_sub(claimed_amount).unwrap_or(0);
        return Ok(remaining);
    }
    
    // Calculate vested percentage based on time elapsed since vesting start
    let time_elapsed = current_timestamp.checked_sub(vesting_start_timestamp).unwrap();
    let vesting_percentage = if time_elapsed >= vesting_duration_seconds {
        // Fully vested
        10000 // 100% in basis points
    } else {
        // Partially vested
        (time_elapsed as u128)
            .checked_mul(10000)
            .unwrap()
            .checked_div(vesting_duration_seconds as u128)
            .unwrap() as u16
    };
    
    // Calculate vested amount
    let vested_amount = (vesting_amount as u128)
        .checked_mul(vesting_percentage as u128)
        .unwrap()
        .checked_div(10000)
        .unwrap() as u64;
    
    // Total available is TGE release plus vested amount
    let total_available = tge_release_amount.checked_add(vested_amount).unwrap();
    
    // Subtract already claimed amount
    let claimable = total_available.checked_sub(claimed_amount).unwrap_or(0);
    
    Ok(claimable)
}

#[derive(Accounts)]
pub struct InitializeVesting<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + VestingConfig::LEN,
        seeds = [b"vesting".as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub vesting_config: Account<'info, VestingConfig>,
    
    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = vesting_config,
    )]
    pub vesting_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = token_mint,
        token::authority = authority,
    )]
    pub authority_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct AddRecipient<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub vesting_config: Account<'info, VestingConfig>,
    
    /// CHECK: This is the recipient's public key
    pub recipient: UncheckedAccount<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + VestingRecipient::LEN,
        seeds = [b"vesting_recipient".as_ref(), recipient.key().as_ref(), vesting_config.key().as_ref()],
        bump
    )]
    pub vesting_recipient: Account<'info, VestingRecipient>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimVestedTokens<'info> {
    #[account(mut)]
    pub recipient: Signer<'info>,
    
    #[account(
        seeds = [b"vesting".as_ref(), vesting_config.token_mint.as_ref()],
        bump
    )]
    pub vesting_config: Account<'info, VestingConfig>,
    
    #[account(
        mut,
        seeds = [b"vesting_recipient".as_ref(), recipient.key().as_ref(), vesting_config.key().as_ref()],
        bump,
        constraint = vesting_recipient.recipient == recipient.key()
    )]
    pub vesting_recipient: Account<'info, VestingRecipient>,
    
    #[account(
        mut,
        token::mint = vesting_config.token_mint,
        token::authority = vesting_config,
    )]
    pub vesting_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        token::mint = vesting_config.token_mint,
        token::authority = recipient,
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateVestingSchedule<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"vesting".as_ref(), vesting_config.token_mint.as_ref()],
        bump
    )]
    pub vesting_config: Account<'info, VestingConfig>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid allocation amount")]
    InvalidAllocation,
    #[msg("Invalid release percentage")]
    InvalidReleasePercentage,
    #[msg("Invalid vesting duration")]
    InvalidVestingDuration,
    #[msg("Invalid cliff duration")]
    InvalidCliffDuration,
    #[msg("No tokens to claim")]
    NoTokensToClaim,
    #[msg("Unauthorized")]
    Unauthorized,
}
