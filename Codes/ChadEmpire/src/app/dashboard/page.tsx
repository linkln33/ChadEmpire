'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';
import Link from 'next/link';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const { 
    user, 
    stakes, 
    spins, 
    boosters, 
    lotteryTickets, 
    totalYieldEarned,
    fetchUserData 
  } = useUserStore();
  
  const { systemStats } = useGameStore();
  
  const [timeframe, setTimeframe] = useState('week');
  const [yieldHistory, setYieldHistory] = useState<any[]>([]);
  const [spinDistribution, setSpinDistribution] = useState<any[]>([]);
  
  // Fetch user data and generate mock data on component mount
  useEffect(() => {
    if (connected && publicKey) {
      fetchUserData(publicKey.toString());
      generateMockData();
    }
  }, [connected, publicKey, fetchUserData]);
  
  // Generate mock data for charts
  const generateMockData = () => {
    // Generate yield history data
    const now = new Date();
    const yieldData = [];
    
    if (timeframe === 'week') {
      // Daily data for the past week
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        yieldData.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          yield: Math.floor(Math.random() * 50) + 10,
        });
      }
    } else if (timeframe === 'month') {
      // Weekly data for the past month
      for (let i = 3; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        
        yieldData.push({
          date: `Week ${4-i}`,
          yield: Math.floor(Math.random() * 200) + 50,
        });
      }
    } else {
      // Monthly data for the past year
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        
        yieldData.push({
          date: date.toLocaleDateString('en-US', { month: 'short' }),
          yield: Math.floor(Math.random() * 500) + 100,
        });
      }
    }
    
    setYieldHistory(yieldData);
    
    // Generate spin distribution data
    setSpinDistribution([
      { name: 'Yield', value: 25, color: '#4CAF50' },
      { name: 'Lottery Tickets', value: 15, color: '#2196F3' },
      { name: 'Chad Score', value: 10, color: '#FF9800' },
      { name: 'Fragments', value: 8, color: '#9C27B0' },
      { name: 'Bonus Spins', value: 2, color: '#F44336' },
    ]);
  };
  
  // Update charts when timeframe changes
  useEffect(() => {
    generateMockData();
  }, [timeframe]);
  
  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-8 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="mb-6">Connect your Solana wallet to view your dashboard!</p>
          <p className="text-gray-400">Use the wallet button in the top right corner</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2 text-center">Dashboard</h1>
      <p className="text-gray-400 text-center mb-8">Your ChadEmpire game statistics and activities</p>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">Total Staked</p>
          <p className="text-2xl font-bold">
            {stakes.reduce((total, stake) => total + stake.amount, 0).toLocaleString()} $CHAD
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">Total Yield</p>
          <p className="text-2xl font-bold text-green-500">
            {totalYieldEarned.toLocaleString()} $CHAD
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">Chad Score</p>
          <p className="text-2xl font-bold text-orange-500">
            {user?.chadScore?.toLocaleString() || '0'}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">Win Rate</p>
          <p className="text-2xl font-bold text-blue-500">
            {spins.length > 0 
              ? `${Math.round((spins.filter(spin => spin.result === 'win').length / spins.length) * 100)}%` 
              : '0%'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Yield Chart */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Yield History</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeframe('week')}
                  className={`px-3 py-1 text-sm rounded ${
                    timeframe === 'week' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeframe('month')}
                  className={`px-3 py-1 text-sm rounded ${
                    timeframe === 'month' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeframe('year')}
                  className={`px-3 py-1 text-sm rounded ${
                    timeframe === 'year' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={yieldHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="date" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', borderColor: '#555' }} 
                    formatter={(value) => [`${value} $CHAD`, 'Yield']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="yield" 
                    name="Yield Earned" 
                    stroke="#4CAF50" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            
            <div className="space-y-3">
              {spins.slice(0, 5).map((spin, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3 flex items-center">
                  <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${
                    spin.result === 'win' ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {spin.result === 'win' ? '💰' : '🎁'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {spin.result === 'win' 
                        ? `Won ${spin.yieldPercentage}% yield (${spin.yieldAmount} $CHAD)` 
                        : `Won ${spin.consolationType?.replace('_', ' ')}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(spin.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {spins.length === 0 && (
                <p className="text-gray-400 text-center py-4">
                  No recent activity. Start spinning to earn rewards!
                </p>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <Link href="/game" className="text-blue-400 hover:text-blue-300">
                Go to Game &rarr;
              </Link>
            </div>
          </div>
        </div>
        
        {/* Right Column - Stats and Charts */}
        <div>
          {/* Spin Distribution */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Spin Results</h2>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spinDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {spinDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', borderColor: '#555' }} 
                    formatter={(value) => [`${value} spins`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Lottery Status */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Lottery Status</h2>
            
            <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Current Jackpot</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {systemStats.lotteryPool.toLocaleString()} $CHAD
                  </p>
                </div>
                <Link href="/lottery" className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                  View
                </Link>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="font-semibold">Your Tickets</p>
              <p className="text-2xl font-bold">
                {lotteryTickets.length}
              </p>
              <p className="text-sm text-gray-400">
                Next draw: {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {/* Boosters */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your Boosters</h2>
              <Link href="/boosters" className="text-sm text-blue-400 hover:text-blue-300">
                View All
              </Link>
            </div>
            
            {boosters.length > 0 ? (
              <div className="space-y-3">
                {boosters.slice(0, 3).map((booster, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3 flex items-center">
                    <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${
                      booster.boosterType === 'yield_multiplier' ? 'bg-green-600' :
                      booster.boosterType === 'luck_boost' ? 'bg-blue-600' :
                      booster.boosterType === 'bonus_spin' ? 'bg-red-600' :
                      'bg-purple-600'
                    }`}>
                      {booster.boosterType === 'yield_multiplier' && '💰'}
                      {booster.boosterType === 'luck_boost' && '🍀'}
                      {booster.boosterType === 'bonus_spin' && '🎡'}
                      {booster.boosterType === 'jackpot_access' && '🎯'}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {booster.boosterType === 'yield_multiplier' && `${booster.powerLevel}x Yield`}
                        {booster.boosterType === 'luck_boost' && `Luck +${booster.powerLevel * 10}%`}
                        {booster.boosterType === 'bonus_spin' && 'Bonus Spin'}
                        {booster.boosterType === 'jackpot_access' && 'Jackpot Access'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {booster.usedAt ? 'Used' : 'Available'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4 bg-gray-700 rounded-lg">
                No boosters yet. Collect fragments or buy from marketplace!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
