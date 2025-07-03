'use client';

import { useEffect, useState } from 'react';

interface SpinResultProps {
  result: {
    type: 'win' | 'consolation';
    yieldPercentage?: string;
    yieldAmount?: string;
    consolationType?: string;
    consolationAmount?: number;
    message: string;
  };
}

export function SpinResult({ result }: SpinResultProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    if (result.type === 'win') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [result]);
  
  return (
    <div className={`rounded-xl p-6 text-center ${
      result.type === 'win' 
        ? 'bg-gradient-to-br from-chad-success/20 to-chad-success/5 border border-chad-success/30' 
        : 'bg-gradient-to-br from-chad-accent/20 to-chad-accent/5 border border-chad-accent/30'
    }`}>
      <h3 className={`text-2xl font-bold mb-3 ${
        result.type === 'win' ? 'text-chad-success' : 'text-chad-accent'
      }`}>
        {result.type === 'win' ? 'You Won!' : 'Consolation Prize'}
      </h3>
      
      <p className="text-lg mb-4">{result.message}</p>
      
      {result.type === 'win' && (
        <div className="bg-chad-dark/50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Yield Rate:</span>
            <span className="font-bold text-chad-success">{result.yieldPercentage}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Tokens Earned:</span>
            <span className="font-bold text-chad-success">{result.yieldAmount} $CHAD</span>
          </div>
        </div>
      )}
      
      {result.type === 'consolation' && (
        <div className="bg-chad-dark/50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Reward:</span>
            <span className="font-bold text-chad-accent">
              {result.consolationType === 'chad_score' && `+${result.consolationAmount} Chad Score`}
              {result.consolationType === 'lottery_ticket' && `${result.consolationAmount} Lottery Ticket`}
              {result.consolationType === 'booster_fragment' && `${result.consolationAmount} Booster Fragment`}
              {result.consolationType === 'bonus_spin' && `${result.consolationAmount} Bonus Spin Token`}
            </span>
          </div>
        </div>
      )}
      
      <button className="bg-chad-primary/20 hover:bg-chad-primary/30 text-chad-primary font-semibold py-2 px-6 rounded-lg transition-colors">
        View History
      </button>
      
      {/* Confetti effect for wins */}
      {showConfetti && (
        <>
          {Array.from({ length: 50 }).map((_, i) => {
            const size = Math.random() * 10 + 5;
            const left = Math.random() * 100;
            const delay = Math.random() * 2;
            const color = ['#FF6B35', '#4361EE', '#FFD166', '#06D6A0'][Math.floor(Math.random() * 4)];
            
            return (
              <div 
                key={i}
                className="confetti fixed"
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: color,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </>
      )}
    </div>
  );
}
