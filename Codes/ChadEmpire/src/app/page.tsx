import Link from 'next/link'
import TokenomicsChart from '@/components/charts/TokenomicsChart'
import FairLaunchSection from '@/components/fair-launch/FairLaunchSection'
import HeroText from '@/components/hero/HeroText'
import HeroImage from '@/components/hero/HeroImage'
import MusicPlayer from '@/components/music/MusicPlayer'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {/* Hero Section */}
        <section id="home" className="relative py-8 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-chad-dark to-black opacity-90"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,255,225,0.05)_1px,transparent_1px)] bg-[length:24px_24px] opacity-30"></div>
          </div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8">
              <div className="lg:w-2/5 order-2 lg:order-1">
                <HeroText />
              </div>
              
              <div className="lg:w-3/5 mb-6 sm:mb-8 lg:mb-0 lg:mt-0 order-1 lg:order-2">
                <HeroImage />
              </div>
            </div>
            

          </div>
        </section>
        
        {/* Music Player - Fixed position at bottom right */}
        <div className="fixed bottom-8 right-8 z-50" id="music-player-container">
          <MusicPlayer 
            audioSrc="/music/Chad-EmpireTM.mp3" 
            audioTitle="Chad Empire Mix" 
            autoPlay={true}
          />
        </div>
        
        {/* Chad's Way Section */}
        <section id="chads-way" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-chad-dark">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
              <span className="bg-gradient-to-r from-chad-pink to-chad-neon text-transparent bg-clip-text">Chad's Way</span>
            </h2>
            <p className="text-center text-gray-300 mb-12 max-w-3xl mx-auto text-lg">The path to becoming a true Chad warrior</p>
            
            <div className="bg-gray-900/60 backdrop-blur-md border border-chad-neon/30 rounded-xl p-8 shadow-lg shadow-chad-neon/20 w-full mx-auto">
              <div className="space-y-12">
                {/* Step 1 */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-chad-dark border-2 border-chad-neon rounded-full flex items-center justify-center text-2xl font-bold text-chad-neon">
                    1
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">Buy $CHAD – Join the army.</h3>
                    <p className="text-gray-300 text-lg">
                      Become part of the Chad Empire by acquiring $CHAD tokens. Your journey to wealth and glory begins with joining the ranks of the Chad army. The more tokens you hold, the stronger your position in the empire.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <div className="bg-gray-800/50 border border-chad-neon/20 rounded-lg px-4 py-2">
                        <span className="text-chad-neon font-medium">Token Address:</span>
                        <span className="ml-2 text-gray-300">CHAD1234...5678</span>
                      </div>
                      <button 
                        className="bg-transparent border-2 border-chad-neon text-chad-neon hover:text-white rounded-lg px-4 py-2 transition-all duration-300"
                        style={{ boxShadow: '0 0 10px rgba(0, 255, 247, 0.3)' }}
                      >
                        Buy on DEX
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-chad-dark border-2 border-chad-neon rounded-full flex items-center justify-center text-2xl font-bold text-chad-neon">
                    2
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">Stake like a warlord – Bigger stake = Bigger weight.</h3>
                    <p className="text-gray-300 text-lg">
                      True Chads don't just hold, they stake. Staking your $CHAD tokens increases your influence and rewards. The more you stake, the greater your weight in the ecosystem and the higher your potential rewards.
                    </p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-gray-800/50 border border-chad-neon/20 rounded-lg p-4">
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
                      <div className="bg-gray-800/50 border border-chad-neon/20 rounded-lg p-4">
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
                  <div className="flex-shrink-0 w-16 h-16 bg-chad-dark border-2 border-chad-neon rounded-full flex items-center justify-center text-2xl font-bold text-chad-neon">
                    3
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">Choose your fate – Steady 0.5% daily or SPIN for up to 3%.</h3>
                    <p className="text-gray-300 text-lg">
                      The Chad Empire rewards the brave. Choose between a steady 0.5% daily return on your staked tokens, or test your luck with the SPIN feature for a chance to earn up to 3% in a single day. The choice is yours, but true Chads know when to take risks.
                    </p>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-gray-800/50 border border-chad-neon/20 rounded-lg p-6 text-center">
                        <div className="text-2xl font-bold text-chad-neon mb-2">STEADY</div>
                        <div className="text-4xl font-bold text-white mb-3">0.5%</div>
                        <div className="text-gray-300">Daily guaranteed return</div>
                        <div className="mt-4">
                          <button 
                            className="inline-block bg-transparent border-2 border-chad-neon text-chad-neon hover:text-white rounded-lg px-6 py-2 transition-all duration-300"
                            style={{ boxShadow: '0 0 10px rgba(0, 255, 247, 0.3)' }}
                          >
                            Stake Now
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-800/50 border border-chad-pink/30 rounded-lg p-6 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-chad-pink/10 to-chad-primary/10"></div>
                        <div className="relative">
                          <div className="text-2xl font-bold text-chad-pink mb-2">SPIN</div>
                          <div className="text-4xl font-bold text-white mb-3">UP TO 3%</div>
                          <div className="text-gray-300">Daily potential return</div>
                          <div className="mt-4">
                            <button 
                              className="inline-block bg-transparent border-2 border-chad-pink text-chad-pink hover:text-white rounded-lg px-6 py-2 transition-all duration-300"
                              style={{ boxShadow: '0 0 10px rgba(255, 0, 184, 0.3)' }}
                            >
                              Spin Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Boosters Section */}
        <section id="boosters" className="py-16 px-4 sm:px-6 lg:px-8 bg-black">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-chad-pink to-chad-neon text-transparent bg-clip-text">Boosters</span>
            </h2>
            <p className="text-center text-gray-300 mb-8 max-w-3xl mx-auto">
              Supercharge your Chad experience with these powerful boosters that increase your chances and rewards.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Yield Amplifier",
                  description: "Increases your yield rewards by 1.5x for 24 hours.",
                  icon: "⚡",
                  color: "from-chad-pink to-chad-purple"
                },
                {
                  title: "Lucky Charm",
                  description: "Increases your winning probability by 10% for your next 5 spins.",
                  icon: "🍀",
                  color: "from-chad-neon to-chad-gold"
                },
                {
                  title: "Chad Shield",
                  description: "Protects you from losing your next 3 spins, guaranteeing at least a break-even result.",
                  icon: "🛡️",
                  color: "from-chad-gold to-chad-error"
                }
              ].map((booster, index) => (
                <div key={index} className="bg-gradient-to-br from-chad-dark/80 to-black p-6 rounded-xl border border-gray-800 shadow-lg hover:shadow-xl hover:border-chad-neon/30 transition-all duration-300 transform hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${booster.color} flex items-center justify-center text-2xl mb-4`}>
                    {booster.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{booster.title}</h3>
                  <p className="text-gray-300">{booster.description}</p>
                  <button className="mt-4 px-4 py-2 bg-transparent border border-chad-neon text-chad-neon rounded-full text-sm hover:bg-chad-neon/10 transition-all">
                    Activate Booster
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Lottery Section */}
        <section id="lottery" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-chad-dark to-black">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-chad-pink to-chad-neon text-transparent bg-clip-text">Lottery</span>
            </h2>
            <p className="text-center text-gray-300 mb-8 max-w-3xl mx-auto">
              Test your luck in the weekly Chad Lottery with massive token prizes and exclusive rewards.
            </p>
            
            <div className="bg-gradient-to-br from-chad-dark/80 to-black p-8 rounded-xl border border-gray-800 shadow-lg max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-chad-gold mb-2">Current Jackpot</h3>
                  <p className="text-4xl font-bold text-white">250,000 <span className="text-chad-neon">$CHAD</span></p>
                  <p className="text-gray-400 mt-1">≈ $12,500 USD</p>
                </div>
                <div className="mt-6 md:mt-0 text-center">
                  <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                    <p className="text-gray-300 mb-2">Next Draw In:</p>
                    <div className="flex justify-center space-x-4">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-white">2</span>
                        <span className="text-xs text-gray-400">Days</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-white">14</span>
                        <span className="text-xs text-gray-400">Hours</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-white">36</span>
                        <span className="text-xs text-gray-400">Minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                  <h4 className="text-lg font-bold text-white mb-2">How to Enter</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-chad-pink mr-2">•</span>
                      <p className="text-gray-300">Buy tickets for 10 $CHAD each</p>
                    </li>
                    <li className="flex items-start">
                      <span className="text-chad-pink mr-2">•</span>
                      <p className="text-gray-300">Each ticket gives you a random 4-digit number</p>
                    </li>
                    <li className="flex items-start">
                      <span className="text-chad-pink mr-2">•</span>
                      <p className="text-gray-300">Match numbers to win prizes</p>
                    </li>
                  </ul>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                  <h4 className="text-lg font-bold text-white mb-2">Prize Distribution</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-chad-gold mr-2">•</span>
                      <p className="text-gray-300">Match all 4: 70% of pool</p>
                    </li>
                    <li className="flex items-start">
                      <span className="text-chad-gold mr-2">•</span>
                      <p className="text-gray-300">Match 3: 20% of pool</p>
                    </li>
                    <li className="flex items-start">
                      <span className="text-chad-gold mr-2">•</span>
                      <p className="text-gray-300">Match 2: 10% of pool</p>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="px-8 py-4 bg-gradient-to-r from-chad-pink to-chad-neon text-black font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-chad-pink/20">
                  Buy Tickets
                </button>
                <button className="px-8 py-4 border border-chad-purple text-white rounded-full hover:bg-chad-purple/10 transition-all shadow-lg shadow-chad-purple/20">
                  View Past Draws
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Tokenomics Section */}
        <section id="tokenomics" className="py-16 px-4 sm:px-6 lg:px-8 bg-chad-dark">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-chad-pink to-chad-neon text-transparent bg-clip-text">Tokenomics</span>
            </h2>
            <p className="text-center text-gray-300 mb-8 max-w-3xl mx-auto">
              Total Supply: <span className="text-chad-neon font-bold">1,000,000,000</span> $CHAD tokens
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Chart */}
              <div className="bg-gradient-to-br from-chad-dark/80 to-black p-6 rounded-xl border border-gray-800 shadow-lg">
                <TokenomicsChart 
                  data={[
                    { name: 'Fair Launch', value: 30, itemStyle: { color: '#ff00b8' }, emphasis: { itemStyle: { color: '#ff00b8' } } },
                    { name: 'Liquidity', value: 30, itemStyle: { color: '#00fff7' }, emphasis: { itemStyle: { color: '#00fff7' } } },
                    { name: 'Rewards Pool', value: 30, itemStyle: { color: '#ffd700' }, emphasis: { itemStyle: { color: '#ffd700' } } },
                    { name: 'Dev & Marketing', value: 10, itemStyle: { color: '#aa00ff' }, emphasis: { itemStyle: { color: '#aa00ff' } } }
                  ]}
                />
              </div>
              
              {/* Allocation Table */}
              <div className="bg-gradient-to-br from-chad-dark/80 to-black p-6 rounded-xl border border-gray-800 shadow-lg flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-6 text-white text-center">
                  <span className="bg-gradient-to-r from-chad-gold to-chad-neon text-transparent bg-clip-text">Token Allocation</span>
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-3 px-4 text-chad-neon">Category</th>
                        <th className="py-3 px-4 text-chad-neon text-center">Allocation</th>
                        <th className="py-3 px-4 text-chad-neon">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      <tr className="hover:bg-black/30 transition-colors">
                        <td className="py-3 px-4 text-white font-medium">Fair Launch</td>
                        <td className="py-3 px-4 text-chad-pink text-center font-bold">30%</td>
                        <td className="py-3 px-4 text-gray-300">Distributed to early stakers and community supporters</td>
                      </tr>
                      <tr className="hover:bg-black/30 transition-colors">
                        <td className="py-3 px-4 text-white font-medium">Liquidity</td>
                        <td className="py-3 px-4 text-chad-neon text-center font-bold">30%</td>
                        <td className="py-3 px-4 text-gray-300">Paired with SOL on DEXes like Jupiter/Raydium</td>
                      </tr>
                      <tr className="hover:bg-black/30 transition-colors">
                        <td className="py-3 px-4 text-white font-medium">Rewards Pool</td>
                        <td className="py-3 px-4 text-chad-gold text-center font-bold">30%</td>
                        <td className="py-3 px-4 text-gray-300">Used for spin yields, lottery, leaderboards, boosters</td>
                      </tr>
                      <tr className="hover:bg-black/30 transition-colors">
                        <td className="py-3 px-4 text-white font-medium">Dev & Marketing</td>
                        <td className="py-3 px-4 text-chad-purple text-center font-bold">10%</td>
                        <td className="py-3 px-4 text-gray-300">Locked vesting for operational costs, campaigns</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="bg-black/50 p-6 rounded-xl border border-gray-800 max-w-3xl mx-auto">
              <h3 className="text-xl font-bold mb-4 text-chad-neon">Sustainable Tokenomics Model</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-chad-pink mr-2">•</span>
                  <p className="text-gray-300">Buy/Sell fees (5%) → directly feeds the Rewards Pool for sustainable yields</p>
                </li>
                <li className="flex items-start">
                  <span className="text-chad-pink mr-2">•</span>
                  <p className="text-gray-300">Staking incentives reduce circulating supply and reward long-term holders</p>
                </li>
                <li className="flex items-start">
                  <span className="text-chad-pink mr-2">•</span>
                  <p className="text-gray-300">GameFi mechanics create constant token utility and engagement</p>
                </li>
                <li className="flex items-start">
                  <span className="text-chad-pink mr-2">•</span>
                  <p className="text-gray-300">Dev & Marketing allocation is locked with linear vesting over 24 months</p>
                </li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* Fair Launch Section */}
        <FairLaunchSection />
        
        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-chad-dark to-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(170,0,255,0.03)_1px,transparent_1px)] bg-[length:20px_20px] opacity-30"></div>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to join the <span className="bg-gradient-to-r from-chad-pink to-chad-purple text-transparent bg-clip-text">Empire?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Stake. Spin. Win — or lose gloriously and still walk away richer in character.
            </p>
            <Link href="/game" className="px-10 py-5 bg-gradient-to-r from-chad-pink to-chad-neon text-black font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-chad-pink/20 text-lg">
              Enter ChadEmpire
            </Link>
          </div>
        </section>
      </div>
      
      {/* Music Player is now in layout */}
    </main>
  )
}
