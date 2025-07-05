'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the AnimatedBackground to prevent SSR issues
const AnimatedBackground = dynamic(
  () => import('./AnimatedBackground'),
  { ssr: false }
);

const GlobalBackground: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [variant, setVariant] = useState<'minimal' | 'geometric' | 'nebula'>('minimal');
  const [density, setDensity] = useState<'low' | 'medium' | 'high'>('low');
  
  // Check device performance and set appropriate defaults
  useEffect(() => {
    setMounted(true);
    
    // Simple performance detection
    const checkPerformance = () => {
      // Check if device is likely mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Set lower density for mobile devices
      if (isMobile) {
        setDensity('low');
      }
    };
    
    checkPerformance();
  }, []);
  
  return (
    <>
      {/* Base dark background layer */}
      <div className="fixed inset-0 w-full h-full z-[-2] bg-gradient-to-b from-black via-chad-dark/80 to-black"></div>
      
      {/* Fixed position animated background that covers the entire viewport */}
      {mounted && (
        <div className="fixed inset-0 w-full h-full z-[-1] pointer-events-none">
          <AnimatedBackground variant={variant} density={density} />
        </div>
      )}
    </>
  );
};

export default GlobalBackground;
