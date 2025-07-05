'use client';

import { useState } from 'react';
import { StakeForm } from './StakeForm';
import { UnstakeForm } from './UnstakeForm';

interface StakeData {
  amount: number;
  stakedAt: Date;
  lastSpinAt: Date;
  canSpin: boolean;
}

interface StakeCardProps {
  stakeData: StakeData;
}

export function StakeCard({ stakeData }: StakeCardProps) {
  const [showStakeForm, setShowStakeForm] = useState(false);
  const [showUnstakeForm, setShowUnstakeForm] = useState(false);
  
  // Calculate time since staking
  const daysSinceStake = Math.floor((Date.now() - stakeData.stakedAt.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate unstaking penalty based on time staked
  const getPenaltyPercentage = () => {
    if (daysSinceStake < 1) return '50%';
    if (daysSinceStake < 2) return '25%';
    if (daysSinceStake < 4) return '10%';
    return '0%';
  };
  
  // Format next spin time
  const getNextSpinTime = () => {
    const nextSpinTime = new Date(stakeData.lastSpinAt);
    nextSpinTime.setHours(nextSpinTime.getHours() + 24);
    
    const now = new Date();
    if (now > nextSpinTime) return 'Available now';
    
    const diffMs = nextSpinTime.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <div className="chad-card">
      <h2 className="text-2xl font-bold mb-6 text-chad-accent">Your Stake</h2>
      
      {stakeData.amount > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Staked Amount</span>
            <span className="text-2xl font-bold">{stakeData.amount} $CHAD</span>
          </div>
          
          <div className="bg-chad-dark/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Staked For</span>
              <span>{daysSinceStake} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Next Spin</span>
              <span>{getNextSpinTime()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Unstaking Penalty</span>
              <span className={`${getPenaltyPercentage() === '0%' ? 'text-chad-success' : 'text-chad-error'}`}>
                {getPenaltyPercentage()}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setShowStakeForm(true);
                setShowUnstakeForm(false);
              }}
              className="flex-1 bg-chad-primary/20 hover:bg-chad-primary/30 text-chad-primary font-semibold py-2 rounded-lg transition-colors"
            >
              Add Stake
            </button>
            <button
              onClick={() => {
                setShowUnstakeForm(true);
                setShowStakeForm(false);
              }}
              className="flex-1 bg-chad-dark hover:bg-chad-dark/70 text-white font-semibold py-2 rounded-lg border border-chad-primary/30 transition-colors"
            >
              Unstake
            </button>
          </div>
          
          {showStakeForm && (
            <StakeForm 
              currentStake={stakeData.amount} 
              onClose={() => setShowStakeForm(false)} 
            />
          )}
          
          {showUnstakeForm && (
            <UnstakeForm 
              currentStake={stakeData.amount} 
              penaltyPercentage={parseInt(getPenaltyPercentage())} 
              onClose={() => setShowUnstakeForm(false)} 
            />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-gray-400">You haven't staked any $CHAD tokens yet. Stake to start spinning and earning yield!</p>
          
          <button
            onClick={() => setShowStakeForm(true)}
            className="w-full bg-chad-primary hover:bg-chad-primary/90 text-white font-bold py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Stake $CHAD
          </button>
          
          {showStakeForm && (
            <StakeForm 
              currentStake={0} 
              onClose={() => setShowStakeForm(false)} 
            />
          )}
        </div>
      )}
    </div>
  );
}
