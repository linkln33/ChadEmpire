'use client';

import React, { useState, useEffect, useRef } from 'react';

const quotes = [
  { emoji: '🚁', text: "Born poor, yield rich. Lambo in spirit, yacht in execution." },
  { emoji: '🧃', text: "He drank the alpha, staked the yield, and woke up in Dubai." },
  { emoji: '🔥', text: "This ain't just farming — it's gladiator combat with APY weapons." },
  { emoji: '💼', text: "From MetaMask to MegaYacht — one Chad's journey." },
  { emoji: '💸', text: "Gas fees? I tip with those." },
  { emoji: '🏝️', text: "We don't retire. We respawn on private islands." },
  { emoji: '🚀', text: "Staking is religion. Lambos are baptism. Rugs are trials." },
  { emoji: '👑', text: "Chads aren't born — they're minted." },
  { emoji: '🐋', text: "He came for the memes. He stayed for the 1000x. He left in a Lambo." },
  { emoji: '🎲', text: "Every degen play is a prayer to the RNG Gods. Blessed be the Chad." },
  { emoji: '👘', text: "Yacht party. Silk robe. Wallet full of war stories and airdrops." },
  { emoji: '📉', text: "While others panic sell, the Chad DCA's into Valhalla." },
  { emoji: '🎯', text: "He doesn't chase pumps — pumps chase him." },
  { emoji: '💀', text: "Not financial advice — spiritual prophecy." },
  { emoji: '🦍', text: "Alpha isn't found. Alpha is conquered." },
  { emoji: '🛡️', text: "DeFi Knight. JPEG Samurai. Lord of Liquidations." },
  { emoji: '🕊️', text: "When the market bleeds, Chads drink its essence." },
  { emoji: '📜', text: "In the age of rugs, one Chad farmed the truth." },
  { emoji: '🚤', text: "Exit liquidity? No. This is an arrival strategy." },
  { emoji: '🥇', text: "The top isn't the goal — it's the launchpad." }
];

const TypewriterQuotes: React.FC = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentQuote = quotes[currentQuoteIndex].text;
    
    if (isTyping) {
      if (charIndex < currentQuote.length) {
        // Typing effect
        const typingTimer = setTimeout(() => {
          setDisplayText(prev => prev + currentQuote[charIndex]);
          setCharIndex(charIndex + 1);
        }, 50); // Speed of typing
        
        return () => clearTimeout(typingTimer);
      } else {
        // Finished typing, pause before erasing
        const pauseTimer = setTimeout(() => {
          setIsTyping(false);
        }, 3000); // Pause time after typing
        
        return () => clearTimeout(pauseTimer);
      }
    } else {
      if (charIndex > 0) {
        // Erasing effect
        const erasingTimer = setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1));
          setCharIndex(charIndex - 1);
        }, 30); // Speed of erasing (faster than typing)
        
        return () => clearTimeout(erasingTimer);
      } else {
        // Finished erasing, move to next quote
        const nextQuoteTimer = setTimeout(() => {
          setCurrentQuoteIndex((currentQuoteIndex + 1) % quotes.length);
          setIsTyping(true);
        }, 500); // Pause before next quote
        
        return () => clearTimeout(nextQuoteTimer);
      }
    }
  }, [currentQuoteIndex, charIndex, isTyping]);

  // Get the current quote's emoji
  const currentEmoji = quotes[currentQuoteIndex].emoji;

  return (
    <div className="mb-3 mt-6" ref={containerRef}>
      <div className="flex bg-black/30 p-4 rounded-lg shadow-inner shadow-chad-pink/20 h-[100px] sm:h-[120px]">
        <div className="text-3xl mr-3 flex-shrink-0 self-start mt-1 animate-bounce">
          {currentEmoji}
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-base sm:text-lg md:text-xl">
            <span className="bg-gradient-to-r from-chad-pink via-chad-gold to-chad-neon bg-clip-text text-transparent font-bold" style={{ fontFamily: "'Starshines', sans-serif" }}>
              {displayText}
            </span>
            <span className="animate-pulse text-chad-neon ml-0.5" style={{ fontFamily: "'Starshines', sans-serif" }}>
              |
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TypewriterQuotes;
