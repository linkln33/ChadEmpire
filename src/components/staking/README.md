# Staking Components

This directory contains components related to token staking functionality in the Chad Empire application.

## Components

### StakeCard

A card component that displays staking information and provides staking actions.

**Props:**
- `stakeData` (object, optional): Data about the user's current stake
- `tokenBalance` (number, optional): User's available token balance
- `onStakeSuccess` (function, optional): Callback triggered after successful staking
- `onUnstakeSuccess` (function, optional): Callback triggered after successful unstaking

**State:**
- `isStaking`: Tracks if staking action is in progress
- `isUnstaking`: Tracks if unstaking action is in progress
- `showStakeForm`: Controls visibility of the stake form
- `showUnstakeForm`: Controls visibility of the unstake form
- `stakeStats`: Statistics about the user's stake (APY, rewards, etc.)

**Key Functions:**
- `toggleStakeForm()`: Shows/hides the stake form
- `toggleUnstakeForm()`: Shows/hides the unstake form
- `calculateRewards()`: Calculates current staking rewards
- `fetchStakeStats()`: Retrieves updated staking statistics

**Notes:**
- Displays current staking position and rewards
- Provides interface for staking and unstaking actions
- Shows APY and other relevant metrics
- Integrates with wallet for transactions

### StakeForm

Form component for staking tokens.

**Props:**
- `maxAmount` (number): Maximum amount available to stake
- `onStake` (function): Callback for stake submission
- `onCancel` (function, optional): Callback for canceling the stake action

**State:**
- `amount`: Amount to stake
- `duration`: Selected staking duration
- `isSubmitting`: Tracks if submission is in progress
- `validationError`: Any validation error message

**Key Functions:**
- `handleSubmit()`: Processes the stake submission
- `validateAmount()`: Validates the entered amount
- `calculateProjectedRewards()`: Shows projected rewards based on inputs
- `handleMaxAmount()`: Sets amount to maximum available

**Notes:**
- Includes input validation
- Shows projected rewards based on amount and duration
- Provides max button for convenience
- Displays APY information

### UnstakeForm

Form component for unstaking tokens.

**Props:**
- `stakedAmount` (number): Amount currently staked
- `onUnstake` (function): Callback for unstake submission
- `onCancel` (function, optional): Callback for canceling the unstake action
- `lockupRemaining` (number, optional): Remaining lockup time if applicable

**State:**
- `amount`: Amount to unstake
- `isSubmitting`: Tracks if submission is in progress
- `validationError`: Any validation error message
- `earlyWithdrawalFee`: Calculated early withdrawal fee if applicable

**Key Functions:**
- `handleSubmit()`: Processes the unstake submission
- `validateAmount()`: Validates the entered amount
- `calculateFee()`: Calculates any early withdrawal fees
- `handleMaxAmount()`: Sets amount to maximum staked

**Notes:**
- Includes input validation
- Shows any applicable early withdrawal fees
- Provides max button for convenience
- Warns about lockup periods if applicable

## Usage

```jsx
// In a staking page component
import { StakeCard, StakeForm, UnstakeForm } from '@/components/staking';

// Then in your JSX
const StakingPage = () => {
  const [showStakeForm, setShowStakeForm] = useState(false);
  const [stakeData, setStakeData] = useState(null);
  const tokenBalance = 1000; // From wallet or state
  
  const handleStakeSuccess = (newStakeData) => {
    setStakeData(newStakeData);
    setShowStakeForm(false);
  };
  
  return (
    <div className="staking-container">
      <StakeCard 
        stakeData={stakeData} 
        tokenBalance={tokenBalance}
        onStakeSuccess={handleStakeSuccess}
      />
      
      {showStakeForm && (
        <StakeForm 
          maxAmount={tokenBalance} 
          onStake={handleStakeSuccess}
          onCancel={() => setShowStakeForm(false)}
        />
      )}
    </div>
  );
};
```

## Implementation Details

The staking components implement the token staking system of the Chad Empire platform:
1. Users can stake their tokens for various durations
2. Staked tokens earn rewards based on APY and duration
3. Unstaking before lockup period may incur fees
4. Staking tier affects user status in the ecosystem

These components are essential for the tokenomics of the platform, encouraging long-term holding and participation.
