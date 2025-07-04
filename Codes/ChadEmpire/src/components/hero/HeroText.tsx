'use client';

import React from 'react';
import Link from 'next/link';
import TypewriterQuotes from './TypewriterQuotes';

const HeroText: React.FC = () => {
  return (
    <div className="text-left">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-chad-pink to-chad-purple text-transparent bg-clip-text font-['Anton']">
        ChadEmpire
      </h1>
      <div className="flex items-center mb-3 md:mb-4">
        <span className="text-xl sm:text-2xl mr-2">🎭</span>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-chad-gold">
          The Cult of Infinite Yield
        </p>
      </div>
      <p className="text-base sm:text-lg text-gray-300 mb-8 md:mb-10 italic border-l-4 border-chad-pink pl-3 sm:pl-4">
        "In the barren wastelands of rugpulls and LARPing LPs, one giga-chad dared to farm... differently."
      </p>
      
      {/* Animated Typewriter Quotes */}
      <TypewriterQuotes />
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center sm:justify-start">
        <Link href="/game" className="w-[70%] sm:w-auto mx-auto sm:mx-0 px-6 sm:px-8 py-3 sm:py-4 text-center bg-gradient-to-r from-chad-pink to-chad-neon text-black font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-chad-pink/20">
          Start Spinning
        </Link>
        <Link href="/tokenomics" className="w-[70%] sm:w-auto mx-auto sm:mx-0 px-6 sm:px-8 py-3 sm:py-4 text-center border border-chad-purple text-white rounded-full hover:bg-chad-purple/10 transition-all shadow-lg shadow-chad-purple/20">
          Tokenomics
        </Link>
      </div>
    </div>
  );
};

export default HeroText;
