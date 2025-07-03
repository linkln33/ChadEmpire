'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useUserStore } from '@/stores/userStore';
import { formatWalletAddress } from '@/lib/solana';

const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { connected, publicKey } = useWallet();
  const { user, fetchUserData } = useUserStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Fetch user data when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      fetchUserData(publicKey.toString());
    }
  }, [connected, publicKey, fetchUserData]);
  
  // Navigation items
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Game', path: '/game' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Lottery', path: '/lottery' },
    { name: 'Boosters', path: '/boosters' },
    { name: 'Tokenomics', path: '/tokenomics' },
  ];
  
  return (
    <nav className="bg-chad-dark border-b border-gray-800 shadow-lg shadow-chad-pink/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-chad-pink to-chad-purple text-transparent bg-clip-text font-['Anton']">
                ChadEmpire
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${pathname === item.path
                  ? 'text-white bg-gradient-to-r from-chad-pink/20 to-chad-purple/20 border-b-2 border-chad-pink'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-chad-neon'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* User Menu and Wallet Button */}
          <div className="flex items-center">
            {connected && (
              <div className="hidden md:flex items-center mr-4">
                <Link href="/profile" className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2 overflow-hidden">
                    {user?.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">👤</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {user?.username || formatWalletAddress(publicKey?.toString() || '')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {user?.chadScore?.toLocaleString() || '0'} Score
                    </p>
                  </div>
                </Link>
              </div>
            )}
            
            {/* Wallet Button */}
            <div className="flex items-center">
              <WalletMultiButton className="!bg-gradient-to-r !from-chad-pink !to-chad-neon hover:!opacity-90 !rounded-full !transition-all !duration-300 !text-black !font-bold !shadow-lg !shadow-chad-pink/20" />
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden ml-2 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 py-2 px-4">
          {connected && (
            <Link 
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center py-3 border-b border-gray-700"
            >
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3 overflow-hidden">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">👤</span>
                )}
              </div>
              <div>
                <p className="font-medium text-white">
                  {user?.username || formatWalletAddress(publicKey?.toString() || '')}
                </p>
                <p className="text-sm text-gray-400">
                  {user?.chadScore?.toLocaleString() || '0'} Score
                </p>
              </div>
            </Link>
          )}
          
          <div className="space-y-1 pt-2 pb-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.path
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
