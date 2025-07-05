'use client';

import React from 'react';
import Image from 'next/image';
import TokenomicsChart from '@/components/charts/TokenomicsChart';

export default function TokenomicsPage() {
  // Tokenomics data for the chart
  const tokenomicsData = [
    { name: 'Fair Launch', value: 30, itemStyle: { color: '#ff1493' } },
    { name: 'Liquidity', value: 30, itemStyle: { color: '#00fff7' } },
    { name: 'Rewards Pool', value: 30, itemStyle: { color: '#ffd700' } },
    { name: 'Dev & Marketing', value: 10, itemStyle: { color: '#9400d3' } }
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-chad-pink to-chad-purple text-transparent bg-clip-text">
            Tokenomics
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Total Supply: <span className="text-chad-neon font-bold">1,000,000,000</span> $CHAD tokens
          </p>
        </div>

        {/* Main Tokenomics Chart Section */}
        <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg mb-12">
          <TokenomicsChart data={tokenomicsData} />
        </div>

        {/* Token Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-chad-pink/20 shadow-lg shadow-chad-pink/10">
            <h3 className="text-xl font-bold mb-2 text-chad-pink">Fair Launch</h3>
            <p className="text-3xl font-bold font-['Orbitron']">30%</p>
            <p className="text-gray-400">300,000,000 tokens</p>
            <p className="mt-2 text-sm text-gray-300">Distributed to early stakers and community supporters</p>
          </div>
          
          <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-chad-neon/20 shadow-lg shadow-chad-neon/10">
            <h3 className="text-xl font-bold mb-2 text-chad-neon">Liquidity</h3>
            <p className="text-3xl font-bold font-['Orbitron']">30%</p>
            <p className="text-gray-400">300,000,000 tokens</p>
            <p className="mt-2 text-sm text-gray-300">Paired with SOL on DEXes like Jupiter/Raydium</p>
          </div>
          
          <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-chad-gold/20 shadow-lg shadow-chad-gold/10">
            <h3 className="text-xl font-bold mb-2 text-chad-gold">Rewards Pool</h3>
            <p className="text-3xl font-bold font-['Orbitron']">30%</p>
            <p className="text-gray-400">300,000,000 tokens</p>
            <p className="mt-2 text-sm text-gray-300">Used for spin yields, lottery, leaderboards, boosters</p>
          </div>
          
          <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-chad-purple/20 shadow-lg shadow-chad-purple/10">
            <h3 className="text-xl font-bold mb-2 text-chad-purple">Dev & Marketing</h3>
            <p className="text-3xl font-bold font-['Orbitron']">10%</p>
            <p className="text-gray-400">100,000,000 tokens</p>
            <p className="mt-2 text-sm text-gray-300">Locked vesting for operational costs, campaigns</p>
          </div>
        </div>

        {/* Token Utility */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-chad-pink to-chad-purple text-transparent bg-clip-text">
              $CHAD Token Utility
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-gray-800 hover:border-chad-pink/50 transition-colors">
              <div className="text-3xl mb-4 text-chad-pink">🎮</div>
              <h3 className="text-xl font-bold mb-2 text-white">Spin to Win</h3>
              <p className="text-gray-300">Stake $CHAD to earn spins and win more tokens through the Chad Spinner game.</p>
            </div>
            <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-gray-800 hover:border-chad-neon/50 transition-colors">
              <div className="text-3xl mb-4 text-chad-neon">🏆</div>
              <h3 className="text-xl font-bold mb-2 text-white">Leaderboards</h3>
              <p className="text-gray-300">Compete with other Chads for top positions and earn exclusive rewards.</p>
            </div>
            <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-gray-800 hover:border-chad-gold/50 transition-colors">
              <div className="text-3xl mb-4 text-chad-gold">🎟️</div>
              <h3 className="text-xl font-bold mb-2 text-white">Lottery Tickets</h3>
              <p className="text-gray-300">Use $CHAD to purchase lottery tickets for a chance to win massive token prizes.</p>
            </div>
            <div className="bg-gradient-to-br from-black to-gray-900 p-6 rounded-xl border border-gray-800 hover:border-chad-purple/50 transition-colors">
              <div className="text-3xl mb-4 text-chad-purple">🗳️</div>
              <h3 className="text-xl font-bold mb-2 text-white">Governance</h3>
              <p className="text-gray-300">Hold $CHAD to vote on key protocol decisions and future development.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">
            <span className="bg-gradient-to-r from-chad-primary to-orange-500 text-transparent bg-clip-text">
              Join the ChadEmpire
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Become part of the Cult of Infinite Yield and start your journey as a Chad Warrior
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 bg-gradient-to-r from-chad-primary to-orange-500 text-black font-bold rounded-full hover:opacity-90 transition-opacity">
              Buy $CHAD
            </button>
            <button className="px-8 py-3 bg-transparent border-2 border-chad-secondary text-white font-bold rounded-full hover:bg-chad-secondary/10 transition-all">
              Read Whitepaper
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
