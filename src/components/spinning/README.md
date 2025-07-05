# Spinning Components

This directory contains components related to the spinning wheel game mechanic in the Chad Empire application.

## Components

### SpinWheel

A visual component that renders the spinning wheel with segments and handles animation.

**Props:**
- `segments` (array): Array of wheel segments with prizes/rewards
- `onSpinEnd` (function): Callback triggered when spin animation ends
- `disabled` (boolean, optional): Whether the wheel is disabled
- `size` (string, optional): Size variant of the wheel ('sm', 'md', 'lg')

**State:**
- `isSpinning`: Tracks if wheel is currently spinning
- `rotation`: Current rotation angle of the wheel
- `selectedSegment`: The segment that was selected after spinning
- `spinDuration`: Duration of the spin animation

**Key Functions:**
- `spin()`: Initiates the spinning animation
- `calculateEndRotation()`: Calculates final rotation to land on selected segment
- `handleAnimationEnd()`: Handles end of spinning animation
- `renderSegments()`: Renders the wheel segments

**Notes:**
- Uses CSS animations for smooth spinning effect
- Supports customizable wheel segments
- Includes pointer/indicator for selected segment
- Provides visual and audio feedback during spinning

### SpinResult

Displays the result of a spin and associated rewards.

**Props:**
- `result` (object): The spin result data
- `onClaim` (function): Callback for claiming rewards
- `onSpinAgain` (function): Callback for initiating another spin

**State:**
- `isClaiming`: Tracks if reward claiming is in progress
- `showConfetti`: Controls celebration animation display
- `rewardDetails`: Expanded details about the reward

**Key Functions:**
- `handleClaim()`: Processes the reward claim
- `renderRewardContent()`: Renders appropriate content based on reward type
- `calculateBonus()`: Calculates any applicable bonuses

**Notes:**
- Displays different UI based on reward type
- Includes celebration animations for wins
- Provides options for claiming or spinning again

### SpinButton

A button component specifically designed for initiating spins.

**Props:**
- `onClick` (function): Callback for button click
- `disabled` (boolean, optional): Whether the button is disabled
- `cost` (number, optional): Token cost for spinning
- `boosterActive` (boolean, optional): Whether a booster is active

**State:**
- `isPressed`: Tracks button press state for animation
- `showCostTooltip`: Controls visibility of cost tooltip

**Key Functions:**
- `handleClick()`: Handles button click with animation
- `toggleCostTooltip()`: Shows/hides the cost tooltip

**Notes:**
- Features engaging animation on press
- Shows token cost when applicable
- Indicates when boosters are active
- Provides visual feedback when disabled

## Usage

```jsx
// In a game page component
import { SpinWheel, SpinResult, SpinButton } from '@/components/spinning';

// Then in your JSX
const SpinningGame = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const segments = [
    { id: 1, label: '100 $CHAD', color: '#FF5733' },
    { id: 2, label: 'Booster', color: '#33FF57' },
    // more segments...
  ];
  
  const handleSpin = () => {
    setIsSpinning(true);
    // Logic to determine result
  };
  
  const handleSpinEnd = (selectedSegment) => {
    setIsSpinning(false);
    setResult({ 
      segmentId: selectedSegment.id,
      reward: selectedSegment.label,
      // other result data
    });
  };
  
  return (
    <div className="spinning-game">
      <SpinWheel 
        segments={segments}
        onSpinEnd={handleSpinEnd}
        disabled={isSpinning}
      />
      
      {!result && (
        <SpinButton 
          onClick={handleSpin}
          disabled={isSpinning}
          cost={50}
        />
      )}
      
      {result && (
        <SpinResult
          result={result}
          onClaim={() => console.log('Claiming reward')}
          onSpinAgain={() => setResult(null)}
        />
      )}
    </div>
  );
};
```

## Implementation Details

The spinning components implement the core gameplay mechanic of the Chad Empire game:
1. Users spend tokens to spin the wheel
2. The wheel animation provides exciting anticipation
3. Results are displayed with appropriate rewards
4. Users can claim rewards or continue playing

These components create an engaging gameplay loop that encourages continued participation.
