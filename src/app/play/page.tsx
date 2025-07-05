'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SpinWheel } from '@/components/spinning/SpinWheel';
import { SpinButton } from '@/components/spinning/SpinButton';
import { SpinResult } from '@/components/spinning/SpinResult';
import { StakeCard } from '@/components/staking/StakeCard';
import { useWallet } from '@solana/wallet-adapter-react';

export default function PlayPage() {
  const { publicKey } = useWallet();
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  
  // Mock stake data - in a real app this would come from your Solana program
  const stakeData = {
    amount: 1000,
    stakedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    lastSpinAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
    canSpin: true,
  };

  const handleSpin = () => {
    setIsSpinning(true);
    setShowResult(false);
    
    // Simulate spin result after animation
    setTimeout(() => {
      // 60% chance to win yield
      const isWin = Math.random() < 0.6;
      
      if (isWin) {
        // 10% chance for jackpot (1-3% yield)
        const isJackpot = Math.random() < 0.1;
        
        const yieldPercentage = isJackpot 
          ? (Math.random() * 2 + 1).toFixed(2) // 1-3%
          : (Math.random() * 0.4 + 0.1).toFixed(2); // 0.1-0.5%
          
        const yieldAmount = (stakeData.amount * Number(yieldPercentage) / 100).toFixed(2);
        
        setSpinResult({
          type: 'win',
          yieldPercentage: `${yieldPercentage}%`,
          yieldAmount,
          message: isJackpot 
            ? 'JACKPOT! Massive yield earned!' 
            : 'Congratulations! You won yield!'
        });
      } else {
        // Consolation prizes
        const consolationTypes = ['lottery_ticket', 'chad_score', 'booster_fragment', 'bonus_spin'];
        const weights = [50, 30, 15, 5]; // Probabilities as per whitepaper
        
        // Weighted random selection
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        let selectedIndex = 0;
        
        for (let i = 0; i < weights.length; i++) {
          random -= weights[i];
          if (random <= 0) {
            selectedIndex = i;
            break;
          }
        }
        
        const consolationType = consolationTypes[selectedIndex];
        let consolationAmount = 1;
        let message = '';
        
        switch (consolationType) {
          case 'lottery_ticket':
            message = 'You earned a lottery ticket for the weekly draw!';
            break;
          case 'chad_score':
            consolationAmount = Math.floor(Math.random() * 50) + 10; // 10-60 points
            message = `Your Chad Score increased by ${consolationAmount} points!`;
            break;
          case 'booster_fragment':
            message = 'You collected a Booster Fragment! Collect 5 to mint a Booster NFT.';
            break;
          case 'bonus_spin':
            message = 'RARE REWARD! You earned a Bonus Spin token!';
            break;
        }
        
        setSpinResult({
          type: 'consolation',
          consolationType,
          consolationAmount,
          message
        });
      }
      
      setIsSpinning(false);
      setShowResult(true);
    }, 3000); // Match this with the spin animation duration
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {!publicKey ? (
            <div className="text-center py-20">
              <h1 className="text-3xl font-bold mb-6">Connect Your Wallet to Play</h1>
              <p className="text-gray-400 mb-8">You need to connect your Solana wallet to start spinning and earning yield.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Stake Info */}
              <div className="lg:col-span-1">
                <StakeCard stakeData={stakeData} />
                
                <div className="mt-6 chad-card">
                  <h3 className="text-xl font-bold mb-4 text-chad-accent">Your Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Spins</span>
                      <span className="font-semibold">42</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win Rate</span>
                      <span className="font-semibold">58.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Chad Score</span>
                      <span className="font-semibold text-chad-primary">1,240</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Leaderboard Rank</span>
                      <span className="font-semibold">#87</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Center Column - Spin Wheel */}
              <div className="lg:col-span-1 flex flex-col items-center">
                <SpinWheel isSpinning={isSpinning} />
                <div className="mt-6">
                  <SpinButton onSpin={handleSpin} disabled={isSpinning || !stakeData.canSpin} />
                </div>
                
                {showResult && (
                  <div className="mt-8">
                    <SpinResult result={spinResult} />
                  </div>
                )}
              </div>
              
              {/* Right Column - Booster & Lottery Info */}
              <div className="lg:col-span-1">
                <div className="chad-card mb-6">
                  <h3 className="text-xl font-bold mb-4 text-chad-accent">Your Boosters</h3>
                  <div className="space-y-4">
                    <p className="text-gray-400">You have no active boosters.</p>
                    <div className="flex items-center justify-between">
                      <span>Booster Fragments</span>
                      <span className="bg-chad-dark px-3 py-1 rounded-full text-sm">3/5</span>
                    </div>
                    <button className="w-full bg-chad-primary/20 hover:bg-chad-primary/30 text-chad-primary font-semibold py-2 rounded-lg transition-colors">
                      View Boosters
                    </button>
                  </div>
                </div>
                
                <div className="chad-card">
                  <h3 className="text-xl font-bold mb-4 text-chad-accent">Lottery</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Your Tickets</span>
                      <span className="bg-chad-dark px-3 py-1 rounded-full text-sm">2</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Next Draw</span>
                      <span className="bg-chad-dark px-3 py-1 rounded-full text-sm">2d 14h 22m</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Prize Pool</span>
                      <span className="text-chad-accent font-bold">1,450 $CHAD</span>
                    </div>
                    <button className="w-full bg-chad-primary/20 hover:bg-chad-primary/30 text-chad-primary font-semibold py-2 rounded-lg transition-colors">
                      View Lottery
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
