'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';

export default function LotteryPage() {
  const { publicKey } = useWallet();
  const { lotteryTickets } = useUserStore();
  const { systemStats } = useGameStore();
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // Past winners (mock data)
  const pastDraws = [
    {
      id: 'draw-12',
      date: '2025-06-26',
      jackpot: '4,250',
      winningNumbers: '8-14-22-37-41-59',
      winners: 2,
    },
    {
      id: 'draw-11',
      date: '2025-06-19',
      jackpot: '3,750',
      winningNumbers: '3-7-19-24-33-58',
      winners: 1,
    },
    {
      id: 'draw-10',
      date: '2025-06-12',
      jackpot: '5,120',
      winningNumbers: '11-17-23-29-45-52',
      winners: 3,
    },
  ];
  
  // Calculate time remaining until next draw
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const drawTime = new Date(systemStats.nextLotteryDraw);
      const totalSeconds = Math.max(0, Math.floor((drawTime.getTime() - now.getTime()) / 1000));
      
      const days = Math.floor(totalSeconds / (24 * 60 * 60));
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      
      setTimeRemaining({ days, hours, minutes, seconds });
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [systemStats.nextLotteryDraw]);
  
  // Format ticket number for display
  const formatTicketNumber = (number: string) => {
    return number.split('-').join(' - ');
  };
  
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <main className="max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">ChadEmpire Lottery</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Weekly draws with massive $CHAD prizes! Earn tickets by spinning the wheel or purchase them directly.
            </p>
          </div>
          
          {/* Current jackpot */}
          <div className="chad-card mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-chad-primary/20 to-chad-accent/20 z-0"></div>
            <div className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Current Jackpot</h2>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-chad-primary">{systemStats.lotteryPool.toLocaleString()}</span>
                    <span className="ml-2 text-2xl">$CHAD</span>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Next Draw In:</h3>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-black/30 rounded-lg p-3 text-center">
                        <span className="text-2xl font-bold">{timeRemaining.days}</span>
                        <p className="text-xs text-gray-400">Days</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 text-center">
                        <span className="text-2xl font-bold">{timeRemaining.hours}</span>
                        <p className="text-xs text-gray-400">Hours</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 text-center">
                        <span className="text-2xl font-bold">{timeRemaining.minutes}</span>
                        <p className="text-xs text-gray-400">Minutes</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 text-center">
                        <span className="text-2xl font-bold">{timeRemaining.seconds}</span>
                        <p className="text-xs text-gray-400">Seconds</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button 
                      className="bg-chad-primary hover:bg-chad-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                      onClick={() => alert('Ticket purchase coming soon!')}
                    >
                      Buy Tickets
                    </button>
                    <p className="text-sm text-gray-400 mt-2">1 Ticket = 10 $CHAD</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">How It Works</h3>
                  <ul className="space-y-4">
                    <li className="flex">
                      <div className="bg-chad-primary/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-chad-primary font-bold">1</span>
                      </div>
                      <div>
                        <p>Earn lottery tickets by spinning the wheel or purchase them directly</p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="bg-chad-primary/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-chad-primary font-bold">2</span>
                      </div>
                      <div>
                        <p>Weekly draws every Friday at 20:00 UTC</p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="bg-chad-primary/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-chad-primary font-bold">3</span>
                      </div>
                      <div>
                        <p>Match 3+ numbers to win prizes</p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="bg-chad-primary/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-chad-primary font-bold">4</span>
                      </div>
                      <div>
                        <p>10% of all spin fees go to the lottery pool</p>
                      </div>
                    </li>
                  </ul>
                  
                  <div className="mt-6 bg-black/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Prize Distribution</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Match 6</span>
                        <span>Jackpot (50%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Match 5</span>
                        <span>25% of pool</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Match 4</span>
                        <span>15% of pool</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Match 3</span>
                        <span>10% of pool</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* User's tickets */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Tickets</h2>
            
            {!publicKey ? (
              <div className="chad-card text-center py-10">
                <p className="text-xl mb-4">Connect your wallet to view your lottery tickets</p>
                <p className="text-gray-400">You'll need to connect your Solana wallet to see your tickets and participate in the lottery</p>
              </div>
            ) : lotteryTickets.length === 0 ? (
              <div className="chad-card text-center py-10">
                <p className="text-xl mb-4">You don't have any lottery tickets yet</p>
                <p className="text-gray-400 mb-6">Earn tickets by spinning the wheel or purchase them directly</p>
                <button 
                  className="bg-chad-primary hover:bg-chad-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  onClick={() => alert('Ticket purchase coming soon!')}
                >
                  Buy Tickets
                </button>
              </div>
            ) : (
              <div className="chad-card">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {lotteryTickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className={`bg-black/30 rounded-lg p-4 border ${
                        ticket.isWinner ? 'border-chad-accent' : 'border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Ticket #{ticket.id.substring(0, 8)}</span>
                        {ticket.isWinner && (
                          <span className="bg-chad-accent/20 text-chad-accent text-xs px-2 py-1 rounded-full">
                            Winner!
                          </span>
                        )}
                      </div>
                      <div className="bg-chad-dark rounded-lg p-3 text-center mb-2">
                        <span className="font-mono text-lg">{formatTicketNumber(ticket.ticketNumber)}</span>
                      </div>
                      <div className="text-xs text-gray-400 text-right">
                        Draw: {ticket.lotteryDrawId || 'Upcoming'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Past draws */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Past Draws</h2>
            
            <div className="chad-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-black/30">
                      <th className="py-4 px-6 text-left">Draw</th>
                      <th className="py-4 px-6 text-left">Date</th>
                      <th className="py-4 px-6 text-left">Winning Numbers</th>
                      <th className="py-4 px-6 text-right">Jackpot</th>
                      <th className="py-4 px-6 text-right">Winners</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastDraws.map((draw, index) => (
                      <tr 
                        key={draw.id} 
                        className={`border-t border-chad-primary/10 ${
                          index % 2 === 0 ? 'bg-black/20' : ''
                        }`}
                      >
                        <td className="py-4 px-6">#{draw.id.split('-')[1]}</td>
                        <td className="py-4 px-6">{draw.date}</td>
                        <td className="py-4 px-6 font-mono">{draw.winningNumbers}</td>
                        <td className="py-4 px-6 text-right text-chad-accent">{draw.jackpot} $CHAD</td>
                        <td className="py-4 px-6 text-right">{draw.winners}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* FAQ */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Lottery FAQ</h2>
            
            <div className="chad-card">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">How do I get lottery tickets?</h3>
                  <p className="text-gray-300">
                    You can earn lottery tickets as consolation prizes when spinning the wheel (approximately 20% chance when you don't win yield). 
                    You can also purchase tickets directly for 10 $CHAD each.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">When are the lottery draws?</h3>
                  <p className="text-gray-300">
                    Draws happen every Friday at 20:00 UTC. The results are published immediately and winners can claim their prizes right away.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">How are winning numbers generated?</h3>
                  <p className="text-gray-300">
                    Winning numbers are generated using Chainlink VRF (Verifiable Random Function) to ensure fair and transparent randomness 
                    that cannot be manipulated or predicted.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">What happens if nobody wins the jackpot?</h3>
                  <p className="text-gray-300">
                    If no one matches all 6 numbers, 50% of the jackpot rolls over to the next draw, and 50% is distributed among the partial matches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
