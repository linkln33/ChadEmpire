'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SpinWheelProps {
  isSpinning: boolean;
}

export function SpinWheel({ isSpinning }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [spinDegrees, setSpinDegrees] = useState(0);

  useEffect(() => {
    if (isSpinning) {
      // Generate a random number of rotations (5-10 full rotations) plus a random final position
      const rotations = 5 + Math.floor(Math.random() * 5);
      const finalPosition = Math.floor(Math.random() * 360);
      const totalDegrees = rotations * 360 + finalPosition;
      
      setSpinDegrees(totalDegrees);
      
      // Reset after animation is complete
      const timer = setTimeout(() => {
        setRotation((rotation + totalDegrees) % 360);
        setSpinDegrees(0);
      }, 3000); // Match this with the animation duration in CSS
      
      return () => clearTimeout(timer);
    }
  }, [isSpinning]);

  // Define the wheel segments - in a real app these would be dynamically generated
  // based on the actual probabilities and rewards
  const segments = [
    { color: '#FF6B35', text: '0.5%', type: 'yield' },
    { color: '#4361EE', text: 'Ticket', type: 'lottery' },
    { color: '#FFD166', text: '0.3%', type: 'yield' },
    { color: '#06D6A0', text: 'XP', type: 'chad' },
    { color: '#FF6B35', text: '0.1%', type: 'yield' },
    { color: '#EF476F', text: 'Fragment', type: 'booster' },
    { color: '#4361EE', text: '0.2%', type: 'yield' },
    { color: '#FFD166', text: 'XP', type: 'chad' },
    { color: '#06D6A0', text: '0.4%', type: 'yield' },
    { color: '#EF476F', text: 'Ticket', type: 'lottery' },
    { color: '#FF6B35', text: '2%', type: 'jackpot' },
    { color: '#4361EE', text: 'Fragment', type: 'booster' },
  ];

  const segmentAngle = 360 / segments.length;

  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80">
      {/* Outer ring with glow effect */}
      <div className="absolute inset-0 rounded-full border-4 border-chad-primary glow-effect"></div>
      
      {/* Spin wheel */}
      <div 
        className="spin-wheel absolute inset-0 rounded-full overflow-hidden"
        style={{
          transform: spinDegrees ? `rotate(${spinDegrees}deg)` : `rotate(${rotation}deg)`,
          transition: spinDegrees ? 'transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
        }}
      >
        {segments.map((segment, index) => (
          <div
            key={index}
            className="absolute top-0 left-0 w-full h-full"
            style={{
              clipPath: `polygon(50% 50%, 50% 0, ${50 + 50 * Math.cos((index + 1) * segmentAngle * Math.PI / 180)}% ${50 - 50 * Math.sin((index + 1) * segmentAngle * Math.PI / 180)}%)`,
              transform: `rotate(${index * segmentAngle}deg)`,
              backgroundColor: segment.color,
            }}
          >
            <div 
              className="absolute text-white font-bold text-sm"
              style={{
                left: '50%',
                top: '15%',
                transform: 'translateX(-50%) rotate(180deg)',
                transformOrigin: 'center',
              }}
            >
              {segment.text}
            </div>
          </div>
        ))}
      </div>
      
      {/* Center cap */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-chad-dark border-4 border-chad-primary flex items-center justify-center z-10">
          <span className="text-chad-primary font-bold text-lg">SPIN</span>
        </div>
      </div>
      
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-6 h-8 bg-white" style={{ clipPath: 'polygon(50% 0, 0% 100%, 100% 100%)' }}></div>
      </div>
    </div>
  );
}
