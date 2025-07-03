import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-chad-dark to-black opacity-90"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,255,225,0.05)_1px,transparent_1px)] bg-[length:24px_24px] opacity-30"></div>
          </div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="lg:w-1/2 text-left">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-chad-pink to-chad-purple text-transparent bg-clip-text font-['Anton']">
                  ChadEmpire
                </h1>
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-2">🎭</span>
                  <p className="text-xl md:text-2xl font-bold text-chad-gold">
                    The Cult of Infinite Yield
                  </p>
                </div>
                <p className="text-lg text-gray-300 mb-6 italic border-l-4 border-chad-pink pl-4">
                  "In the barren wastelands of rugpulls and LARPing LPs, one giga-chad dared to farm... differently."
                </p>
                
                <p className="text-lg text-gray-300 mb-6">
                  "Chads don't just buy the dip — they yield farm it, stake it, and wreck paper hands. The Chad Warrior is the final form of the degen: no rugs, no burns, just pure community-backed dominance."
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="text-chad-neon mr-3">⚡</div>
                    <p className="text-gray-300">Chad is the eternal Yield Warrior sent by the RNG Gods to redistribute real returns to the faithful.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="text-chad-pink mr-3">💪</div>
                    <p className="text-gray-300">Every spin is a battle. Every yield is a flex. Every loss is a badge of honor.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="text-chad-gold mr-3">👑</div>
                    <p className="text-gray-300">You're not just farming. You're living the ChadLife™.</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/game" className="px-8 py-4 bg-gradient-to-r from-chad-pink to-chad-neon text-black font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-chad-pink/20">
                    Start Spinning
                  </Link>
                  <Link href="/tokenomics" className="px-8 py-4 border border-chad-purple text-white rounded-full hover:bg-chad-purple/10 transition-all shadow-lg shadow-chad-purple/20">
                    Tokenomics
                  </Link>
                </div>
              </div>
              
              <div className="lg:w-1/2 relative mt-8 lg:mt-0">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-chad-pink/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-chad-neon/20 rounded-full blur-3xl"></div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-chad-pink/20 to-chad-neon/20 rounded-full blur-3xl"></div>
                  <div className="relative z-10 flex justify-center items-center">
                    <div className="relative w-full max-w-[110%] aspect-square scale-110">
                      <Image 
                        src="/images/chad-warrior.svg" 
                        alt="Chad Warrior" 
                        fill
                        className="max-w-full h-auto drop-shadow-[0_0_15px_rgba(255,0,184,0.5)]"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-chad-dark">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-chad-pink to-chad-neon text-transparent bg-clip-text">How It Works</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Stake $CHAD",
                  description: "Stake your $CHAD tokens to activate your daily spin and join the empire.",
                  icon: "🪙",
                  color: "from-chad-pink/20 to-chad-pink/5"
                },
                {
                  title: "Spin Daily",
                  description: "Pay 5 tokens per spin and test your luck with the wheel of fortune.",
                  icon: "🎡",
                  color: "from-chad-neon/20 to-chad-neon/5"
                },
                {
                  title: "Win Yield",
                  description: "60% chance to win yield between 0.1% and 3% of your stake.",
                  icon: "💰",
                  color: "from-chad-gold/20 to-chad-gold/5"
                },
                {
                  title: "Earn Rewards",
                  description: "Even losses give you valuable consolation prizes and boost your Chad Score.",
                  icon: "🏆",
                  color: "from-chad-error/20 to-chad-error/5"
                }
              ].map((feature, index) => (
                <div key={index} className={`bg-gradient-to-b ${feature.color} p-6 rounded-xl border border-chad-dark shadow-lg flex flex-col items-center text-center`}>
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Tokenomics Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-chad-dark">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-chad-pink to-chad-neon text-transparent bg-clip-text">Tokenomics</span>
            </h2>
            <p className="text-center text-gray-300 mb-8 max-w-3xl mx-auto">
              Our revolutionary multi-fee ecosystem creates a self-sustaining yield machine that rewards players while maintaining long-term sustainability.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-center mb-12">
              {[
                { label: "Fair Launch", value: "25%", color: "bg-chad-pink" },
                { label: "Liquidity", value: "25%", color: "bg-chad-neon" },
                { label: "Rewards Pool", value: "30%", color: "bg-chad-gold" },
                { label: "Dev & Marketing", value: "15%", color: "bg-chad-purple" },
                { label: "Treasury", value: "5%", color: "bg-chad-error" }
              ].map((item, index) => (
                <div key={index} className="bg-gradient-to-b from-black to-chad-dark p-6 rounded-xl border border-gray-800 flex flex-col items-center">
                  <div className={`w-full h-2 ${item.color} rounded-full mb-4 shadow-lg shadow-${item.color.replace('bg-', '')}/30`}></div>
                  <p className="text-3xl font-bold mb-2">{item.value}</p>
                  <p className="text-sm text-gray-400">{item.label}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-black/50 p-6 rounded-xl border border-gray-800 max-w-3xl mx-auto">
              <h3 className="text-xl font-bold mb-4 text-chad-neon">This model is self-sustaining through:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-chad-pink mr-2">•</span>
                  <p className="text-gray-300">Buy/Sell fees (10%) → fills the Rewards Pool.</p>
                </li>
                <li className="flex items-start">
                  <span className="text-chad-pink mr-2">•</span>
                  <p className="text-gray-300">Locking & staking reduce circulating supply.</p>
                </li>
                <li className="flex items-start">
                  <span className="text-chad-pink mr-2">•</span>
                  <p className="text-gray-300">GameFi mechanics (lottery, leaderboards) keep users engaged.</p>
                </li>
                <li className="flex items-start">
                  <span className="text-chad-pink mr-2">•</span>
                  <p className="text-gray-300">Marketing wallet is vested and used for growth, not profit.</p>
                </li>
              </ul>
            </div>
          </div>
        </section>
        
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
    </main>
  )
}
