use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use solana_program::{program::invoke, system_instruction};
use std::convert::TryInto;

// Import all the modules
mod fair_launch;
mod staking;
mod spin_to_yield;
mod referral;
mod vesting;
mod rewards_pool;
mod governance;

// Re-export the modules
pub use fair_launch::*;
pub use staking::*;
pub use spin_to_yield::*;
pub use referral::*;
pub use vesting::*;
pub use rewards_pool::*;
pub use governance::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod chad_empire {
    use super::*;

    // CHAD Token Contract
    // Initialize the CHAD token with a fixed supply of 1 billion tokens
    pub fn initialize_token(ctx: Context<InitializeToken>, decimals: u8) -> Result<()> {
        // Set up the token mint with the authority
        let total_supply = 1_000_000_000; // 1 billion tokens
        let decimals_multiplier = 10u64.pow(decimals as u32);
        let total_supply_with_decimals = total_supply * decimals_multiplier;

        // Create the token mint
        token::initialize_mint(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::InitializeMint {
                    mint: ctx.accounts.mint.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            decimals,
            ctx.accounts.authority.key,
            Some(ctx.accounts.authority.key),
        )?;

        // Initialize the rewards pool account
        token::initialize_account(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::InitializeAccount {
                    account: ctx.accounts.rewards_pool.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
        )?;

        // Mint the total supply to the authority
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.authority_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
                &[],
            ),
            total_supply_with_decimals,
        )?;

        // Initialize the token config account
        let token_config = &mut ctx.accounts.token_config;
        token_config.authority = ctx.accounts.authority.key();
        token_config.mint = ctx.accounts.mint.key();
        token_config.rewards_pool = ctx.accounts.rewards_pool.key();
        token_config.buy_tax_bps = 1000; // 10% buy tax (basis points)
        token_config.sell_tax_bps = 1000; // 10% sell tax (basis points)
        token_config.minting_locked = false;
        token_config.total_supply = total_supply_with_decimals;
        token_config.decimals = decimals;

        Ok(())
    }

    // Lock minting to prevent inflation
    pub fn lock_minting(ctx: Context<LockMinting>) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token_config.authority,
            ErrorCode::Unauthorized
        );

        let token_config = &mut ctx.accounts.token_config;
        token_config.minting_locked = true;

        Ok(())
    }

    // Transfer tokens with tax
    pub fn transfer_with_tax(ctx: Context<TransferWithTax>, amount: u64) -> Result<()> {
        let token_config = &ctx.accounts.token_config;
        
        // Determine if this is a buy or sell transaction
        // For simplicity, we'll consider transfers to the rewards pool as sells
        // and transfers from the rewards pool as buys
        let is_sell = ctx.accounts.to_token_account.key() == token_config.rewards_pool;
        let is_buy = ctx.accounts.from_token_account.key() == token_config.rewards_pool;
        
        let tax_bps = if is_sell {
            token_config.sell_tax_bps
        } else if is_buy {
            token_config.buy_tax_bps
        } else {
            0 // No tax for regular transfers between users
        };
        
        // Calculate tax amount
        let tax_amount = (amount as u128)
            .checked_mul(tax_bps as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;
        
        let transfer_amount = amount.checked_sub(tax_amount).unwrap();
        
        // Transfer tax to rewards pool if applicable
        if tax_amount > 0 {
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.from_token_account.to_account_info(),
                        to: ctx.accounts.rewards_pool.to_account_info(),
                        authority: ctx.accounts.authority.to_account_info(),
                    },
                ),
                tax_amount,
            )?;
        }
        
        // Transfer remaining amount to recipient
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.from_token_account.to_account_info(),
                    to: ctx.accounts.to_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            transfer_amount,
        )?;
        
        Ok(())
    }

    // Update tax rates (only callable by authority)
    pub fn update_tax_rates(
        ctx: Context<UpdateTaxRates>,
        new_buy_tax_bps: u16,
        new_sell_tax_bps: u16,
    ) -> Result<()> {
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token_config.authority,
            ErrorCode::Unauthorized
        );
        
        // Ensure tax rates are within reasonable limits (max 20%)
        require!(new_buy_tax_bps <= 2000, ErrorCode::TaxTooHigh);
        require!(new_sell_tax_bps <= 2000, ErrorCode::TaxTooHigh);
        
        let token_config = &mut ctx.accounts.token_config;
        token_config.buy_tax_bps = new_buy_tax_bps;
        token_config.sell_tax_bps = new_sell_tax_bps;
        
        Ok(())
    }
    
    // Fair Launch Contract
    pub fn initialize_fair_launch(
        ctx: Context<InitializeFairLaunch>,
        start_time: i64,
        investment_days: u8,
        referral_bonus_bps: u16,
    ) -> Result<()> {
        fair_launch::initialize_fair_launch(ctx, start_time, investment_days, referral_bonus_bps)
    }
    
    pub fn contribute(
        ctx: Context<Contribute>,
        amount: u64,
        day: u8,
        referrer: Option<Pubkey>,
    ) -> Result<()> {
        fair_launch::contribute(ctx, amount, day, referrer)
    }
    
    pub fn generate_daily_supply(ctx: Context<GenerateDailySupply>, day: u8) -> Result<()> {
        fair_launch::generate_daily_supply(ctx, day)
    }
    
    pub fn create_liquidity(ctx: Context<CreateLiquidity>) -> Result<()> {
        fair_launch::create_liquidity(ctx)
    }
    
    pub fn claim_tokens(ctx: Context<ClaimTokens>) -> Result<()> {
        fair_launch::claim_tokens(ctx)
    }
    
    pub fn claim_referral_bonus(ctx: Context<ClaimReferralBonus>) -> Result<()> {
        fair_launch::claim_referral_bonus(ctx)
    }
    
    // Staking Contract
    pub fn initialize_staking(
        ctx: Context<InitializeStaking>,
        base_apr_bps: u16,
    ) -> Result<()> {
        staking::initialize_staking(ctx, base_apr_bps)
    }
    
    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        staking::stake(ctx, amount)
    }
    
    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        staking::unstake(ctx, amount)
    }
    
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        staking::claim_rewards(ctx)
    }
    
    pub fn update_apr(ctx: Context<UpdateApr>, new_base_apr_bps: u16) -> Result<()> {
        staking::update_apr(ctx, new_base_apr_bps)
    }
    
    // Spin-to-Yield Contract
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
        spin_to_yield::initialize_spin_system(
            ctx,
            base_yield_min_bps,
            base_yield_max_bps,
            moonshot_yield_min_bps,
            moonshot_yield_max_bps,
            moonshot_probability,
            fallback_yield_bps,
            cooldown_seconds,
        )
    }
    
    pub fn spin_for_yield(ctx: Context<SpinForYield>) -> Result<()> {
        spin_to_yield::spin_for_yield(ctx)
    }
    
    pub fn claim_fallback_yield(ctx: Context<ClaimFallbackYield>) -> Result<()> {
        spin_to_yield::claim_fallback_yield(ctx)
    }
    
    pub fn activate_lucky_charm(ctx: Context<ActivateBooster>, spins: u8) -> Result<()> {
        spin_to_yield::activate_lucky_charm(ctx, spins)
    }
    
    pub fn activate_yield_amplifier(ctx: Context<ActivateBooster>, hours: u8) -> Result<()> {
        spin_to_yield::activate_yield_amplifier(ctx, hours)
    }
    
    pub fn activate_chad_shield(ctx: Context<ActivateBooster>, spins: u8) -> Result<()> {
        spin_to_yield::activate_chad_shield(ctx, spins)
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
        spin_to_yield::update_spin_config(
            ctx,
            base_yield_min_bps,
            base_yield_max_bps,
            moonshot_yield_min_bps,
            moonshot_yield_max_bps,
            moonshot_probability,
            fallback_yield_bps,
            cooldown_seconds,
        )
    }
    
    // Referral Contract
    pub fn initialize_referral_system(
        ctx: Context<InitializeReferralSystem>,
        standard_commission_bps: u16,
        super_affiliate_threshold: u64,
        super_affiliate_commission_bps: u16,
    ) -> Result<()> {
        referral::initialize_referral_system(
            ctx,
            standard_commission_bps,
            super_affiliate_threshold,
            super_affiliate_commission_bps,
        )
    }
    
    pub fn register_referral(
        ctx: Context<RegisterReferral>,
        referrer_code: Pubkey,
    ) -> Result<()> {
        referral::register_referral(ctx, referrer_code)
    }
    
    pub fn record_contribution(
        ctx: Context<RecordContribution>,
        sol_amount: u64,
    ) -> Result<()> {
        referral::record_contribution(ctx, sol_amount)
    }
    
    pub fn update_commission_rates(
        ctx: Context<UpdateCommissionRates>,
        standard_commission_bps: Option<u16>,
        super_affiliate_commission_bps: Option<u16>,
        super_affiliate_threshold: Option<u64>,
    ) -> Result<()> {
        referral::update_commission_rates(
            ctx,
            standard_commission_bps,
            super_affiliate_commission_bps,
            super_affiliate_threshold,
        )
    }
    
    pub fn generate_referral_code(ctx: Context<GenerateReferralCode>) -> Result<()> {
        referral::generate_referral_code(ctx)
    }
    
    // Vesting Contract
    pub fn initialize_vesting(
        ctx: Context<InitializeVesting>,
        total_allocation: u64,
        tge_release_bps: u16,
        vesting_start_timestamp: i64,
        vesting_duration_seconds: i64,
        cliff_seconds: i64,
    ) -> Result<()> {
        vesting::initialize_vesting(
            ctx,
            total_allocation,
            tge_release_bps,
            vesting_start_timestamp,
            vesting_duration_seconds,
            cliff_seconds,
        )
    }
    
    pub fn add_recipient(
        ctx: Context<AddRecipient>,
        allocation_amount: u64,
    ) -> Result<()> {
        vesting::add_recipient(ctx, allocation_amount)
    }
    
    pub fn claim_vested_tokens(ctx: Context<ClaimVestedTokens>) -> Result<()> {
        vesting::claim_vested_tokens(ctx)
    }
    
    pub fn update_vesting_schedule(
        ctx: Context<UpdateVestingSchedule>,
        vesting_start_timestamp: Option<i64>,
        vesting_duration_seconds: Option<i64>,
        cliff_seconds: Option<i64>,
    ) -> Result<()> {
        vesting::update_vesting_schedule(
            ctx,
            vesting_start_timestamp,
            vesting_duration_seconds,
            cliff_seconds,
        )
    }
    
    // Rewards Pool Contract
    pub fn initialize_rewards_pool(
        ctx: Context<InitializeRewardsPool>,
        staking_allocation_bps: u16,
        spin_allocation_bps: u16,
        referral_allocation_bps: u16,
        emergency_reserve_bps: u16,
        distribution_frequency_seconds: i64,
    ) -> Result<()> {
        rewards_pool::initialize_rewards_pool(
            ctx,
            staking_allocation_bps,
            spin_allocation_bps,
            referral_allocation_bps,
            emergency_reserve_bps,
            distribution_frequency_seconds,
        )
    }
    
    pub fn distribute_rewards(ctx: Context<DistributeRewards>) -> Result<()> {
        rewards_pool::distribute_rewards(ctx)
    }
    
    pub fn update_allocation_percentages(
        ctx: Context<UpdateAllocationPercentages>,
        staking_allocation_bps: u16,
        spin_allocation_bps: u16,
        referral_allocation_bps: u16,
        emergency_reserve_bps: u16,
    ) -> Result<()> {
        rewards_pool::update_allocation_percentages(
            ctx,
            staking_allocation_bps,
            spin_allocation_bps,
            referral_allocation_bps,
            emergency_reserve_bps,
        )
    }
    
    pub fn emergency_withdraw(
        ctx: Context<EmergencyWithdraw>,
        amount: u64,
    ) -> Result<()> {
        rewards_pool::emergency_withdraw(ctx, amount)
    }
    
    // Governance Contract
    pub fn initialize_governance(
        ctx: Context<InitializeGovernance>,
        min_proposal_threshold: u64,
        quorum_votes_bps: u16,
        voting_period_seconds: i64,
        timelock_seconds: i64,
        execution_delay_seconds: i64,
    ) -> Result<()> {
        governance::initialize_governance(
            ctx,
            min_proposal_threshold,
            quorum_votes_bps,
            voting_period_seconds,
            timelock_seconds,
            execution_delay_seconds,
        )
    }
    
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description_url: String,
        target_program: Pubkey,
        instruction_data: Vec<u8>,
        is_executable: bool,
    ) -> Result<()> {
        governance::create_proposal(
            ctx,
            title,
            description_url,
            target_program,
            instruction_data,
            is_executable,
        )
    }
    
    pub fn cast_vote(
        ctx: Context<CastVote>,
        vote_type: bool,
    ) -> Result<()> {
        governance::cast_vote(ctx, vote_type)
    }
    
    pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
        governance::finalize_proposal(ctx)
    }
    
    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        governance::execute_proposal(ctx)
    }
    
    pub fn cancel_proposal(ctx: Context<CancelProposal>) -> Result<()> {
        governance::cancel_proposal(ctx)
    }
    
    pub fn update_governance_config(
        ctx: Context<UpdateGovernanceConfig>,
        min_proposal_threshold: Option<u64>,
        quorum_votes_bps: Option<u16>,
        voting_period_seconds: Option<i64>,
        timelock_seconds: Option<i64>,
        execution_delay_seconds: Option<i64>,
    ) -> Result<()> {
        governance::update_governance_config(
            ctx,
            min_proposal_threshold,
            quorum_votes_bps,
            voting_period_seconds,
            timelock_seconds,
            execution_delay_seconds,
        )
    }
}

#[derive(Accounts)]
pub struct InitializeToken<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = authority,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = authority,
        token::mint = mint,
        token::authority = authority,
    )]
    pub authority_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = authority,
        token::mint = mint,
        token::authority = authority,
    )]
    pub rewards_pool: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + TokenConfig::LEN
    )]
    pub token_config: Account<'info, TokenConfig>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct LockMinting<'info> {
    pub authority: Signer<'info>,
    #[account(mut)]
    pub token_config: Account<'info, TokenConfig>,
}

#[derive(Accounts)]
pub struct TransferWithTax<'info> {
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub from_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub rewards_pool: Account<'info, TokenAccount>,
    
    pub token_config: Account<'info, TokenConfig>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateTaxRates<'info> {
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub token_config: Account<'info, TokenConfig>,
}

#[account]
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

impl TokenConfig {
    pub const LEN: usize = 32 + 32 + 32 + 2 + 2 + 1 + 8 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
    #[msg("Tax rate cannot exceed 20%")]
    TaxTooHigh,
}
