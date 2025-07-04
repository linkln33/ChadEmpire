'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ChadWalletButton } from '../wallet/ChadWalletButton';

interface FairLaunchStats {
  launchDate: Date;
  amountRaised: number;
  totalTarget: number;
  chadPrice: number;
  tokensRemaining: number;
  totalTokens: number;
}

const FairLaunchSection: React.FC = () => {
  const { connected } = useWallet();
  const [solAmount, setSolAmount] = useState<string>('');
  const [isLaunched, setIsLaunched] = useState<boolean>(false);
  
  // Mock data - would be fetched from blockchain in production
  const launchStats: FairLaunchStats = {
    launchDate: new Date('2025-08-01T00:00:00Z'),
    amountRaised: 2450,
    totalTarget: 10000,
    chadPrice: 0.00001,
    tokensRemaining: 200000000,
    totalTokens: 300000000
  };
  
  const calculateChadAmount = (): number => {
    const solValue = parseFloat(solAmount) || 0;
    return solValue / launchStats.chadPrice;
  };
  
  const handleBuy = () => {
    // Would connect to blockchain transaction in production
    alert(`Buying ${calculateChadAmount().toLocaleString()} $CHAD tokens for ${solAmount} SOL`);
  };
  
  const handleClaim = () => {
    // Would connect to blockchain transaction in production
    alert('Claiming your $CHAD tokens');
  };
  
  // Calculate time remaining until launch
  const calculateTimeRemaining = (): { days: number; hours: number; minutes: number; seconds: number } => {
    const now = new Date();
    const difference = launchStats.launchDate.getTime() - now.getTime();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  };
  
  const timeRemaining = calculateTimeRemaining();
  const progressPercentage = (launchStats.amountRaised / launchStats.totalTarget) * 100;
  
  return (
    <section id="fair-launch" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-chad-dark to-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          <span className="bg-gradient-to-r from-chad-gold to-chad-pink text-transparent bg-clip-text">Fair Launch</span>
        </h2>
        <p className="text-center text-gray-300 mb-8 max-w-3xl mx-auto">
          Join the Chad Empire early and secure your position as a founding Chad. Fair distribution, no team allocation.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Stats & Countdown */}
          <div className="bg-gradient-to-br from-chad-dark/80 to-black p-6 rounded-xl border border-gray-800 shadow-lg">
            {/* Countdown Timer */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-chad-neon text-center">Launch Countdown</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-black/50 p-3 rounded-lg border border-chad-neon/30">
                  <div className="text-3xl font-bold text-white">{timeRemaining.days}</div>
                  <div className="text-xs text-gray-400">DAYS</div>
                </div>
                <div className="bg-black/50 p-3 rounded-lg border border-chad-neon/30">
                  <div className="text-3xl font-bold text-white">{timeRemaining.hours}</div>
                  <div className="text-xs text-gray-400">HOURS</div>
                </div>
                <div className="bg-black/50 p-3 rounded-lg border border-chad-neon/30">
                  <div className="text-3xl font-bold text-white">{timeRemaining.minutes}</div>
                  <div className="text-xs text-gray-400">MINUTES</div>
                </div>
                <div className="bg-black/50 p-3 rounded-lg border border-chad-neon/30">
                  <div className="text-3xl font-bold text-white">{timeRemaining.seconds}</div>
                  <div className="text-xs text-gray-400">SECONDS</div>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Amount Raised</span>
                <span className="text-chad-gold font-bold">{launchStats.amountRaised} SOL / {launchStats.totalTarget} SOL</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-chad-pink to-chad-gold h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Token Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                <div className="text-sm text-gray-400">$CHAD Price</div>
                <div className="text-xl font-bold text-chad-neon">{launchStats.chadPrice} SOL</div>
              </div>
              <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                <div className="text-sm text-gray-400">Tokens Remaining</div>
                <div className="text-xl font-bold text-chad-neon">{(launchStats.tokensRemaining / 1000000).toFixed(1)}M</div>
              </div>
            </div>
          </div>
          
          {/* Buy Interface */}
          <div className="bg-gradient-to-br from-chad-dark/80 to-black p-6 rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-xl font-bold mb-6 text-chad-neon text-center">
              {isLaunched ? 'Claim Your $CHAD Tokens' : 'Buy $CHAD Tokens'}
            </h3>
            
            {!connected ? (
              <div className="text-center py-8">
                <p className="text-gray-300 mb-6">Connect your wallet to participate in the fair launch</p>
                <div className="flex justify-center">
                  <ChadWalletButton />
                </div>
              </div>
            ) : isLaunched ? (
              <div className="text-center py-8">
                <p className="text-gray-300 mb-6">Your allocation: <span className="text-chad-gold font-bold">125,000 $CHAD</span></p>
                <button 
                  onClick={handleClaim}
                  className="bg-gradient-to-r from-chad-pink to-chad-neon text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-chad-neon/50 transition-all duration-300 w-full"
                >
                  Claim $CHAD Tokens
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <label className="block text-gray-400 mb-2">Enter SOL Amount</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={solAmount}
                      onChange={(e) => setSolAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-black/50 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-chad-neon focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">SOL</div>
                  </div>
                  <div className="mt-2 text-right text-gray-400">
                    You will receive: <span className="text-chad-gold">{calculateChadAmount().toLocaleString()} $CHAD</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleBuy}
                  disabled={!solAmount || parseFloat(solAmount) <= 0}
                  className={`bg-gradient-to-r from-chad-pink to-chad-neon text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 w-full ${
                    !solAmount || parseFloat(solAmount) <= 0 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:shadow-chad-neon/50'
                  }`}
                >
                  Buy $CHAD Tokens
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Leaderboard */}
        <div className="bg-gradient-to-br from-chad-dark/80 to-black p-6 rounded-xl border border-gray-800 shadow-lg">
          <h3 className="text-xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-chad-gold to-chad-pink text-transparent bg-clip-text">Top Chad Buyers</span>
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-3 px-4 text-left text-gray-400">Rank</th>
                  <th className="py-3 px-4 text-left text-gray-400">Wallet</th>
                  <th className="py-3 px-4 text-right text-gray-400">Amount</th>
                  <th className="py-3 px-4 text-right text-gray-400">Bonus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  { rank: 1, wallet: '8xH7...9pQr', amount: 500, bonus: '10%' },
                  { rank: 2, wallet: '3jK9...2mNb', amount: 350, bonus: '7%' },
                  { rank: 3, wallet: '5tG2...7vXz', amount: 275, bonus: '5%' },
                  { rank: 4, wallet: '9pL4...1cVb', amount: 200, bonus: '3%' },
                  { rank: 5, wallet: '2qR8...6dKj', amount: 150, bonus: '2%' }
                ].map((entry, index) => (
                  <tr key={index} className="hover:bg-black/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center mr-2
                          ${index === 0 ? 'bg-chad-gold text-black' : 
                            index === 1 ? 'bg-gray-300 text-black' : 
                            index === 2 ? 'bg-amber-700 text-white' : 'bg-gray-800 text-gray-400'}
                        `}>
                          {entry.rank}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-300">{entry.wallet}</td>
                    <td className="py-3 px-4 text-right text-white font-bold">{entry.amount} SOL</td>
                    <td className="py-3 px-4 text-right text-chad-neon">{entry.bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Top buyers receive bonus $CHAD tokens and exclusive NFT rewards
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FairLaunchSection;
