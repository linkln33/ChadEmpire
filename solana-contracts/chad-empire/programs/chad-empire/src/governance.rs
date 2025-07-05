use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use solana_program::{program::invoke, system_instruction};
use std::convert::TryInto;

#[account]
pub struct GovernanceConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub voting_token_account: Pubkey,
    pub proposal_count: u64,
    pub min_proposal_threshold: u64,   // Minimum tokens required to create a proposal
    pub quorum_votes_bps: u16,         // Percentage of total supply needed for quorum in basis points
    pub voting_period_seconds: i64,    // How long voting lasts
    pub timelock_seconds: i64,         // Delay before execution after approval
    pub execution_delay_seconds: i64,  // Maximum time to execute after timelock expires
}

impl GovernanceConfig {
    pub const LEN: usize = 32 + 32 + 32 + 8 + 8 + 2 + 8 + 8 + 8;
}

#[account]
pub struct Proposal {
    pub proposal_id: u64,
    pub proposer: Pubkey,
    pub title: String,                 // Max 100 chars
    pub description_url: String,       // IPFS or other URL to detailed description
    pub target_program: Pubkey,        // Program to call if proposal passes
    pub instruction_data: Vec<u8>,     // Serialized instruction data
    pub created_at: i64,
    pub voting_ends_at: i64,
    pub execution_time: i64,           // When proposal can be executed (after timelock)
    pub executed_at: i64,              // When proposal was executed (0 if not executed)
    pub for_votes: u64,
    pub against_votes: u64,
    pub status: u8,                    // 0=Active, 1=Canceled, 2=Defeated, 3=Succeeded, 4=Queued, 5=Executed, 6=Expired
    pub is_executable: bool,           // Whether this proposal can be executed (some may be informational only)
}

impl Proposal {
    pub const MAX_TITLE_LEN: usize = 100;
    pub const MAX_URL_LEN: usize = 200;
    pub const MAX_INSTRUCTION_DATA_LEN: usize = 1000;
    
    pub fn space(title_len: usize, url_len: usize, instruction_data_len: usize) -> usize {
        8 +  // Discriminator
        8 +  // proposal_id
        32 + // proposer
        4 + std::cmp::min(title_len, Self::MAX_TITLE_LEN) + // title (String)
        4 + std::cmp::min(url_len, Self::MAX_URL_LEN) + // description_url (String)
        32 + // target_program
        4 + std::cmp::min(instruction_data_len, Self::MAX_INSTRUCTION_DATA_LEN) + // instruction_data (Vec<u8>)
        8 +  // created_at
        8 +  // voting_ends_at
        8 +  // execution_time
        8 +  // executed_at
        8 +  // for_votes
        8 +  // against_votes
        1 +  // status
        1    // is_executable
    }
}

#[account]
pub struct Vote {
    pub voter: Pubkey,
    pub proposal_id: u64,
    pub vote_type: bool,      // true = for, false = against
    pub vote_weight: u64,
    pub voted_at: i64,
}

impl Vote {
    pub const LEN: usize = 32 + 8 + 1 + 8 + 8;
}

pub fn initialize_governance(
    ctx: Context<InitializeGovernance>,
    min_proposal_threshold: u64,
    quorum_votes_bps: u16,
    voting_period_seconds: i64,
    timelock_seconds: i64,
    execution_delay_seconds: i64,
) -> Result<()> {
    // Validate parameters
    require!(quorum_votes_bps <= 10000, ErrorCode::InvalidQuorumPercentage);
    require!(voting_period_seconds > 0, ErrorCode::InvalidVotingPeriod);
    require!(timelock_seconds >= 0, ErrorCode::InvalidTimelockPeriod);
    require!(execution_delay_seconds > 0, ErrorCode::InvalidExecutionDelay);
    
    // Initialize governance config
    let governance_config = &mut ctx.accounts.governance_config;
    governance_config.authority = ctx.accounts.authority.key();
    governance_config.token_mint = ctx.accounts.token_mint.key();
    governance_config.voting_token_account = ctx.accounts.voting_token_account.key();
    governance_config.proposal_count = 0;
    governance_config.min_proposal_threshold = min_proposal_threshold;
    governance_config.quorum_votes_bps = quorum_votes_bps;
    governance_config.voting_period_seconds = voting_period_seconds;
    governance_config.timelock_seconds = timelock_seconds;
    governance_config.execution_delay_seconds = execution_delay_seconds;
    
    Ok(())
}

