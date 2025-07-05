import Link from 'next/link'
import TokenomicsChart from '@/components/charts/TokenomicsChart'
import FairLaunchSection from '@/components/fair-launch/FairLaunchSection'
import HeroText from '@/components/hero/HeroText'
import HeroImage from '@/components/hero/HeroImage'
import SectionTitle from '@/components/common/SectionTitle'
import MusicPlayerWrapper from '@/components/music/MusicPlayerWrapper'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {/* Hero Section */}
        <section id="home" className="relative py-8 md:py-16 lg:py-20 px-2 sm:px-4 lg:px-6 overflow-visible">
            
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-2 md:gap-4">
                <div className="lg:w-2/5 order-2 lg:order-1 pr-4">
                  <HeroText />
                </div>
                
                <div className="lg:w-3/5 mb-6 sm:mb-8 lg:mb-0 lg:mt-0 order-1 lg:order-2 pl-6">
                  <HeroImage />
                </div>
              </div>
            </div>
          </section>
        
        {/* Music Player - Client-side only to avoid hydration errors */}
        <MusicPlayerWrapper />
        
        {/* Chad's Way Section */}
        <section id="chads-way" className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Colorful background elements */}
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-chad-pink/20 to-chad-primary/10 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-gradient-to-r from-chad-neon/20 to-chad-purple/10 blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col items-center mb-12">
              <SectionTitle className="text-center text-4xl md:text-5xl relative">
                <span className="bg-gradient-to-r from-chad-pink via-chad-neon to-chad-primary text-transparent bg-clip-text">Chad's Way</span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-chad-pink via-chad-neon to-chad-primary rounded-full mx-auto w-24"></div>
              </SectionTitle>
              <p className="text-center text-gray-300 max-w-3xl mx-auto text-lg">The path to becoming a true Chad warrior</p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-md border border-chad-neon/30 rounded-xl p-8 shadow-lg shadow-chad-neon/20 w-full mx-auto">
              <div className="space-y-12">
                {/* Step 1 */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative">
                  {/* Animated glow effect behind step indicator */}
                  <div className="absolute -left-4 top-0 w-24 h-24 bg-chad-primary/20 rounded-full blur-xl animate-pulse hidden md:block"></div>
                  
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-chad-primary to-chad-pink border-2 border-white/20 rounded-full flex items-center justify-center text-2xl font-bold text-white relative shadow-lg shadow-chad-primary/30">
                    <div className="absolute inset-0 rounded-full bg-white/10"></div>
                    <span className="relative z-10">1</span>
                  </div>
                  
                  <div className="relative">
                    <h3 className="text-2xl font-bold mb-3">
                      <span className="bg-gradient-to-r from-chad-primary to-chad-pink text-transparent bg-clip-text">Buy $CHAD</span> – Join the army.
                    </h3>
                    <p className="text-gray-300 text-lg">
                      Become part of the Chad Empire by acquiring $CHAD tokens. Your journey to wealth and glory begins with joining the ranks of the Chad army. The more tokens you hold, the stronger your position in the empire.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <div className="bg-gradient-to-r from-gray-800/70 to-gray-900/70 border border-chad-primary/30 rounded-lg px-4 py-2 shadow-lg shadow-chad-primary/20">
                        <span className="bg-gradient-to-r from-chad-primary to-chad-accent text-transparent bg-clip-text font-medium">Token Address:</span>
                        <span className="ml-2 text-gray-300">CHAD1234...5678</span>
                      </div>
                      <button 
                        className="relative overflow-hidden group bg-gradient-to-r from-chad-primary/10 to-chad-pink/10 border-2 border-chad-primary hover:border-chad-pink rounded-lg px-6 py-2 transition-all duration-300"
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-chad-primary to-chad-pink opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                        <span className="relative z-10 bg-gradient-to-r from-chad-primary to-chad-pink text-transparent bg-clip-text font-medium group-hover:text-white transition-all duration-300">Buy on DEX</span>
                        <span className="absolute -bottom-10 left-0 right-0 h-40 bg-gradient-to-t from-chad-primary/20 to-transparent blur-xl transform group-hover:translate-y-[-25px] transition-all duration-500"></span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative">
                  {/* Animated glow effect behind step indicator */}
                  <div className="absolute -left-4 top-0 w-24 h-24 bg-chad-neon/20 rounded-full blur-xl animate-pulse hidden md:block"></div>
                  
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-chad-neon to-chad-accent border-2 border-white/20 rounded-full flex items-center justify-center text-2xl font-bold text-white relative shadow-lg shadow-chad-neon/30">
                    <div className="absolute inset-0 rounded-full bg-white/10"></div>
                    <span className="relative z-10">2</span>
                  </div>
                  
                  <div className="relative">
                    <h3 className="text-2xl font-bold mb-3">
                      <span className="bg-gradient-to-r from-chad-neon to-chad-accent text-transparent bg-clip-text">Stake like a warlord</span> – Bigger stake = Bigger weight.
                    </h3>
                    <p className="text-gray-300 text-lg">
                      True Chads don't just hold, they stake. Staking your $CHAD tokens increases your influence and rewards. The more you stake, the greater your weight in the ecosystem and the higher your potential rewards.
                    </p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 border border-chad-neon/30 rounded-lg p-4 shadow-lg shadow-chad-neon/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-chad-neon/5 rounded-full blur-xl"></div>
                        <div className="text-xl font-bold bg-gradient-to-r from-chad-neon to-chad-accent text-transparent bg-clip-text mb-2">Staking Tiers</div>
                        <div className="text-gray-300 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Chad Recruit</span>
                            <span className="bg-gradient-to-r from-gray-300 to-white text-transparent bg-clip-text">1,000+ $CHAD</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Chad Warrior</span>
                            <span className="bg-gradient-to-r from-chad-neon to-white text-transparent bg-clip-text">10,000+ $CHAD</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Chad Warlord</span>
                            <span className="bg-gradient-to-r from-chad-primary to-chad-accent text-transparent bg-clip-text font-bold">100,000+ $CHAD</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 border border-chad-neon/30 rounded-lg p-4 shadow-lg shadow-chad-neon/10 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-chad-neon/5 rounded-full blur-xl"></div>
                        <div className="text-xl font-bold bg-gradient-to-r from-chad-neon to-chad-accent text-transparent bg-clip-text mb-2">Weight Multipliers</div>
                        <div className="text-gray-300 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Base</span>
                            <span className="bg-gradient-to-r from-gray-300 to-white text-transparent bg-clip-text">1x</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Warrior</span>
                            <span className="bg-gradient-to-r from-chad-neon to-white text-transparent bg-clip-text">1.5x</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Warlord</span>
                            <span className="bg-gradient-to-r from-chad-primary to-chad-accent text-transparent bg-clip-text font-bold">2x</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 3 */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative">
                  {/* Animated glow effect behind step indicator */}
                  <div className="absolute -left-4 top-0 w-24 h-24 bg-chad-pink/20 rounded-full blur-xl animate-pulse hidden md:block"></div>
                  
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-chad-pink to-chad-purple border-2 border-white/20 rounded-full flex items-center justify-center text-2xl font-bold text-white relative shadow-lg shadow-chad-pink/30">
                    <div className="absolute inset-0 rounded-full bg-white/10"></div>
                    <span className="relative z-10">3</span>
                  </div>
                  
                  <div className="relative">
                    <h3 className="text-2xl font-bold mb-3">
                      <span className="bg-gradient-to-r from-chad-pink to-chad-purple text-transparent bg-clip-text">Choose your fate</span> – Steady 0.5% daily or SPIN for up to 3%.
                    </h3>
                    <p className="text-gray-300 text-lg">
                      The Chad Empire rewards the brave. Choose between a steady 0.5% daily return on your staked tokens, or test your luck with the SPIN feature for a chance to earn up to 3% in a single day. The choice is yours, but true Chads know when to take risks.
                    </p>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* STEADY Option */}
                      <div className="bg-gradient-to-br from-gray-800/70 via-gray-900/70 to-gray-800/70 border border-chad-neon/30 rounded-lg p-6 text-center relative overflow-hidden group hover:shadow-lg hover:shadow-chad-neon/20 transition-all duration-300">
                        {/* Background effects */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-chad-neon/40 to-transparent"></div>
                        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-chad-neon/10 rounded-full blur-2xl group-hover:bg-chad-neon/20 transition-all duration-500"></div>
                        
                        <div className="relative">
                          <div className="text-2xl font-bold bg-gradient-to-r from-chad-neon to-chad-accent text-transparent bg-clip-text mb-2">STEADY</div>
                          <div className="text-5xl font-bold text-white mb-3 relative inline-block">
                            <span className="bg-gradient-to-r from-white via-chad-neon to-white text-transparent bg-clip-text">0.5%</span>
                            <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-chad-neon to-transparent"></div>
                          </div>
                          <div className="text-gray-300 mb-6">Daily guaranteed return</div>
                          <div className="mt-4">
                            <button 
                              className="relative overflow-hidden group bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-chad-neon hover:border-white rounded-lg px-6 py-2 transition-all duration-300"
                            >
                              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-chad-neon/20 to-chad-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                              <span className="relative z-10 bg-gradient-to-r from-chad-neon to-chad-accent text-transparent bg-clip-text font-medium group-hover:text-white transition-all duration-300">Stake Now</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* SPIN Option */}
                      <div className="bg-gradient-to-br from-gray-800/70 via-gray-900/70 to-gray-800/70 border border-chad-pink/30 rounded-lg p-6 text-center relative overflow-hidden group hover:shadow-lg hover:shadow-chad-pink/20 transition-all duration-300">
                        {/* Background effects */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-chad-pink/40 to-transparent"></div>
                        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-chad-pink/10 rounded-full blur-2xl group-hover:bg-chad-pink/20 transition-all duration-500"></div>
                        <div className="absolute -right-4 top-4 w-16 h-16 bg-chad-purple/20 rounded-full blur-xl animate-pulse"></div>
                        
                        <div className="relative">
                          <div className="text-2xl font-bold bg-gradient-to-r from-chad-pink to-chad-purple text-transparent bg-clip-text mb-2">SPIN</div>
                          <div className="text-5xl font-bold text-white mb-3 relative inline-block">
                            <span className="bg-gradient-to-r from-white via-chad-pink to-white text-transparent bg-clip-text">UP TO 3%</span>
                            <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-chad-pink to-transparent"></div>
                          </div>
                          <div className="text-gray-300 mb-6">Daily potential return</div>
                          <div className="mt-4">
                            <button 
                              className="relative overflow-hidden group bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-chad-pink hover:border-white rounded-lg px-6 py-2 transition-all duration-300"
                            >
                              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-chad-pink/20 to-chad-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                              <span className="relative z-10 bg-gradient-to-r from-chad-pink to-chad-purple text-transparent bg-clip-text font-medium group-hover:text-white transition-all duration-300">Spin Now</span>
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
        <section id="boosters" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionTitle className="text-center">
              <span className="bg-gradient-to-r from-chad-pink to-chad-neon text-transparent bg-clip-text">Boosters</span>
            </SectionTitle>
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
        <section id="lottery" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionTitle className="text-center">
              <span className="bg-gradient-to-r from-chad-pink to-chad-neon text-transparent bg-clip-text">Lottery</span>
            </SectionTitle>
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
        <section id="tokenomics" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionTitle className="text-center">
              <span className="bg-gradient-to-r from-chad-pink to-chad-neon text-transparent bg-clip-text">Tokenomics</span>
            </SectionTitle>
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
                  <p className="text-gray-300">Buy/Sell fees (10%) → directly feeds the Rewards Pool for sustainable yields</p>
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
        <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
    </main>
  )
}
