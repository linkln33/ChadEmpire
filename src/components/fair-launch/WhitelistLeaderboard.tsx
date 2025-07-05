'use client';

import React, { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { shortenAddress } from '../../utils/address';
import { DeferredRender } from '../ui/DeferredRender';
import { motion } from 'framer-motion';

// Badge types
const BADGES = {
  OG_CHAD: { name: 'OG CHAD', color: 'bg-gradient-to-r from-chad-gold to-amber-500' },
  SUPER_DEGEN: { name: 'Super Degen', color: 'bg-gradient-to-r from-chad-pink to-purple-600' },
  SPIN_LORD: { name: 'Spin Lord', color: 'bg-gradient-to-r from-chad-neon to-cyan-600' },
  TIER_1_COLLECTOR: { name: 'Tier 1 Collector', color: 'bg-gradient-to-r from-gray-300 to-gray-400' }
};

// Define types for leaderboard entries
interface ReferralLeader {
  wallet: string;
  referrals: number;
  solVolume: number;
  badges: string[];
}

interface TaskLeader {
  wallet: string;
  points: number;
  tasks: number;
  badges: string[];
}

type LeaderboardEntry = ReferralLeader | TaskLeader;

// Mock data for leaderboard
const MOCK_REFERRAL_LEADERS: ReferralLeader[] = [
  { wallet: '8xzt3dDkdFWWJ4BXmkWNZGqyqUMFCkLi5QE2WzNNXQNY', referrals: 42, solVolume: 1250, badges: ['gold_referrer', 'early_supporter'] },
  { wallet: '6yKHERk8rsbmJxvMpPuwPs1oRWgCCVnhqBWWp47Yhf7t', referrals: 38, solVolume: 980, badges: ['silver_referrer', 'community_builder'] },
  { wallet: '2ZJf7HgcjgN4wKxRcMpHxMGaEXMiNFW1nN2Vf6UJzWcE', referrals: 29, solVolume: 720, badges: ['bronze_referrer'] },
  { wallet: '5VLnDdKAc5opZRe8avaQVhyVxzA1yCTNTUvKwf8fWsZZ', referrals: 21, solVolume: 520, badges: [] },
  { wallet: '3Gf8VLkQYxZKCRG4TUAp7oCuF5GGBBgUDQwSHLUXaYfN', referrals: 18, solVolume: 450, badges: ['early_supporter'] },
  { wallet: '9ZNTfG4NyQgxy2SWjSiQoUyBPEvnj6CQ3GnX7aQH8Xyi', referrals: 15, solVolume: 380, badges: [] },
  { wallet: '7mhcgF1DVgDnBQxYKwt7xRwmv9UtcULN8yCLVm5AQNRK', referrals: 12, solVolume: 300, badges: [] },
];

const MOCK_TASK_LEADERS: TaskLeader[] = [
  { wallet: '4xzt3dDkdFWWJ4BXmkWNZGqyqUMFCkLi5QE2WzNNXQNY', points: 85, tasks: 12, badges: ['task_master', 'early_supporter'] },
  { wallet: '9yKHERk8rsbmJxvMpPuwPs1oRWgCCVnhqBWWp47Yhf7t', points: 72, tasks: 10, badges: ['social_butterfly'] },
  { wallet: '1ZJf7HgcjgN4wKxRcMpHxMGaEXMiNFW1nN2Vf6UJzWcE', points: 68, tasks: 9, badges: ['community_builder'] },
  { wallet: '8VLnDdKAc5opZRe8avaQVhyVxzA1yCTNTUvKwf8fWsZZ', points: 54, tasks: 8, badges: [] },
  { wallet: '2Gf8VLkQYxZKCRG4TUAp7oCuF5GGBBgUDQwSHLUXaYfN', points: 48, tasks: 7, badges: ['early_supporter'] },
  { wallet: '6ZNTfG4NyQgxy2SWjSiQoUyBPEvnj6CQ3GnX7aQH8Xyi', points: 42, tasks: 6, badges: [] },
  { wallet: '3mhcgF1DVgDnBQxYKwt7xRwmv9UtcULN8yCLVm5AQNRK', points: 36, tasks: 5, badges: [] },
];

interface WhitelistLeaderboardProps {
  className?: string;
}

const WhitelistLeaderboard: React.FC<WhitelistLeaderboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'referrers' | 'grinders'>('referrers');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Simulate countdown to next leaderboard update
  useMemo(() => {
    // Start with a random time between 1-24 hours (in seconds)
    const initialTime = Math.floor(Math.random() * 86400) + 3600;
    setTimeRemaining(initialTime);
  }, []);

  // Format time remaining as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Render badge component
  const renderBadge = (badgeType: string) => {
    const badge = BADGES[badgeType as keyof typeof BADGES];
    if (!badge) return null;

    return (
      <span 
        className={`text-xs px-2 py-0.5 rounded-full ${badge.color} text-white font-medium mr-1 inline-flex items-center`}
      >
        {badge.name}
      </span>
    );
  };

  return (
    <div className={`bg-black/30 p-6 rounded-lg border border-gray-800 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">
          <span className="bg-gradient-to-r from-chad-gold to-chad-pink text-transparent bg-clip-text">
            Whitelist Leaderboard
          </span>
        </h3>
        <div className="bg-black/50 px-3 py-1 rounded-full border border-gray-700 flex items-center">
          <span className="text-gray-400 text-xs mr-2">Next Update:</span>
          <span className="text-white text-xs font-mono">{formatTime(timeRemaining)}</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Connect your wallet and complete tasks to appear on the leaderboard!
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('referrers')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'referrers' ? 'bg-gradient-to-r from-chad-gold/20 to-chad-pink/20 text-white border border-chad-gold/50' : 'bg-black/30 text-gray-400 hover:text-white border border-gray-800'}`}
        >
          <span className="flex items-center">
            <span className="mr-2">👥</span>
            Top Referrers
          </span>
        </button>
        <button
          onClick={() => setActiveTab('grinders')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'grinders' ? 'bg-gradient-to-r from-chad-neon/20 to-green-500/20 text-white border border-chad-neon/50' : 'bg-black/30 text-gray-400 hover:text-white border border-gray-800'}`}
        >
          <span className="flex items-center">
            <span className="mr-2">✅</span>
            Task Grinders
          </span>
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto bg-black/20 rounded-xl border border-gray-800">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-700 bg-black/40">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{activeTab === 'referrers' ? 'Referrals' : 'Tasks'}</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{activeTab === 'referrers' ? 'SOL Volume' : 'Points'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(activeTab === 'referrers' ? MOCK_REFERRAL_LEADERS : MOCK_TASK_LEADERS).map((entry, index) => (
              <tr key={index} className="hover:bg-black/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    {index === 0 ? (
                      <motion.div 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.8, 1.1, 1] }}
                        transition={{ duration: 0.5 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-chad-gold flex items-center justify-center mr-3 shadow-lg shadow-chad-gold/30"
                      >
                        <span className="text-black font-bold text-lg">👑</span>
                      </motion.div>
                    ) : index === 1 ? (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-400 flex items-center justify-center mr-3 shadow-md">
                        <span className="text-black font-bold">🥈</span>
                      </div>
                    ) : index === 2 ? (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center mr-3 shadow-md">
                        <span className="text-white font-bold">🥉</span>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center mr-3 text-gray-400 text-sm">
                        {index + 1}
                      </div>
                    )}
                    <span className={`${index < 3 ? 'text-white font-semibold' : 'text-gray-300'}`}>{shortenAddress(entry.wallet)}</span>
                    {index === 0 && (
                      <span className="ml-2 text-xs bg-gradient-to-r from-chad-gold to-yellow-500 text-black font-bold px-2 py-0.5 rounded-full">
                        LEADER
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`${index < 3 ? 'text-white font-semibold' : 'text-gray-300'}`}>
                    {activeTab === 'referrers' 
                      ? (entry as ReferralLeader).referrals 
                      : (entry as TaskLeader).tasks}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`${index < 3 ? 'text-chad-neon font-bold' : 'text-chad-neon/80'}`}>
                    {activeTab === 'referrers' 
                      ? `${(entry as ReferralLeader).solVolume} SOL` 
                      : `${(entry as TaskLeader).points} pts`}
                  </span>
                  {index === 0 && (
                    <span className="ml-2 inline-block animate-pulse">
                      {activeTab === 'referrers' ? '🔥' : '⭐'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WhitelistLeaderboard;
