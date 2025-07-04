'use client';

import React from 'react';
import Link from 'next/link';
import TypewriterQuotes from './TypewriterQuotes';
import { FaTwitter, FaTelegram } from 'react-icons/fa';

const HeroText: React.FC = () => {
  return (
    <div className="text-left w-full overflow-visible">
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-3 md:mb-4 gradient-text leading-none" style={{ fontFamily: "'Game Of Squids', sans-serif" }}>
        CHAD<br />
        EMPIRE
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
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center sm:justify-start mt-2">
        <Link href="/game" className="w-[70%] sm:w-auto mx-auto sm:mx-0 px-6 sm:px-8 py-3 sm:py-4 text-center bg-gradient-to-r from-chad-pink to-chad-neon text-black font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-chad-pink/20">
          Start Spinning
        </Link>
        <Link href="/tokenomics" className="w-[70%] sm:w-auto mx-auto sm:mx-0 px-6 sm:px-8 py-3 sm:py-4 text-center border border-chad-purple text-white rounded-full hover:bg-chad-purple/10 transition-all shadow-lg shadow-chad-purple/20">
          Tokenomics
        </Link>
      </div>
      
      {/* Social Media Links */}
      <div className="flex items-center gap-4 mt-4 justify-center sm:justify-start">
        <a 
          href="https://x.com/chad_warriors" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-300 hover:text-chad-pink transition-colors"
        >
          <FaTwitter className="text-xl" />
          <span>@chad_warriors</span>
        </a>
        <a 
          href="https://t.me/ChadEmpire_Official" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-300 hover:text-chad-neon transition-colors"
        >
          <FaTelegram className="text-xl" />
          <span>@ChadEmpire_Official</span>
        </a>
      </div>
    </div>
  );
};

export default HeroText;
