'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';

export default function LeaderboardPage() {
  const { leaderboard, updateLeaderboard } = useGameStore();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<'chad_score' | 'yield' | 'spins'>('chad_score');
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        const mockLeaderboard = Array.from({ length: 50 }, (_, i) => ({
          walletAddress: `${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
          username: i < 10 ? `ChadLegend${i + 1}` : undefined,
          avatarUrl: i < 5 ? `https://api.dicebear.com/7.x/personas/svg?seed=${i}` : undefined,
          chadScore: Math.floor(10000 / (i + 1)) + Math.floor(Math.random() * 100),
          totalSpins: Math.floor(500 / (i + 1)) + Math.floor(Math.random() * 20),
          totalWins: Math.floor(300 / (i + 1)) + Math.floor(Math.random() * 10),
          totalYieldEarned: Math.floor(5000 / (i + 1)) + Math.floor(Math.random() * 100),
          rank: i + 1
        }));
        
        // Sort based on active tab
        let sortedLeaderboard = [...mockLeaderboard];
        if (activeTab === 'yield') {
          sortedLeaderboard.sort((a, b) => b.totalYieldEarned - a.totalYieldEarned);
        } else if (activeTab === 'spins') {
          sortedLeaderboard.sort((a, b) => b.totalSpins - a.totalSpins);
        } else {
          sortedLeaderboard.sort((a, b) => b.chadScore - a.chadScore);
        }
        
        // Update ranks after sorting
        sortedLeaderboard = sortedLeaderboard.map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));
        
        updateLeaderboard(sortedLeaderboard);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [activeTab, updateLeaderboard]);
  
  // Find user's rank if they exist
  const userRank = user ? leaderboard.find(entry => 
    entry.walletAddress === user.walletAddress
  )?.rank || 'Not ranked' : 'Not ranked';

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <main className="max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">ChadEmpire Leaderboard</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The top Chads competing for glory, rewards, and bragging rights. Top 50 Chads earn weekly rewards!
            </p>
          </div>
          
          {/* User's rank */}
          {user && (
            <div className="chad-card mb-8 flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-chad-primary/20 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <span className="text-chad-primary font-bold">{userRank}</span>
                </div>
                <div>
                  <h3 className="font-bold">Your Ranking</h3>
                  <p className="text-gray-400">{user.walletAddress}</p>
                </div>
              </div>
              <div className="flex space-x-6">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Chad Score</p>
                  <p className="font-bold text-chad-primary">{user.chadScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Spins</p>
                  <p className="font-bold">{user.totalSpins}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Yield</p>
                  <p className="font-bold text-chad-accent">{user.totalYieldEarned} $CHAD</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Leaderboard tabs */}
          <div className="flex border-b border-chad-primary/20 mb-6">
            <button
              onClick={() => setActiveTab('chad_score')}
              className={`py-3 px-6 font-semibold ${
                activeTab === 'chad_score' 
                  ? 'text-chad-primary border-b-2 border-chad-primary' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Chad Score
            </button>
            <button
              onClick={() => setActiveTab('yield')}
              className={`py-3 px-6 font-semibold ${
                activeTab === 'yield' 
                  ? 'text-chad-primary border-b-2 border-chad-primary' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Yield Earned
            </button>
            <button
              onClick={() => setActiveTab('spins')}
              className={`py-3 px-6 font-semibold ${
                activeTab === 'spins' 
                  ? 'text-chad-primary border-b-2 border-chad-primary' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Total Spins
            </button>
          </div>
          
          {/* Leaderboard table */}
          <div className="bg-chad-dark/50 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-black/30">
                  <th className="py-4 px-6 text-left">Rank</th>
                  <th className="py-4 px-6 text-left">Chad</th>
                  <th className="py-4 px-6 text-right">Chad Score</th>
                  <th className="py-4 px-6 text-right hidden md:table-cell">Spins</th>
                  <th className="py-4 px-6 text-right hidden md:table-cell">Win Rate</th>
                  <th className="py-4 px-6 text-right">Yield Earned</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <div className="flex justify-center items-center">
                        <svg className="animate-spin h-8 w-8 text-chad-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry, index) => (
                    <tr 
                      key={index} 
                      className={`border-t border-chad-primary/10 ${
                        user && entry.walletAddress === user.walletAddress 
                          ? 'bg-chad-primary/10' 
                          : index % 2 === 0 ? 'bg-black/20' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          {entry.rank <= 3 ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                              entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                              entry.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                              'bg-amber-700/20 text-amber-700'
                            }`}>
                              {entry.rank}
                            </div>
                          ) : (
                            <span className="w-8 text-center mr-2">{entry.rank}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          {entry.avatarUrl ? (
                            <div className="w-8 h-8 rounded-full bg-chad-primary/20 mr-3 overflow-hidden">
                              <img src={entry.avatarUrl} alt={entry.username || 'Chad'} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-chad-primary/20 flex items-center justify-center mr-3">
                              <span className="text-chad-primary font-bold text-sm">
                                {entry.walletAddress.substring(0, 1).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            {entry.username ? (
                              <p className="font-semibold">{entry.username}</p>
                            ) : (
                              <p className="font-mono text-sm">{entry.walletAddress}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold">
                        {entry.chadScore.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right hidden md:table-cell">
                        {entry.totalSpins.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right hidden md:table-cell">
                        {((entry.totalWins / entry.totalSpins) * 100).toFixed(1)}%
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-chad-accent">
                        {entry.totalYieldEarned.toLocaleString()} $CHAD
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Weekly rewards info */}
          <div className="mt-8 bg-gradient-to-r from-chad-primary/20 to-chad-accent/20 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Weekly Rewards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3">
                    <span className="text-yellow-500 font-bold">1</span>
                  </div>
                  <h4 className="font-bold">Top Chad</h4>
                </div>
                <p className="text-gray-400 mb-2">Exclusive Badge NFT + 500 $CHAD</p>
                <p className="text-sm text-gray-500">Plus 5 Bonus Spin Tokens</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-400/20 flex items-center justify-center mr-3">
                    <span className="text-gray-400 font-bold">2-10</span>
                  </div>
                  <h4 className="font-bold">Elite Chads</h4>
                </div>
                <p className="text-gray-400 mb-2">Badge NFT + 100 $CHAD</p>
                <p className="text-sm text-gray-500">Plus 2 Bonus Spin Tokens</p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-700/20 flex items-center justify-center mr-3">
                    <span className="text-amber-700 font-bold">11-50</span>
                  </div>
                  <h4 className="font-bold">Chad Club</h4>
                </div>
                <p className="text-gray-400 mb-2">25 $CHAD</p>
                <p className="text-sm text-gray-500">Plus 1 Bonus Spin Token</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
