# Wallet Components

This directory contains components related to wallet connectivity and blockchain interactions in the Chad Empire application.

## Components

### ChadWalletButton

A customized wallet connection button component that handles wallet connection states and user interactions.

**Props:**
- `size` (string, optional): Button size variant ('sm', 'md', 'lg')
- `variant` (string, optional): Visual style variant
- `showBalance` (boolean, optional): Whether to display token balance

**State:**
- `isConnecting`: Tracks if wallet connection is in progress
- `hasError`: Tracks if there was an error connecting
- `walletAddress`: The connected wallet address (if any)
- `tokenBalance`: User's token balance (if connected and showBalance is true)

**Key Functions:**
- `handleConnect()`: Initiates wallet connection
- `handleDisconnect()`: Disconnects the wallet
- `formatAddress()`: Formats wallet address for display
- `fetchBalance()`: Retrieves token balance for connected wallet

**Notes:**
- Integrates with Solana wallet adapter
- Displays different states based on connection status
- Handles connection errors gracefully
- Shows abbreviated wallet address when connected

### WalletProvider

A provider component that sets up wallet connection context for the application.

**Props:**
- `children`: Child components to be wrapped with wallet context

**State:**
- None directly (uses context from wallet adapter)

**Key Functions:**
- None directly (configures wallet adapter)

**Notes:**
- Configures supported wallet types
- Sets up connection parameters
- Provides wallet context to child components
- Handles wallet autoConnect functionality

## Usage

```jsx
// In a page or component
import { ChadWalletButton } from '@/components/wallet';

// Then in your JSX
<ChadWalletButton showBalance={true} />

// For the provider (typically in _app.js or layout.tsx)
import { WalletProvider } from '@/components/wallet';

const App = ({ children }) => {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
};
```

## Implementation Details

The wallet components provide essential blockchain connectivity for the Chad Empire application:
1. WalletProvider establishes the connection context for the entire application
2. ChadWalletButton gives users an interface to connect/disconnect their wallets
3. Connected components can access wallet state to perform transactions

These components are critical for all blockchain interactions including token transfers, staking, and gameplay rewards.
