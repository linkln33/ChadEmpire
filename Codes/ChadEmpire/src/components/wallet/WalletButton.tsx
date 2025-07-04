'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';

export function WalletButton() {
  const { publicKey, wallet, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);

  // Format the wallet address for display
  const formattedAddress = publicKey ? 
    `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : 
    '';

  // Handle copy to clipboard
  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      {publicKey ? (
        <div className="flex items-center rounded-lg overflow-hidden backdrop-blur-sm border-2 border-chad-neon" style={{ boxShadow: '0 0 10px rgba(0, 255, 247, 0.7), 0 0 20px rgba(0, 255, 247, 0.4)' }}>
          <button
            onClick={() => setVisible(true)}
            className="bg-transparent text-white rounded-l-lg py-2 px-4 flex items-center hover:bg-chad-neon/10 transition-all duration-300 backdrop-blur-sm"
          >
            <span className="mr-2 text-chad-neon font-medium">
              {wallet?.adapter.name || 'Wallet'}
            </span>
            <span className="text-chad-accent">{formattedAddress}</span>
          </button>
          <button
            onClick={copyAddress}
            className="bg-transparent border-l border-chad-neon/50 text-white rounded-none py-2 px-2 hover:bg-chad-neon/10 transition-all duration-300"
            title="Copy address"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-chad-success" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            )}
          </button>
          <button
            onClick={disconnect}
            className="bg-transparent border-l border-chad-neon/50 text-white rounded-r-lg py-2 px-2 hover:bg-chad-neon/10 transition-all duration-300"
            title="Disconnect"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm9 4a1 1 0 00-1-1H4V5h6v2zm-6 5a1 1 0 001 1h8a1 1 0 001-1v-3a1 1 0 00-1-1H7a1 1 0 00-1 1v3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setVisible(true)}
          className="bg-transparent text-chad-neon hover:text-white font-bold py-2.5 px-7 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 border-2 border-chad-neon backdrop-blur-sm animate-pulse-slow"
          style={{ boxShadow: '0 0 10px rgba(0, 255, 247, 0.7), 0 0 20px rgba(0, 255, 247, 0.4)', textShadow: '0 0 5px rgba(0, 255, 247, 0.5)' }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
