'use client';

import { FC, ReactNode, useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
// Create a custom modal provider that doesn't render the default UI
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// We're not using the default wallet adapter UI styles
// import '@solana/wallet-adapter-react-ui/styles.css';
// Import our custom styles
import '@/styles/wallet-override.css';

export const WalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking
  // and lazy loading so only the wallets you configure here will be compiled into your
  // application, and only the dependencies of wallets that your users connect to will
  // be loaded
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter()
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        {/* We're not using the default WalletModalProvider */}
        {children}
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
