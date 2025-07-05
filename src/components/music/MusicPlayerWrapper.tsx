'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import MusicPlayer with no SSR to avoid hydration errors
const MusicPlayerContainer = dynamic(() => import('./MusicPlayerContainer'), {
  ssr: false
});

const MusicPlayerWrapper: React.FC = () => {
  // Use state to track if component is mounted (client-side only)
  const [isMounted, setIsMounted] = useState(false);
  
  // Only render on client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null; // Return nothing during initial render
  }
  
  return <MusicPlayerContainer />;
};

export default MusicPlayerWrapper;
