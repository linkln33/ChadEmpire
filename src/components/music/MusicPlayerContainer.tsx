'use client';

import React, { useEffect, useState } from 'react';
import MusicPlayer from './MusicPlayer';

const MusicPlayerContainer: React.FC = () => {
  // Use state to track if component is mounted (client-side only)
  const [isMounted, setIsMounted] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);
  
  // Only render on client side to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    
    // Check if user has visited before in this session
    const visited = sessionStorage.getItem('hasVisitedBefore');
    setHasVisited(visited === 'true');
    
    // Mark that user has visited
    sessionStorage.setItem('hasVisitedBefore', 'true');
  }, []);
  
  if (!isMounted) {
    return null; // Return nothing during SSR
  }
  
  return (
    <div className="fixed bottom-8 right-8 z-50 transition-opacity duration-300" id="music-player-container">
      <MusicPlayer 
        audioSrc="/music/Chad-EmpireTM.mp3" 
        audioTitle="Chad Empire Mix" 
        autoPlay={true}
      />
      <div className="text-xs text-chad-pink/70 mt-1 text-center animate-pulse">
        Click anywhere to unmute
      </div>
    </div>
  );
};

export default MusicPlayerContainer;