pub fn create_proposal(
    ctx: Context<CreateProposal>,
    title: String,
    description_url: String,
    target_program: Pubkey,
    instruction_data: Vec<u8>,
    is_executable: bool,
) -> Result<()> {
    // Validate parameters
    require!(title.len() <= Proposal::MAX_TITLE_LEN, ErrorCode::TitleTooLong);
    require!(description_url.len() <= Proposal::MAX_URL_LEN, ErrorCode::UrlTooLong);
    require!(instruction_data.len() <= Proposal::MAX_INSTRUCTION_DATA_LEN, ErrorCode::InstructionDataTooLarge);
    
    // Check if proposer has enough tokens
    let governance_config = &ctx.accounts.governance_config;
    let proposer_token_account = &ctx.accounts.proposer_token_account;
    
    require!(
        proposer_token_account.amount >= governance_config.min_proposal_threshold,
        ErrorCode::InsufficientProposalThreshold
    );
    
    // Get current time and calculate voting end time
    let current_time = Clock::get()?.unix_timestamp;
    let voting_ends_at = current_time.checked_add(governance_config.voting_period_seconds).unwrap();
    
    // Increment proposal count
    let mut mutable_config = ctx.accounts.governance_config.to_account_info();
    let governance_config = &mut AccountLoader::<GovernanceConfig>::try_from(&mutable_config)?.load_mut()?;
    let proposal_id = governance_config.proposal_count;
    governance_config.proposal_count = governance_config.proposal_count.checked_add(1).unwrap();
    
    // Initialize proposal
    let proposal = &mut ctx.accounts.proposal;
    proposal.proposal_id = proposal_id;
    proposal.proposer = ctx.accounts.proposer.key();
    proposal.title = title;
    proposal.description_url = description_url;
    proposal.target_program = target_program;
    proposal.instruction_data = instruction_data;
    proposal.created_at = current_time;
    proposal.voting_ends_at = voting_ends_at;
    proposal.execution_time = 0; // Will be set when voting ends
    proposal.executed_at = 0;
    proposal.for_votes = 0;
    proposal.against_votes = 0;
    proposal.status = 0; // Active
    proposal.is_executable = is_executable;
    
    Ok(())
}

pub fn cast_vote(
    ctx: Context<CastVote>,
    vote_type: bool,
) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Check if proposal is still active
    require!(proposal.status == 0, ErrorCode::ProposalNotActive);
    require!(current_time <= proposal.voting_ends_at, ErrorCode::VotingPeriodEnded);
    
    // Get voter's token balance
    let voter_token_account = &ctx.accounts.voter_token_account;
    let vote_weight = voter_token_account.amount;
    
    // Require some tokens to vote
    require!(vote_weight > 0, ErrorCode::InsufficientVotingPower);
    
    // Record the vote
    let vote = &mut ctx.accounts.vote;
    vote.voter = ctx.accounts.voter.key();
    vote.proposal_id = proposal.proposal_id;
    vote.vote_type = vote_type;
    vote.vote_weight = vote_weight;
    vote.voted_at = current_time;
    
    // Update proposal vote counts
    if vote_type {
        proposal.for_votes = proposal.for_votes.checked_add(vote_weight).unwrap();
    } else {
        proposal.against_votes = proposal.against_votes.checked_add(vote_weight).unwrap();
    }
    
    Ok(())
}

pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let governance_config = &ctx.accounts.governance_config;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Check if voting period has ended
    require!(current_time > proposal.voting_ends_at, ErrorCode::VotingPeriodNotEnded);
    require!(proposal.status == 0, ErrorCode::ProposalAlreadyFinalized);
    
    // Get total supply to calculate quorum
    let token_mint = &ctx.accounts.token_mint;
    let total_supply = token_mint.supply;
    
    // Calculate quorum threshold
    let quorum_threshold = (total_supply as u128)
        .checked_mul(governance_config.quorum_votes_bps as u128)
        .unwrap()
        .checked_div(10000)
        .unwrap() as u64;
    
    // Check if quorum was reached
    let total_votes = proposal.for_votes.checked_add(proposal.against_votes).unwrap();
    
    if total_votes < quorum_threshold {
        // Quorum not reached, proposal is defeated
        proposal.status = 2; // Defeated
        return Ok(());
    }
    
    // Check if proposal passed
    if proposal.for_votes > proposal.against_votes {
        // Proposal succeeded
        proposal.status = 3; // Succeeded
        
        // If executable, set execution time after timelock
        if proposal.is_executable {
            proposal.execution_time = current_time.checked_add(governance_config.timelock_seconds).unwrap();
            proposal.status = 4; // Queued
        }
    } else {
        // Proposal defeated
        proposal.status = 2; // Defeated
    }
    
    Ok(())
}

pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let governance_config = &ctx.accounts.governance_config;
    let current_time = Clock::get()?.unix_timestamp;
    
    // Check if proposal is queued and timelock has passed
    require!(proposal.status == 4, ErrorCode::ProposalNotQueued);
    require!(current_time >= proposal.execution_time, ErrorCode::TimelockNotExpired);
    
    // Check if execution window hasn't expired
    let execution_deadline = proposal.execution_time.checked_add(governance_config.execution_delay_seconds).unwrap();
    require!(current_time <= execution_deadline, ErrorCode::ExecutionWindowExpired);
    
    // Execute the proposal by invoking the target program
    // This is a simplified implementation - in a real contract, you would need to handle
    // the instruction data and accounts properly
    
    // Mark proposal as executed
    proposal.status = 5; // Executed
    proposal.executed_at = current_time;
    
    Ok(())
}

