'use client';

import React from 'react';
import Image from 'next/image';

const HeroImage: React.FC = () => {
  return (
    <div className="relative">
      {/* Static glows for SSR and fallback */}
      <div className="absolute -top-10 left-0 w-40 h-40 bg-chad-pink/20 rounded-full blur-3xl z-10"></div>
      <div className="absolute -bottom-10 -right-5 w-40 h-40 bg-chad-neon/20 rounded-full blur-3xl z-10"></div>
      
      <div className="relative">
        <div className="absolute inset-0 translate-x-16 bg-gradient-to-tr from-chad-pink/20 to-chad-neon/20 rounded-full blur-3xl z-10"></div>
        
        <div className="relative z-10 flex justify-center md:justify-end items-center">
          <div className="relative flex justify-center md:justify-end items-center mr-0 md:mr-[-100px] lg:mr-[-150px]">
            <Image 
              src="/images/chad-warrior.svg" 
              alt="Chad Warrior" 
              width={735}
              height={735}
              className="w-[315px] h-[315px] sm:w-[420px] sm:h-[420px] md:w-[578px] md:h-[578px] lg:w-[735px] lg:h-[735px] drop-shadow-[0_0_15px_rgba(255,0,184,0.5)]"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroImage;
