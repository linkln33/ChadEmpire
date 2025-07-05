'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
// Remove dependency on useWalletModal
import { formatWalletAddress } from '@/lib/solana';

export const ChadWalletButton: React.FC = () => {
  const { wallets, select, disconnect, connecting, connected, publicKey } = useWallet();
  // Manage modal visibility internally instead of using useWalletModal
  const [visible, setVisible] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Format the wallet address for display
  const formattedAddress = publicKey ? formatWalletAddress(publicKey.toString()) : '';

  // Handle wallet selection
  const handleWalletClick = (walletName: WalletName) => {
    select(walletName);
    setVisible(false);
    // Add a small delay to allow the wallet adapter to process the selection
    setTimeout(() => {
      // If the wallet requires redirection (like Phantom), this will give time for the redirect
      console.log('Wallet selected:', walletName);
    }, 200);
  };

  // Toggle the Chad's Way info
  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div className="relative">
      {connected && publicKey ? (
        // Connected state - show wallet address
        <button
          onClick={() => disconnect()}
          className="bg-transparent text-chad-neon hover:text-white font-bold py-1.5 px-5 rounded-full text-sm transition-all duration-300 ease-in-out transform hover:scale-105 border-2 border-chad-neon backdrop-blur-sm animate-pulse-slow"
          style={{ 
            boxShadow: '0 0 10px rgba(0, 255, 247, 0.7), 0 0 20px rgba(0, 255, 247, 0.4)', 
            textShadow: '0 0 5px rgba(0, 255, 247, 0.5)' 
          }}
        >
          {formattedAddress}
        </button>
      ) : (
        // Not connected state - show connect button
        <div className="relative">
          <button
            onClick={() => setVisible(true)}
            onMouseEnter={toggleInfo}
            onMouseLeave={toggleInfo}
            className="bg-transparent text-chad-neon hover:text-white font-bold py-1.5 px-5 rounded-full text-sm transition-all duration-300 ease-in-out transform hover:scale-105 border-2 border-chad-neon backdrop-blur-sm animate-pulse-slow"
            style={{ 
              boxShadow: '0 0 10px rgba(0, 255, 247, 0.7), 0 0 20px rgba(0, 255, 247, 0.4)', 
              textShadow: '0 0 5px rgba(0, 255, 247, 0.5)' 
            }}
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          {/* Chad's Way Info Popup */}
          {showInfo && (
            <div className="absolute right-0 mt-2 w-72 bg-gray-900/90 backdrop-blur-md border border-chad-neon rounded-lg shadow-lg p-4 z-50 text-white"
                 style={{ boxShadow: '0 0 15px rgba(0, 255, 247, 0.4)' }}>
              <h3 className="text-chad-neon font-bold mb-2">Chad's Way:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-chad-neon mr-2">1.</span>
                  <span>Buy $CHAD – Join the army.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-chad-neon mr-2">2.</span>
                  <span>Stake like a warlord – Bigger stake = Bigger weight.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-chad-neon mr-2">3.</span>
                  <span>Choose your fate – Steady 0.5% daily or SPIN for up to 3%.</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Wallet Selection Modal */}
      {visible && !connected && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border-2 border-chad-neon rounded-lg p-6 max-w-md w-full"
               style={{ boxShadow: '0 0 20px rgba(0, 255, 247, 0.5)' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-chad-neon">Connect Wallet</h2>
              <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2">
              {wallets.map((walletAdapter) => {
                const ready = walletAdapter.readyState === WalletReadyState.Installed || 
                              walletAdapter.readyState === WalletReadyState.Loadable;
                
                return (
                  <button
                    key={walletAdapter.adapter.name}
                    onClick={() => handleWalletClick(walletAdapter.adapter.name)}
                    disabled={!ready}
                    className={`w-full flex items-center p-3 border ${ready ? 'border-chad-neon/50 hover:border-chad-neon' : 'border-gray-700'} 
                               rounded-lg ${ready ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-800/30'} 
                               transition-all duration-200`}
                  >
                    <div className="w-8 h-8 mr-3 flex-shrink-0">
                      {walletAdapter.adapter.icon && (
                        <img src={walletAdapter.adapter.icon} alt={`${walletAdapter.adapter.name} icon`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${ready ? 'text-white' : 'text-gray-400'}`}>
                        {walletAdapter.adapter.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {!ready && 'Not installed'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h3 className="text-chad-neon font-bold mb-2">Chad's Way:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-chad-neon mr-2">1.</span>
                  <span>Buy $CHAD – Join the army.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-chad-neon mr-2">2.</span>
                  <span>Stake like a warlord – Bigger stake = Bigger weight.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-chad-neon mr-2">3.</span>
                  <span>Choose your fate – Steady 0.5% daily or SPIN for up to 3%.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
