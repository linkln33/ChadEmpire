'use client';

import React, { useState, useRef, useEffect } from 'react';

interface MusicPlayerProps {
  audioSrc: string;
  audioTitle?: string;
  autoPlay?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ audioSrc, audioTitle = 'Chad Mix', autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false); // Starts minimized by default
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    // Event listeners
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.volume = volume;

    // Cleanup
    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
    };
  }, [volume]);
  
  // Handle autoplay when component mounts with fallback strategies
  useEffect(() => {
    if (!autoPlay || !audioRef.current) return;
    
    // First try muted autoplay (more likely to be allowed by browsers)
    const audio = audioRef.current;
    
    // Function to handle user interaction for unmuting
    const handleUserInteraction = () => {
      if (audio && audio.muted) {
        audio.muted = false;
        audio.volume = volume; // Restore volume after unmuting
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      }
    };
    
    // Wait for document to be fully loaded
    if (document.readyState === 'complete') {
      initializeAudio();
    } else {
      window.addEventListener('load', initializeAudio, { once: true });
    }
    
    function initializeAudio() {
      // Set muted state first
      audio.muted = true;
      
      // Store user's session preference in sessionStorage
      const hasInteracted = sessionStorage.getItem('userHasInteracted');
      
      // Small delay to ensure browser is ready
      setTimeout(() => {
        // Try to play muted first
        audio.play().then(() => {
          // If muted play works, set playing state but keep minimized
          setIsPlaying(true);
          
          // If user has previously interacted in this session, unmute
          if (hasInteracted === 'true') {
            audio.muted = false;
          } else {
            // Listen for user interaction to unmute
            document.addEventListener('click', handleUserInteraction);
            document.addEventListener('touchstart', handleUserInteraction);
            document.addEventListener('keydown', handleUserInteraction);
          }
          
        }).catch(error => {
          console.error("Autoplay failed:", error);
          // If autoplay fails, we'll wait for user interaction
        });
      }, 1000);
    }
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('load', initializeAudio);
    };
  }, [autoPlay, volume]);

  // Handle play/pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      // Store that user has interacted with the player
      sessionStorage.setItem('userHasInteracted', 'true');
      
      // Make sure audio is not muted when user explicitly presses play
      if (audio.muted) {
        audio.muted = false;
        audio.volume = volume;
      }
      
      audio.play().catch(error => {
        console.error("Audio playback error:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || isNaN(audioRef.current.duration)) return;
    
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };
  
  // Format time for debugging if needed
  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="transition-all duration-300">
      <div className={`${isExpanded ? 'w-64' : 'w-36'}`}>
        {/* X button to minimize player - positioned outside */}
        {isExpanded && (
          <button 
            onClick={() => setIsExpanded(false)} 
            className="absolute -top-3 -right-3 w-7 h-7 bg-gradient-to-r from-chad-pink to-chad-purple rounded-full flex items-center justify-center hover:opacity-80 transition-opacity shadow-lg shadow-chad-pink/40 border border-white/20 z-10"
          >
            <span className="text-white text-xs font-bold">X</span>
          </button>
        )}
        
        <div className="bg-black/70 backdrop-blur-md rounded-full p-3 shadow-lg shadow-chad-pink/30 border border-chad-purple/30">
          <div className="flex items-center gap-2">
            {/* Toggle expand button */}
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="w-10 h-10 flex-shrink-0 bg-gradient-to-r from-chad-pink to-chad-purple rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <span className="text-white text-xl">
                {isExpanded ? '🎧' : '🎵'}
              </span>
            </button>
            
            {/* Play/Pause button - Always visible */}
            <button 
              onClick={togglePlay}
              className="w-10 h-10 bg-gradient-to-r from-chad-neon to-teal-400 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <span className="text-black font-bold text-lg">
                {isPlaying ? '⏸' : '▶'}
              </span>
            </button>
            
            {/* Expanded player controls */}
            {isExpanded && (
              <div className="ml-2 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white text-sm font-bold truncate mr-2">
                    {audioTitle}
                  </div>
                </div>
                
                {/* Progress bar - No time display */}
                <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-chad-pink to-chad-neon" 
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  ></div>
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                
                {/* Volume control - Shorter */}
                <div className="flex items-center">
                  <span className="text-teal-400 text-sm mr-2">🔊</span>
                  <div className="w-20 relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-chad-neon" 
                      style={{ width: `${volume * 100}%` }}
                    ></div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={handleVolumeChange}
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <audio ref={audioRef} src={audioSrc} preload="metadata" />
      
      {/* Hidden search function for accessibility */}
      <div className="sr-only">
        <input 
          type="text" 
          aria-label="Search music" 
          placeholder="Search music"
          onChange={(e) => console.log('Music search:', e.target.value)}
        />
      </div>
    </div>
  );
};

export default MusicPlayer;
