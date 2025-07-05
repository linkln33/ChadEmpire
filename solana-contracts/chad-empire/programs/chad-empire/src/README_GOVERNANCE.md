# Governance Contract

## Overview

The Governance contract implements a decentralized governance system for the ChadEmpire ecosystem, allowing token holders to create proposals, vote on them, and execute approved changes on-chain.

## Features

- **Token-weighted Voting**: Voting power proportional to token holdings
- **Proposal Creation**: Token holders can create proposals with a minimum threshold
- **Quorum Requirements**: Minimum participation required for valid proposals
- **Timelock Period**: Security delay before execution of approved proposals
- **On-chain Execution**: Automatic execution of approved proposals
- **Proposal Lifecycle**: Complete management of proposal states (active, canceled, defeated, succeeded, queued, executed)

## Key Functions

### `initialize_governance`
Initializes the governance system with voting parameters.

```rust
pub fn initialize_governance(
    ctx: Context<InitializeGovernance>,
    min_proposal_threshold: u64,
    quorum_votes_bps: u16,
    voting_period_seconds: i64,
    timelock_seconds: i64,
    execution_delay_seconds: i64,
) -> Result<()>
```

### `create_proposal`
Creates a new governance proposal.

```rust
pub fn create_proposal(
    ctx: Context<CreateProposal>,
    title: String,
    description_url: String,
    target_program: Pubkey,
    instruction_data: Vec<u8>,
    is_executable: bool,
) -> Result<()>
```

### `cast_vote`
Allows token holders to cast votes on proposals.

```rust
pub fn cast_vote(
    ctx: Context<CastVote>,
    vote_type: bool,  // true = for, false = against
) -> Result<()>
```

### `finalize_proposal`
Finalizes a proposal after the voting period ends, checking quorum and result.

```rust
pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()>
```

### `execute_proposal`
Executes an approved proposal after the timelock period.

```rust
pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()>
```

### `cancel_proposal`
Cancels a proposal (only callable by the proposer or authority).

```rust
pub fn cancel_proposal(ctx: Context<CancelProposal>) -> Result<()>
```

### `update_governance_config`
Updates the governance configuration parameters (only callable by authority).

```rust
pub fn update_governance_config(
    ctx: Context<UpdateGovernanceConfig>,
    min_proposal_threshold: Option<u64>,
    quorum_votes_bps: Option<u16>,
    voting_period_seconds: Option<i64>,
    timelock_seconds: Option<i64>,
    execution_delay_seconds: Option<i64>,
) -> Result<()>
```

## Account Structures

### `GovernanceConfig`
Stores the governance configuration including voting parameters.

```rust
pub struct GovernanceConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub min_proposal_threshold: u64,
    pub quorum_votes_bps: u16,
    pub voting_period_seconds: i64,
    pub timelock_seconds: i64,
    pub execution_delay_seconds: i64,
    pub proposal_count: u64,
}
```

### `Proposal`
Stores information about a specific proposal.

```rust
pub struct Proposal {
    pub id: u64,
    pub proposer: Pubkey,
    pub title: String,
    pub description_url: String,
    pub target_program: Pubkey,
    pub instruction_data: Vec<u8>,
    pub is_executable: bool,
    pub created_at: i64,
    pub voting_ends_at: i64,
    pub execution_time: i64,
    pub for_votes: u64,
    pub against_votes: u64,
    pub status: u8,  // 1 = active, 2 = canceled, 3 = defeated, 4 = succeeded, 5 = queued, 6 = executed
    pub executed_at: i64,
}
```

### `Vote`
Records an individual vote on a proposal.

```rust
pub struct Vote {
    pub voter: Pubkey,
    pub proposal_id: u64,
    pub vote_type: bool,  // true = for, false = against
    pub vote_weight: u64,
    pub voted_at: i64,
}
```

## Security Considerations

- Validation of voting periods and quorum requirements
- Checks to prevent double-voting
- Timelock period for security before execution
- Authority checks for administrative functions
- Proposal status validation to ensure proper lifecycle
