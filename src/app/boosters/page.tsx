'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUserStore } from '@/stores/userStore';
import { BoosterCard } from '@/components/boosters/BoosterCard';
import { FragmentProgress } from '@/components/boosters/FragmentProgress';

export default function BoostersPage() {
  const { publicKey } = useWallet();
  const { boosters, fragments } = useUserStore();
  const [activeTab, setActiveTab] = useState<'my_boosters' | 'fragments' | 'marketplace'>('my_boosters');
  
  // Mock marketplace boosters
  const marketplaceBoosters = [
    {
      id: 'market-1',
      name: 'Yield Multiplier',
      description: 'Increases yield rewards by 1.5x for your next 5 spins',
      image: '/images/boosters/yield-multiplier.png',
      price: 250,
      rarity: 'rare',
      boosterType: 'yield_multiplier',
      powerLevel: 2,
    },
    {
      id: 'market-2',
      name: 'Lucky Charm',
      description: 'Increases your chance of winning yield by 15% for 24 hours',
      image: '/images/boosters/lucky-charm.png',
      price: 175,
      rarity: 'uncommon',
      boosterType: 'luck_boost',
      powerLevel: 1,
    },
    {
      id: 'market-3',
      name: 'Bonus Spin Token',
      description: 'Grants an extra free spin without consuming your daily spin',
      image: '/images/boosters/bonus-spin.png',
      price: 100,
      rarity: 'common',
      boosterType: 'bonus_spin',
      powerLevel: 1,
    },
    {
      id: 'market-4',
      name: 'Jackpot Enhancer',
      description: 'Doubles your chance of hitting the jackpot on your next 3 spins',
      image: '/images/boosters/jackpot-enhancer.png',
      price: 350,
      rarity: 'epic',
      boosterType: 'jackpot_access',
      powerLevel: 3,
    },
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <main className="max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">ChadEmpire Boosters</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Enhance your gameplay with powerful NFT boosters that increase your yields, luck, and rewards!
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-chad-primary/20 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('my_boosters')}
              className={`py-3 px-6 font-semibold whitespace-nowrap ${
                activeTab === 'my_boosters' 
                  ? 'text-chad-primary border-b-2 border-chad-primary' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              My Boosters
            </button>
            <button
              onClick={() => setActiveTab('fragments')}
              className={`py-3 px-6 font-semibold whitespace-nowrap ${
                activeTab === 'fragments' 
                  ? 'text-chad-primary border-b-2 border-chad-primary' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Fragments
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`py-3 px-6 font-semibold whitespace-nowrap ${
                activeTab === 'marketplace' 
                  ? 'text-chad-primary border-b-2 border-chad-primary' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Marketplace
            </button>
          </div>
          
          {!publicKey ? (
            <div className="chad-card text-center py-10">
              <p className="text-xl mb-4">Connect your wallet to view your boosters</p>
              <p className="text-gray-400">You'll need to connect your Solana wallet to see your boosters and fragments</p>
            </div>
          ) : activeTab === 'my_boosters' ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Your Boosters</h2>
                <div className="text-sm text-gray-400">
                  {boosters.length} {boosters.length === 1 ? 'Booster' : 'Boosters'}
                </div>
              </div>
              
              {boosters.length === 0 ? (
                <div className="chad-card text-center py-10">
                  <p className="text-xl mb-4">You don't have any boosters yet</p>
                  <p className="text-gray-400 mb-6">Collect fragments or purchase boosters from the marketplace</p>
                  <button 
                    className="bg-chad-primary hover:bg-chad-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    onClick={() => setActiveTab('marketplace')}
                  >
                    Browse Marketplace
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {boosters.map((booster) => (
                    <BoosterCard 
                      key={booster.id}
                      booster={booster}
                      isOwned={true}
                    />
                  ))}
                </div>
              )}
              
              <div className="mt-10">
                <h3 className="text-xl font-bold mb-4">Booster Types</h3>
                <div className="chad-card">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-black/30 rounded-lg p-4">
                      <h4 className="font-bold text-chad-primary mb-2">Yield Multipliers</h4>
                      <p className="text-gray-300 mb-3">
                        Increase your yield rewards by a multiplier (1.5x - 3x) for a limited number of spins.
                      </p>
                      <div className="text-sm text-gray-400">
                        Rarity: Uncommon - Epic
                      </div>
                    </div>
                    
                    <div className="bg-black/30 rounded-lg p-4">
                      <h4 className="font-bold text-chad-primary mb-2">Luck Boosters</h4>
                      <p className="text-gray-300 mb-3">
                        Increase your chance of winning yield by 10-25% for a limited time period.
                      </p>
                      <div className="text-sm text-gray-400">
                        Rarity: Common - Rare
                      </div>
                    </div>
                    
                    <div className="bg-black/30 rounded-lg p-4">
                      <h4 className="font-bold text-chad-primary mb-2">Bonus Spin Tokens</h4>
                      <p className="text-gray-300 mb-3">
                        Grant extra free spins without consuming your daily spin or costing $CHAD.
                      </p>
                      <div className="text-sm text-gray-400">
                        Rarity: Common
                      </div>
                    </div>
                    
                    <div className="bg-black/30 rounded-lg p-4">
                      <h4 className="font-bold text-chad-primary mb-2">Jackpot Enhancers</h4>
                      <p className="text-gray-300 mb-3">
                        Significantly increase your chance of hitting the jackpot (1-3% yield) on your spins.
                      </p>
                      <div className="text-sm text-gray-400">
                        Rarity: Rare - Legendary
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'fragments' ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Booster Fragments</h2>
                <div className="text-sm text-gray-400">
                  Collect 5 fragments of the same type to mint a booster
                </div>
              </div>
              
              {fragments.length === 0 ? (
                <div className="chad-card text-center py-10">
                  <p className="text-xl mb-4">You don't have any fragments yet</p>
                  <p className="text-gray-400 mb-6">Earn fragments as consolation prizes when spinning the wheel</p>
                  <button 
                    className="bg-chad-primary hover:bg-chad-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    onClick={() => window.location.href = '/play'}
                  >
                    Spin to Earn
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {fragments.map((fragment) => (
                    <FragmentProgress 
                      key={fragment.id}
                      fragment={fragment}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Booster Marketplace</h2>
                <div className="text-sm text-gray-400">
                  Purchase boosters directly with $CHAD tokens
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplaceBoosters.map((booster) => (
                  <div key={booster.id} className="chad-card overflow-hidden">
                    <div className="h-40 bg-gradient-to-br from-chad-primary/20 to-chad-accent/20 flex items-center justify-center">
                      <div className={`text-4xl ${
                        booster.rarity === 'legendary' ? 'text-yellow-400' :
                        booster.rarity === 'epic' ? 'text-purple-400' :
                        booster.rarity === 'rare' ? 'text-blue-400' :
                        booster.rarity === 'uncommon' ? 'text-green-400' :
                        'text-gray-400'
                      }`}>
                        {booster.boosterType === 'yield_multiplier' ? '×' :
                         booster.boosterType === 'luck_boost' ? '🍀' :
                         booster.boosterType === 'bonus_spin' ? '🎡' :
                         '🎯'}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg">{booster.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booster.rarity === 'legendary' ? 'bg-yellow-400/20 text-yellow-400' :
                          booster.rarity === 'epic' ? 'bg-purple-400/20 text-purple-400' :
                          booster.rarity === 'rare' ? 'bg-blue-400/20 text-blue-400' :
                          booster.rarity === 'uncommon' ? 'bg-green-400/20 text-green-400' :
                          'bg-gray-400/20 text-gray-400'
                        }`}>
                          {booster.rarity.charAt(0).toUpperCase() + booster.rarity.slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 mb-4">{booster.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-chad-accent">{booster.price} $CHAD</span>
                        <button className="bg-chad-primary hover:bg-chad-primary/90 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                          Purchase
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
