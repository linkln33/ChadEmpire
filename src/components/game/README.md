# Game Components

This directory contains components related to the gaming functionality in the Chad Empire application.

## Components

### SpinWheel

A complex interactive component that renders and controls the spinning wheel game mechanic.

**Props:**
- `onSpinComplete` (function): Callback triggered when spin animation completes
- `spinType` (string, optional): Type of spin (normal, boosted, etc.)
- `boosterActive` (boolean, optional): Whether a booster is active for this spin
- `disabled` (boolean, optional): Whether the wheel is disabled

**State:**
- `isSpinning`: Tracks if wheel is currently spinning
- `spinDegrees`: Current rotation of the wheel in degrees
- `spinResult`: Result of the spin (prize, token amount, etc.)
- `spinHistory`: Array of previous spin results

**Key Functions:**
- `startSpin()`: Initiates the spinning animation
- `calculateResult()`: Determines the spin result based on probabilities
- `handleSpinComplete()`: Processes the spin result and triggers callback
- `renderWheelSegments()`: Renders the individual wheel segments

**Notes:**
- Uses CSS animations for smooth spinning effect
- Implements weighted randomization for prize distribution
- Connects with wallet functionality for token rewards

### SpinResult

Displays the result of a spin and associated rewards.

**Props:**
- `result` (object): The spin result data
- `onClaim` (function): Callback for claiming rewards
- `onSpin` (function): Callback for initiating another spin

**State:**
- `isClaiming`: Tracks if reward claiming is in progress
- `showConfetti`: Controls celebration animation display
- `rewardDetails`: Expanded details about the reward

**Key Functions:**
- `handleClaim()`: Processes the reward claim
- `renderRewardContent()`: Renders appropriate content based on reward type
- `calculateBonus()`: Calculates any applicable bonuses

**Notes:**
- Displays different UI based on reward type (tokens, boosters, etc.)
- Includes celebration animations for significant wins
- Provides options for claiming or continuing gameplay

## Usage

```jsx
// In a game page component
import { SpinWheel, SpinResult } from '@/components/game';

// Then in your JSX
const GamePage = () => {
  const [result, setResult] = useState(null);
  
  const handleSpinComplete = (spinResult) => {
    setResult(spinResult);
  };
  
  return (
    <div>
      <SpinWheel onSpinComplete={handleSpinComplete} />
      {result && <SpinResult result={result} onSpin={() => setResult(null)} />}
    </div>
  );
};
```

## Implementation Details

The game components implement the core gameplay loop of the Chad Empire application:
1. User initiates a spin using tokens
2. Wheel animation plays and determines a random result
3. Result is displayed with appropriate rewards
4. User can claim rewards or continue playing

These components integrate with the wallet and token systems to manage the economy of the game.
