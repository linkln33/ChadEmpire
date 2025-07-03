'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';
import SpinWheel from '@/components/game/SpinWheel';
import SpinResult from '@/components/game/SpinResult';
import { StakeForm } from '@/components/staking/StakeForm';
import { UnstakeForm } from '@/components/staking/UnstakeForm';
import Link from 'next/link';

export default function GamePage() {
  const { connected, publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState('spin');
  const [showSpinResult, setShowSpinResult] = useState(false);
  
  // User store state
  const { 
    stakes, 
    spins, 
    user,
    totalYieldEarned: getTotalYieldEarned,
    canSpinToday,
    fetchUserData
  } = useUserStore();
  
  // Computed values from user store
  const totalYieldEarned = getTotalYieldEarned();
  const chadScore = user?.chadScore || 0;
  
  // Game store state
  const { 
    systemStats,
    lastSpinResult
  } = useGameStore();
  
  // Fetch user data on component mount
  useEffect(() => {
    if (connected && publicKey) {
      fetchUserData(publicKey.toString());
    }
  }, [connected, publicKey, fetchUserData]);
  
  // Show spin result when available
  useEffect(() => {
    if (lastSpinResult) {
      setShowSpinResult(true);
    }
  }, [lastSpinResult]);
  
  // Calculate time until next spin
  const getNextSpinTime = () => {
    if (spins.length === 0) return 'Now';
    
    const lastSpin = [...spins].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    
    const now = new Date();
    const lastSpinDate = new Date(lastSpin.createdAt);
    
    // If can spin today, return Now
    if (canSpinToday()) return 'Now';
    
    // Otherwise calculate time until midnight
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">ChadEmpire Spin Game</h1>
      
      {!connected ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="mb-6">Connect your Solana wallet to start playing and earning yield!</p>
          <p className="text-gray-400">Use the wallet button in the top right corner</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Stats */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Your Stats</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Total Staked</p>
                <p className="text-2xl font-bold">
                  {stakes.reduce((total, stake) => total + stake.amount, 0).toLocaleString()} $CHAD
                </p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Total Yield Earned</p>
                <p className="text-2xl font-bold text-green-500">
                  {totalYieldEarned.toLocaleString()} $CHAD
                </p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Chad Score</p>
                <p className="text-2xl font-bold text-orange-500">
                  {(chadScore || 0).toLocaleString()} points
                </p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Total Spins</p>
                <p className="text-2xl font-bold">
                  {spins.length}
                </p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Next Spin Available</p>
                <p className="text-2xl font-bold">
                  {getNextSpinTime()}
                </p>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <Link href="/boosters" className="block w-full bg-purple-600 hover:bg-purple-700 text-center py-2 rounded-lg">
                My Boosters
              </Link>
              <Link href="/lottery" className="block w-full bg-blue-600 hover:bg-blue-700 text-center py-2 rounded-lg">
                Lottery
              </Link>
              <Link href="/leaderboard" className="block w-full bg-orange-600 hover:bg-orange-700 text-center py-2 rounded-lg">
                Leaderboard
              </Link>
            </div>
          </div>
          
          {/* Middle Column - Game Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex border-b border-gray-700 mb-6">
                <button
                  onClick={() => setActiveTab('spin')}
                  className={`px-4 py-2 ${
                    activeTab === 'spin'
                      ? 'border-b-2 border-green-500 text-white'
                      : 'text-gray-400'
                  }`}
                >
                  Spin to Win
                </button>
                <button
                  onClick={() => setActiveTab('stake')}
                  className={`px-4 py-2 ${
                    activeTab === 'stake'
                      ? 'border-b-2 border-green-500 text-white'
                      : 'text-gray-400'
                  }`}
                >
                  Stake $CHAD
                </button>
                <button
                  onClick={() => setActiveTab('unstake')}
                  className={`px-4 py-2 ${
                    activeTab === 'unstake'
                      ? 'border-b-2 border-green-500 text-white'
                      : 'text-gray-400'
                  }`}
                >
                  Unstake $CHAD
                </button>
              </div>
              
              {activeTab === 'spin' && (
                <div className="flex flex-col items-center">
                  <SpinWheel onSpinComplete={() => setShowSpinResult(true)} />
                </div>
              )}
              
              {activeTab === 'stake' && (
                <div className="max-w-md mx-auto">
                  <StakeForm 
                    currentStake={stakes.reduce((total, stake) => total + stake.amount, 0)} 
                    onClose={() => {}} 
                  />
                </div>
              )}
              
              {activeTab === 'unstake' && (
                <div className="max-w-md mx-auto">
                  <UnstakeForm 
                    currentStake={stakes.reduce((total, stake) => total + stake.amount, 0)} 
                    penaltyPercentage={10} 
                    onClose={() => {}} 
                  />
                </div>
              )}
            </div>
            
            {/* System Stats */}
            <div className="bg-gray-800 rounded-lg p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">System Stats</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Total Users</p>
                  <p className="text-lg font-bold">{systemStats.totalUsers.toLocaleString()}</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Total Staked</p>
                  <p className="text-lg font-bold">{systemStats.totalStaked.toLocaleString()} $CHAD</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Total Spins</p>
                  <p className="text-lg font-bold">{systemStats.totalSpins.toLocaleString()}</p>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Yield Paid</p>
                  <p className="text-lg font-bold">{systemStats.totalYieldPaid.toLocaleString()} $CHAD</p>
                </div>
              </div>
              
              <div className="mt-4 bg-blue-900 bg-opacity-50 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-gray-300 text-sm">Current Lottery Pool</p>
                  <p className="text-xl font-bold text-blue-400">{systemStats.lotteryPool.toLocaleString()} $CHAD</p>
                </div>
                <Link href="/lottery" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm">
                  Join Lottery
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Spin Result Modal */}
      {showSpinResult && (
        <SpinResult onClose={() => setShowSpinResult(false)} />
      )}
    </div>
  );
}