pub fn cancel_proposal(ctx: Context<CancelProposal>) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    
    // Only the proposer or authority can cancel
    require!(
        ctx.accounts.canceler.key() == proposal.proposer || 
        ctx.accounts.canceler.key() == ctx.accounts.governance_config.authority,
        ErrorCode::Unauthorized
    );
    
    // Can only cancel active proposals
    require!(proposal.status == 0, ErrorCode::ProposalNotActive);
    
    // Mark as canceled
    proposal.status = 1; // Canceled
    
    Ok(())
}

pub fn update_governance_config(
    ctx: Context<UpdateGovernanceConfig>,
    min_proposal_threshold: Option<u64>,
    quorum_votes_bps: Option<u16>,
    voting_period_seconds: Option<i64>,
    timelock_seconds: Option<i64>,
    execution_delay_seconds: Option<i64>,
) -> Result<()> {
    // Validate authority
    require!(
        ctx.accounts.authority.key() == ctx.accounts.governance_config.authority,
        ErrorCode::Unauthorized
    );
    
    let governance_config = &mut ctx.accounts.governance_config;
    
    // Update only the provided parameters
    if let Some(value) = min_proposal_threshold {
        governance_config.min_proposal_threshold = value;
    }
    
    if let Some(value) = quorum_votes_bps {
        require!(value <= 10000, ErrorCode::InvalidQuorumPercentage);
        governance_config.quorum_votes_bps = value;
    }
    
    if let Some(value) = voting_period_seconds {
        require!(value > 0, ErrorCode::InvalidVotingPeriod);
        governance_config.voting_period_seconds = value;
    }
    
    if let Some(value) = timelock_seconds {
        require!(value >= 0, ErrorCode::InvalidTimelockPeriod);
        governance_config.timelock_seconds = value;
    }
    
    if let Some(value) = execution_delay_seconds {
        require!(value > 0, ErrorCode::InvalidExecutionDelay);
        governance_config.execution_delay_seconds = value;
    }
    
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeGovernance<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub token_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + GovernanceConfig::LEN,
        seeds = [b"governance".as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub governance_config: Account<'info, GovernanceConfig>,
    
    #[account(
        token::mint = token_mint,
    )]
    pub voting_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(
    title: String,
    description_url: String,
    target_program: Pubkey,
    instruction_data: Vec<u8>,
    is_executable: bool
)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub proposer: Signer<'info>,
    
    pub governance_config: Account<'info, GovernanceConfig>,
    
    #[account(
        token::mint = governance_config.token_mint,
        token::authority = proposer,
    )]
    pub proposer_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = proposer,
        space = 8 + Proposal::space(title.len(), description_url.len(), instruction_data.len()),
        seeds = [
            b"proposal".as_ref(),
            governance_config.key().as_ref(),
            &governance_config.proposal_count.to_le_bytes()
        ],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,
    
    pub governance_config: Account<'info, GovernanceConfig>,
    
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        token::mint = governance_config.token_mint,
        token::authority = voter,
    )]
    pub voter_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = voter,
        space = 8 + Vote::LEN,
        seeds = [
            b"vote".as_ref(),
            proposal.key().as_ref(),
            voter.key().as_ref()
        ],
        bump
    )]
    pub vote: Account<'info, Vote>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct FinalizeProposal<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub governance_config: Account<'info, GovernanceConfig>,
    
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    pub token_mint: Account<'info, Mint>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub executor: Signer<'info>,
    
    pub governance_config: Account<'info, GovernanceConfig>,
    
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    /// CHECK: This is the program that will be called if the proposal passes
    pub target_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct CancelProposal<'info> {
    #[account(mut)]
    pub canceler: Signer<'info>,
    
    pub governance_config: Account<'info, GovernanceConfig>,
    
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
}

#[derive(Accounts)]
pub struct UpdateGovernanceConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"governance".as_ref(), governance_config.token_mint.as_ref()],
        bump
    )]
    pub governance_config: Account<'info, GovernanceConfig>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid quorum percentage")]
    InvalidQuorumPercentage,
    #[msg("Invalid voting period")]
    InvalidVotingPeriod,
    #[msg("Invalid timelock period")]
    InvalidTimelockPeriod,
    #[msg("Invalid execution delay")]
    InvalidExecutionDelay,
    #[msg("Title too long")]
    TitleTooLong,
    #[msg("URL too long")]
    UrlTooLong,
    #[msg("Instruction data too large")]
    InstructionDataTooLarge,
    #[msg("Insufficient tokens to create proposal")]
    InsufficientProposalThreshold,
    #[msg("Proposal is not active")]
    ProposalNotActive,
    #[msg("Voting period has ended")]
    VotingPeriodEnded,
    #[msg("Voting period has not ended yet")]
    VotingPeriodNotEnded,
    #[msg("Insufficient voting power")]
    InsufficientVotingPower,
    #[msg("Proposal already finalized")]
    ProposalAlreadyFinalized,
    #[msg("Proposal not queued for execution")]
    ProposalNotQueued,
    #[msg("Timelock period not expired")]
    TimelockNotExpired,
    #[msg("Execution window expired")]
    ExecutionWindowExpired,
    #[msg("Unauthorized")]
    Unauthorized,
}
