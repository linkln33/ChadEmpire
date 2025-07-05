# Boosters Components

This directory contains components related to the booster functionality in the Chad Empire application.

## Components

### BoosterCard

A card component that displays information about a booster and provides interaction options.

**Props:**
- `booster` (object): Data about the booster including type, rarity, effects
- `owned` (boolean, optional): Whether the user owns this booster
- `onUse` (function, optional): Callback triggered when booster is used
- `onPurchase` (function, optional): Callback triggered when booster is purchased

**State:**
- `isUsing`: Tracks if booster use action is in progress
- `isPurchasing`: Tracks if purchase action is in progress
- `showDetails`: Controls visibility of detailed information
- `effectPreview`: Controls visibility of effect preview

**Key Functions:**
- `handleUse()`: Processes the booster use action
- `handlePurchase()`: Processes the booster purchase action
- `toggleDetails()`: Shows/hides detailed information
- `renderBoosterEffects()`: Renders the effects of the booster

**Notes:**
- Displays booster rarity with visual indicators
- Shows booster effects and benefits
- Provides different actions based on ownership status
- Includes visual feedback for actions

### FragmentProgress

A component that displays progress towards completing booster fragments.

**Props:**
- `fragments` (array): Collection of fragments the user has
- `requiredFragments` (number): Number of fragments needed for completion
- `boosterType` (string): Type of booster these fragments create
- `onComplete` (function, optional): Callback triggered when fragments are combined

**State:**
- `isComplete`: Whether enough fragments have been collected
- `isCombining`: Tracks if combining action is in progress
- `showCombineModal`: Controls visibility of the combine confirmation modal

**Key Functions:**
- `checkCompletion()`: Checks if enough fragments have been collected
- `handleCombine()`: Processes the fragment combination
- `renderFragments()`: Renders the fragment collection display
- `calculateProgress()`: Calculates completion percentage

**Notes:**
- Visually displays fragment collection progress
- Provides combine action when enough fragments are collected
- Shows fragment rarity and type information
- Includes animation for fragment combination

## Usage

```jsx
// In a boosters page component
import { BoosterCard, FragmentProgress } from '@/components/boosters';

// Then in your JSX
const BoostersPage = () => {
  const [boosters, setBoosters] = useState([]);
  const [fragments, setFragments] = useState([]);
  
  const handleUseBooster = (boosterId) => {
    // Logic to use booster
    console.log(`Using booster ${boosterId}`);
  };
  
  const handleCombineFragments = (fragmentType) => {
    // Logic to combine fragments
    console.log(`Combining fragments for ${fragmentType}`);
  };
  
  return (
    <div className="boosters-container">
      <h2>Your Boosters</h2>
      <div className="boosters-grid">
        {boosters.map(booster => (
          <BoosterCard 
            key={booster.id}
            booster={booster}
            owned={true}
            onUse={() => handleUseBooster(booster.id)}
          />
        ))}
      </div>
      
      <h2>Fragment Progress</h2>
      <div className="fragments-container">
        {Object.entries(groupFragmentsByType(fragments)).map(([type, frags]) => (
          <FragmentProgress
            key={type}
            fragments={frags}
            requiredFragments={5}
            boosterType={type}
            onComplete={() => handleCombineFragments(type)}
          />
        ))}
      </div>
    </div>
  );
};
```

## Implementation Details

The boosters components implement the power-up system of the Chad Empire game:
1. Boosters provide temporary advantages in the game
2. Fragments can be collected and combined to create boosters
3. Different booster rarities provide different levels of benefits
4. Boosters can be purchased or earned through gameplay

These components enhance the gameplay experience by providing strategic options and progression mechanics.
