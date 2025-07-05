'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the AnimatedBackground to prevent SSR issues
const AnimatedBackground = dynamic(
  () => import('./AnimatedBackground'),
  { ssr: false }
);

interface HeroBackgroundWrapperProps {
  children: React.ReactNode;
}

const HeroBackgroundWrapper: React.FC<HeroBackgroundWrapperProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <>
      {/* Animated background positioned behind everything */}
      {mounted && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <AnimatedBackground variant="nebula" />
        </div>
      )}
      
      {/* Original content */}
      {children}
    </>
  );
};

export default HeroBackgroundWrapper;
