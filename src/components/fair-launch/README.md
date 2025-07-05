# Fair Launch Components

This directory contains components related to the fair launch functionality in the Chad Empire application.

## Components

### FairLaunchSection

A comprehensive component that displays information about the token fair launch, including timelines, participation methods, and token allocation.

**Props:**
- `launchData` (object, optional): Data about the launch including dates, allocations, etc.
- `isActive` (boolean, optional): Whether the fair launch is currently active

**State:**
- `countdown`: Time remaining until launch or next phase
- `phase`: Current phase of the launch (pre-launch, active, completed)
- `participationStats`: Statistics about current participation
- `userAllocation`: Current user's allocation if connected

**Key Functions:**
- `calculateTimeRemaining()`: Calculates countdown to next phase
- `renderPhaseContent()`: Renders appropriate content based on current phase
- `handleParticipate()`: Processes user participation request
- `displayAllocationInfo()`: Shows allocation information for the user

**Notes:**
- Displays different UI based on launch phase
- Integrates with wallet functionality for participation
- Includes countdown timers and progress indicators
- Provides detailed tokenomics information

## Usage

```jsx
// In a page component
import FairLaunchSection from '@/components/fair-launch/FairLaunchSection';

// Then in your JSX
const LaunchPage = () => {
  const launchData = {
    startDate: '2025-08-01T00:00:00Z',
    endDate: '2025-08-15T00:00:00Z',
    totalAllocation: 10000000,
    // other launch parameters
  };
  
  return (
    <div className="page-container">
      <h1>Chad Empire Token Launch</h1>
      <FairLaunchSection launchData={launchData} isActive={true} />
    </div>
  );
};
```

## Implementation Details

The fair launch component implements a transparent and equitable token distribution system:
1. Displays clear information about token allocation and distribution
2. Provides real-time updates on participation statistics
3. Guides users through the participation process
4. Shows individual allocation based on participation level

This component is central to the initial token distribution strategy of the Chad Empire platform.
