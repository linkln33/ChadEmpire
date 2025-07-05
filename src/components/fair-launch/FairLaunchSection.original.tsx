'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ChadWalletButton } from '../wallet/ChadWalletButton';
import WhitelistSystem from './WhitelistSystem';
import WhitelistLeaderboard from './WhitelistLeaderboard';

interface FairLaunchStats {
  launchDate: Date;
  amountRaised: number;
  totalTarget: number;
  chadPrice: number;
  tokensRemaining: number;
  totalTokens: number;
}

interface WhitelistStatus {
  isWhitelisted: boolean;
  tier: number;
  maxAllocation: number;
}

const FairLaunchSection: React.FC = () => {
  const { connected } = useWallet();
  const [solAmount, setSolAmount] = useState<string>('');
  const [isLaunched, setIsLaunched] = useState<boolean>(false);
  const [whitelistStatus, setWhitelistStatus] = useState<WhitelistStatus | null>(null);
  
  // Mock data - would be fetched from blockchain in production
  const launchStats: FairLaunchStats = {
    launchDate: new Date('2025-08-01T00:00:00Z'),
    amountRaised: 2450,
    totalTarget: 10000,
    chadPrice: 0.00001,
    tokensRemaining: 200000000,
    totalTokens: 300000000
  };
  
  // Calculate CHAD amount based on SOL input
  const calculateChadAmount = (): number => {
    const solValue = parseFloat(solAmount) || 0;
    return solValue / launchStats.chadPrice;
  };
  
  // Handle buy action
  const handleBuy = () => {
    // Would connect to blockchain transaction in production
    // Check whitelist status and allocation limits
    if (whitelistStatus) {
      const solValue = parseFloat(solAmount) || 0;
      if (solValue <= 0) {
        alert('Please enter a valid SOL amount');
        return;
      }
      
      if (solValue > whitelistStatus.maxAllocation) {
        alert(`You can only contribute up to ${whitelistStatus.maxAllocation} SOL based on your tier`);
        return;
      }
      
      // In production, this would initiate a blockchain transaction
      alert(`Processing purchase: ${solValue} SOL for ${calculateChadAmount()} CHAD tokens`);
    } else {
      alert('You need to be whitelisted to participate');
    }
  };
  
  // Handle whitelist status change from WhitelistSystem component
  const handleWhitelistStatusChange = (status: WhitelistStatus) => {
    setWhitelistStatus(status);
  };
  
  // Calculate time remaining until launch
  const timeRemaining = useMemo(() => {
    const now = new Date();
    const diff = launchStats.launchDate.getTime() - now.getTime();
    
    if (diff <= 0) {
      setIsLaunched(true);
      return { days: 0, hours: 0, minutes: 0 };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  }, [launchStats.launchDate]);
  
  // Update timer every minute
  useEffect(() => {
    if (isLaunched) return;
    
    const timer = setInterval(() => {
      const now = new Date();
      if (now >= launchStats.launchDate) {
        setIsLaunched(true);
        clearInterval(timer);
      }
    }, 60000);
    
    return () => clearInterval(timer);
  }, [isLaunched, launchStats.launchDate]);
  
  // Calculate progress percentage
  const progressPercentage = Math.min(100, Math.round((launchStats.amountRaised / launchStats.totalTarget) * 100));
  
  // Calculate tokens sold
  const tokensSold = launchStats.totalTokens - launchStats.tokensRemaining;
  const tokensSoldPercentage = Math.round((tokensSold / launchStats.totalTokens) * 100);
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-chad-gold to-chad-pink text-transparent bg-clip-text">
              Fair Launch
            </span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Join the ChadEmpire fair launch with tiered allocation based on your SOL holdings and social engagement.
          </p>
        </div>
        
        {/* Launch Status */}
        <div className="bg-black/30 p-6 rounded-lg border border-gray-800 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h3 className="text-xl font-bold mb-4 md:mb-0">
              <span className="bg-gradient-to-r from-chad-gold to-chad-pink text-transparent bg-clip-text">
                {isLaunched ? 'Fair Launch Live!' : 'Fair Launch Countdown'}
              </span>
            </h3>
            
            {!isLaunched && (
              <div className="flex space-x-4 text-center">
                <div className="bg-black/50 px-4 py-2 rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-white">{timeRemaining.days}</div>
                  <div className="text-xs text-gray-400">Days</div>
                </div>
                <div className="bg-black/50 px-4 py-2 rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-white">{timeRemaining.hours}</div>
                  <div className="text-xs text-gray-400">Hours</div>
                </div>
                <div className="bg-black/50 px-4 py-2 rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-white">{timeRemaining.minutes}</div>
                  <div className="text-xs text-gray-400">Minutes</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-white font-bold">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-chad-gold to-chad-pink h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-400">{launchStats.amountRaised} SOL raised</span>
              <span className="text-gray-400">Target: {launchStats.totalTarget} SOL</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-black/50 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">CHAD Price</div>
              <div className="text-xl font-bold text-white">{launchStats.chadPrice} SOL</div>
            </div>
            <div className="bg-black/50 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Tokens Remaining</div>
              <div className="text-xl font-bold text-white">{(launchStats.tokensRemaining / 1000000).toFixed(1)}M</div>
            </div>
            <div className="bg-black/50 p-4 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Tokens Sold</div>
              <div className="text-xl font-bold text-white">{tokensSoldPercentage}%</div>
            </div>
          </div>
          
          {isLaunched && (
            <div className="bg-black/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-lg font-bold text-white mb-4">Buy CHAD Tokens</h4>
              
              {!connected ? (
                <div className="text-center py-4">
                  <p className="text-gray-300 mb-4">Connect your wallet to participate</p>
                  <ChadWalletButton />
                </div>
              ) : !whitelistStatus?.isWhitelisted ? (
                <div className="text-center py-4">
                  <p className="text-red-500 font-bold mb-2">Not Whitelisted</p>
                  <p className="text-gray-300">You need to be whitelisted to participate in the fair launch.</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="flex-1">
                      <label className="block text-gray-400 text-sm mb-1">Amount (SOL)</label>
                      <input
                        type="number"
                        value={solAmount}
                        onChange={(e) => setSolAmount(e.target.value)}
                        placeholder="0.0"
                        min="0"
                        max={whitelistStatus?.maxAllocation || 0}
                        className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-chad-neon"
                      />
                      <p className="text-xs text-gray-500 mt-1">Max: {whitelistStatus?.maxAllocation} SOL</p>
                    </div>
                    <div className="mx-4 text-gray-500">→</div>
                    <div className="flex-1">
                      <label className="block text-gray-400 text-sm mb-1">CHAD Tokens</label>
                      <div className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-2 text-white">
                        {calculateChadAmount().toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleBuy}
                    disabled={!parseFloat(solAmount) || parseFloat(solAmount) > (whitelistStatus?.maxAllocation || 0)}
                    className="w-full bg-gradient-to-r from-chad-gold to-chad-pink text-black font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy CHAD Tokens
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Whitelist System */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6">
            <span className="bg-gradient-to-r from-chad-gold to-chad-pink text-transparent bg-clip-text">Whitelist System</span>
          </h3>
          
          <WhitelistSystem onWhitelistStatusChange={handleWhitelistStatusChange} />
        </div>
        
        {/* Whitelist Leaderboard */}
        <WhitelistLeaderboard className="mb-12" />
      </div>
    </section>
  );
};

export default FairLaunchSection;
