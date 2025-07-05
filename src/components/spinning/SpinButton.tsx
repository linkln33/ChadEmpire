'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface SpinButtonProps {
  onSpin: () => void;
  disabled?: boolean;
}

export function SpinButton({ onSpin, disabled = false }: SpinButtonProps) {
  const { publicKey } = useWallet();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleSpin = () => {
    if (!disabled && publicKey) {
      onSpin();
    }
  };

  return (
    <button
      onClick={handleSpin}
      disabled={disabled || !publicKey}
      className={`spin-button ${disabled ? 'opacity-50 cursor-not-allowed' : 'animate-pulse'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative z-10 flex items-center">
        {disabled ? 'Already Spun Today' : 'Spin to Win!'}
        {!disabled && (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ml-2 transition-transform duration-300 ${isHovered ? 'rotate-180' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </span>
      
      {/* Cost indicator */}
      {!disabled && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-300">
          Cost: 5 $CHAD
        </div>
      )}
    </button>
  );
}
