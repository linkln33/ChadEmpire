'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the AnimatedBackground to prevent SSR issues
const AnimatedBackground = dynamic(
  () => import('./AnimatedBackground'),
  { ssr: false }
);

interface PageBackgroundProps {
  children: React.ReactNode;
}

const PageBackground: React.FC<PageBackgroundProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div className="relative min-h-screen">
      {/* Fixed animated background that covers the entire page */}
      {mounted && (
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
          <AnimatedBackground variant="nebula" />
        </div>
      )}
      
      {/* Base gradient overlay for the entire page */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black via-chad-dark to-black opacity-80 pointer-events-none"></div>
      
      {/* Subtle pattern overlay */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle,rgba(0,255,225,0.03)_1px,transparent_1px)] bg-[length:24px_24px] opacity-30 pointer-events-none"></div>
      
      {/* Page content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PageBackground;
