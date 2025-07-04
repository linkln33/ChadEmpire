'use client';

import React from 'react';

export default function ChadsWayPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-chad-pink to-chad-primary text-transparent bg-clip-text">
            Chad&apos;s Way
          </h1>
          <p className="text-xl text-gray-300">The path to becoming a true Chad warrior</p>
        </div>
        
        <div className="bg-gray-900/60 backdrop-blur-md border border-chad-neon/30 rounded-xl p-6 shadow-lg shadow-chad-neon/20">
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 bg-chad-dark border-2 border-chad-neon rounded-full flex items-center justify-center text-xl font-bold text-chad-neon">
                1
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Buy $CHAD – Join the army.</h2>
                <p className="text-gray-300">
                  Become part of the Chad Empire by acquiring $CHAD tokens. Your journey to wealth and glory begins with joining the ranks of the Chad army. The more tokens you hold, the stronger your position in the empire.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <div className="bg-gray-800/50 border border-chad-neon/20 rounded-lg px-4 py-2">
                    <span className="text-chad-neon font-medium">Token Address:</span>
                    <span className="ml-2 text-gray-300">CHAD1234...5678</span>
                  </div>
                  <a 
                    href="#" 
                    className="bg-transparent border-2 border-chad-neon text-chad-neon hover:text-white rounded-lg px-4 py-2 transition-all duration-300"
                    style={{ boxShadow: '0 0 10px rgba(0, 255, 247, 0.3)' }}
                  >
                    Buy on DEX
                  </a>
                </div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 bg-chad-dark border-2 border-chad-neon rounded-full flex items-center justify-center text-xl font-bold text-chad-neon">
                2
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Stake like a warlord – Bigger stake = Bigger weight.</h2>
                <p className="text-gray-300">
                  True Chads don't just hold, they stake. Staking your $CHAD tokens increases your influence and rewards. The more you stake, the greater your weight in the ecosystem and the higher your potential rewards.
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 border border-chad-neon/20 rounded-lg p-3">
                    <div className="text-xl font-bold text-chad-neon mb-1">Staking Tiers</div>
                    <div className="text-gray-300">
                      <div className="flex justify-between">
                        <span>Chad Recruit</span>
                        <span>1,000+ $CHAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chad Warrior</span>
                        <span>10,000+ $CHAD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chad Warlord</span>
                        <span>100,000+ $CHAD</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 border border-chad-neon/20 rounded-lg p-3">
                    <div className="text-xl font-bold text-chad-neon mb-1">Weight Multipliers</div>
                    <div className="text-gray-300">
                      <div className="flex justify-between">
                        <span>Base</span>
                        <span>1x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Warrior</span>
                        <span>1.5x</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Warlord</span>
                        <span>2x</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0 w-14 h-14 bg-chad-dark border-2 border-chad-neon rounded-full flex items-center justify-center text-xl font-bold text-chad-neon">
                3
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Choose your fate – Steady 0.5% daily or SPIN for up to 3%.</h2>
                <p className="text-gray-300">
                  The Chad Empire rewards the brave. Choose between a steady 0.5% daily return on your staked tokens, or test your luck with the SPIN feature for a chance to earn up to 3% in a single day. The choice is yours, but true Chads know when to take risks.
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 border border-chad-neon/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-chad-neon mb-2">STEADY</div>
                    <div className="text-4xl font-bold text-white mb-3">0.5%</div>
                    <div className="text-gray-300">Daily guaranteed return</div>
                    <div className="mt-4">
                      <a 
                        href="/game" 
                        className="inline-block bg-transparent border-2 border-chad-neon text-chad-neon hover:text-white rounded-lg px-6 py-2 transition-all duration-300"
                        style={{ boxShadow: '0 0 10px rgba(0, 255, 247, 0.3)' }}
                      >
                        Stake Now
                      </a>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 border border-chad-pink/30 rounded-lg p-4 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-chad-pink/10 to-chad-primary/10"></div>
                    <div className="relative">
                      <div className="text-2xl font-bold text-chad-pink mb-2">SPIN</div>
                      <div className="text-4xl font-bold text-white mb-3">UP TO 3%</div>
                      <div className="text-gray-300">Daily potential return</div>
                      <div className="mt-4">
                        <a 
                          href="/game" 
                          className="inline-block bg-transparent border-2 border-chad-pink text-chad-pink hover:text-white rounded-lg px-6 py-2 transition-all duration-300"
                          style={{ boxShadow: '0 0 10px rgba(255, 0, 184, 0.3)' }}
                        >
                          Spin Now
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xl text-chad-neon font-bold mb-4">Ready to become a Chad?</p>
            <a 
              href="/game" 
              className="inline-block bg-transparent border-2 border-chad-neon text-chad-neon hover:text-white rounded-lg px-8 py-3 text-lg font-bold transition-all duration-300 transform hover:scale-105"
              style={{ boxShadow: '0 0 15px rgba(0, 255, 247, 0.4)' }}
            >
              Start Your Chad Journey
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
