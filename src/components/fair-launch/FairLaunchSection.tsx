'use client';

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ChadWalletButton } from '../wallet/ChadWalletButton';
import SectionTitle from '../common/SectionTitle';
import { DeferredRender } from '../../utils/performance';
import OptimizedImage from '../common/OptimizedImage';
import { motion } from 'framer-motion';

// Lazy load components for better initial loading performance
const WhitelistSystem = lazy(() => import('./WhitelistSystem'));
const WhitelistLeaderboard = lazy(() => import('./WhitelistLeaderboard'));

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

interface DailyAllocation {
  day: number;
  date: Date;
  supply: number;
  percentSold: number;
  isActive: boolean;
  isSoldOut: boolean;
  isComingSoon: boolean;
}

const FairLaunchSection: React.FC = () => {
  const { connected } = useWallet();
  const [solAmount, setSolAmount] = useState<string>('');
  const [isLaunched, setIsLaunched] = useState<boolean>(false);
  const [whitelistStatus, setWhitelistStatus] = useState<WhitelistStatus | null>(null);
  const [showWhitelistInfo, setShowWhitelistInfo] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // Mock data - would be fetched from blockchain in production
  const launchStats: FairLaunchStats = useMemo(() => ({
    launchDate: new Date('2025-08-01T00:00:00Z'),
    amountRaised: 2450,
    totalTarget: 10000,
    chadPrice: 0.00001,
    tokensRemaining: 200000000,
    totalTokens: 300000000
  }), []);
  
  // Mock data for 7-day allocation
  const dailyAllocations: DailyAllocation[] = useMemo(() => {
    const startDate = new Date('2025-08-01T00:00:00Z');
    const totalSupply = 300000000; // 300M tokens
    
    // Generate random supply distribution for 7 days that adds up to totalSupply
    const generateRandomSupplies = () => {
      const randomValues = Array(7).fill(0).map(() => Math.random());
      const sum = randomValues.reduce((a, b) => a + b, 0);
      const normalizedValues = randomValues.map(v => v / sum);
      return normalizedValues.map(v => Math.round(v * totalSupply));
    };
    
    const supplies = generateRandomSupplies();
    
    return Array(7).fill(0).map((_, index) => {
      const day = index + 1;
      const date = new Date(startDate);
      date.setDate(date.getDate() + index);
      
      // Day 1 is sold out, day 2 is active, days 3-7 are coming soon
      return {
        day,
        date,
        supply: supplies[index],
        percentSold: day === 1 ? 100 : day === 2 ? 45 : 0,
        isActive: day === 2,
        isSoldOut: day === 1,
        isComingSoon: day > 2
      };
    });
  }, []);
  
  // Memoize the CHAD amount calculation to prevent unnecessary recalculations
  const chadAmount = useMemo(() => {
    const solValue = parseFloat(solAmount) || 0;
    return solValue / launchStats.chadPrice;
  }, [solAmount, launchStats.chadPrice]);
  
  // Function to calculate CHAD amount (used in places where a function is needed)
  const calculateChadAmount = useCallback((): number => {
    const solValue = parseFloat(solAmount) || 0;
    return solValue / launchStats.chadPrice;
  }, [solAmount, launchStats.chadPrice]);
  
  // Handle buy action with proper type checking
  const handleBuy = useCallback(() => {
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
  }, [whitelistStatus, solAmount, calculateChadAmount]);
  
  // Toggle whitelist info visibility
  const toggleWhitelistInfo = useCallback(() => {
    setShowWhitelistInfo(prev => !prev);
  }, []);
  
  // Handle whitelist status change from WhitelistSystem component
  const handleWhitelistStatusChange = useCallback((status: WhitelistStatus) => {
    setWhitelistStatus(status);
  }, []);
  
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
  
  // Memoize progress percentage calculation
  const progressPercentage = useMemo(() => {
    return Math.min(100, Math.round((launchStats.amountRaised / launchStats.totalTarget) * 100));
  }, [launchStats.amountRaised, launchStats.totalTarget]);
  
  // Memoize tokens sold calculation
  const tokensSold = useMemo(() => {
    return launchStats.totalTokens - launchStats.tokensRemaining;
  }, [launchStats.totalTokens, launchStats.tokensRemaining]);
  
  // Memoize tokens sold percentage
  const tokensSoldPercentage = useMemo(() => {
    return Math.round((tokensSold / launchStats.totalTokens) * 100);
  }, [tokensSold, launchStats.totalTokens]);
  
  // Memoize the launch status section for better performance
  const LaunchStatusSection = useMemo(() => (
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
                    {chadAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
  ), [isLaunched, timeRemaining, progressPercentage, launchStats, tokensSoldPercentage, connected, whitelistStatus, solAmount, chadAmount, handleBuy]);
  
  // Memoize the 7-day allocation cards
  const AllocationCardsSection = useMemo(() => (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-3">
        <span className="bg-gradient-to-r from-chad-gold to-chad-pink text-transparent bg-clip-text">
          7-Day Random Allocation
        </span>
      </h3>
      
      <p className="text-gray-300 mb-6 max-w-3xl">
        Each day of our 7-day fair launch has a random allocation of CHAD tokens. Participate during active days to secure your tokens before they're gone!
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {dailyAllocations.map((allocation) => (
          <motion.div 
            key={allocation.day}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`
              bg-gradient-to-br ${allocation.isActive ? 'from-chad-dark/90 to-black/90' : 'from-black/80 to-black/60'} 
              p-4 rounded-xl border-2 cursor-pointer transition-all
              ${allocation.isActive ? 'border-lime-400' : 
                allocation.isSoldOut ? 'border-red-500' : 
                'border-yellow-500/30'}
            `}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="bg-black/50 px-2 py-0.5 rounded-full border border-gray-700">
                <span className="text-white font-bold text-sm">Day {allocation.day}</span>
              </div>
              {allocation.isActive && (
                <div className="bg-lime-500/20 px-2 py-0.5 rounded-full border border-lime-500/50">
                  <span className="text-lime-400 font-bold text-xs">ACTIVE</span>
                </div>
              )}
              {allocation.isSoldOut && (
                <div className="bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/50">
                  <span className="text-red-500 font-bold text-xs">SOLD OUT</span>
                </div>
              )}
              {allocation.isComingSoon && (
                <div className="bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/30">
                  <span className="text-yellow-500/70 font-bold text-xs">SOON</span>
                </div>
              )}
            </div>
            
            <div className="text-gray-400 text-xs mb-0.5">Date</div>
            <div className="text-white font-medium text-sm mb-2">
              {allocation.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            
            <div className="text-gray-400 text-xs mb-0.5">Supply</div>
            <div className="text-base font-bold text-white mb-2">
              {(allocation.supply / 1000000).toFixed(1)}M
            </div>
            
            {allocation.isActive && (
              <>
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-400 text-xs">Sold</span>
                    <span className="text-white text-xs">{allocation.percentSold}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-lime-400 to-green-500 h-1 rounded-full" 
                      style={{ width: `${allocation.percentSold}%` }}
                    ></div>
                  </div>
                </div>
                
                <button
                  disabled={!connected || !whitelistStatus?.isWhitelisted}
                  className="w-full mt-1 bg-gradient-to-r from-lime-400 to-green-500 text-black text-xs font-bold py-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Participate
                </button>
              </>
            )}
            
            {allocation.isSoldOut && (
              <div className="w-full mt-1 bg-red-500/20 text-red-500 text-xs font-bold py-1.5 rounded-lg text-center">
                Sold Out
              </div>
            )}
            
            {allocation.isComingSoon && (
              <div className="w-full mt-1 bg-yellow-500/10 text-yellow-500/70 text-xs font-bold py-1.5 rounded-lg text-center border border-yellow-500/20">
                Coming Soon
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  ), [dailyAllocations, connected, whitelistStatus]);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <SectionTitle>
            <span className="bg-gradient-to-r from-chad-gold to-chad-pink text-transparent bg-clip-text">
              Fair Launch
            </span>
          </SectionTitle>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Join the ChadEmpire fair launch with tiered allocation based on your SOL holdings and social engagement.
          </p>
        </div>
        
        {/* Launch Status - Memoized for better performance */}
        <DeferredRender>
          {LaunchStatusSection}
        </DeferredRender>
        
        {/* 7-Day Allocation Cards */}
        <DeferredRender>
          {AllocationCardsSection}
        </DeferredRender>
        
        {/* Whitelist System - Lazy loaded with Suspense */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              <span className="bg-gradient-to-r from-chad-gold to-chad-pink text-transparent bg-clip-text">Whitelist System</span>
            </h3>
            <button 
              onClick={toggleWhitelistInfo}
              className="text-sm bg-black/30 border border-gray-700 rounded-lg px-3 py-1 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
            >
              {showWhitelistInfo ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {showWhitelistInfo && (
            <div className="mb-8">
              <Suspense fallback={
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-chad-neon"></div>
                </div>
              }>
                <WhitelistSystem onWhitelistStatusChange={handleWhitelistStatusChange} />
              </Suspense>
            </div>
          )}
          
          {/* Whitelist Leaderboard */}
          <Suspense fallback={
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-chad-neon"></div>
            </div>
          }>
            <WhitelistLeaderboard className="mb-12" />
          </Suspense>
        </div>
      </div>
    </section>
  );
};

export default FairLaunchSection;
