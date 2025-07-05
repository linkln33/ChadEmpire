'use client';

import { useState } from 'react';
import { useUserStore, BoosterNft } from '@/stores/userStore';

interface BoosterCardProps {
  booster: BoosterNft;
  isOwned: boolean;
}

export function BoosterCard({ booster, isOwned }: BoosterCardProps) {
  const { useBooster } = useUserStore();
  const [isActivating, setIsActivating] = useState(false);
  
  const handleUseBooster = async () => {
    if (booster.usedAt || isActivating) return;
    
    setIsActivating(true);
    
    try {
      // In a real app, this would call your Solana program
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      useBooster(booster.id);
      
      // Show success notification
      alert(`${getBoosterName(booster.boosterType)} activated successfully!`);
    } catch (error) {
      console.error('Error using booster:', error);
    } finally {
      setIsActivating(false);
    }
  };
  
  const getBoosterName = (type: string): string => {
    switch (type) {
      case 'yield_multiplier':
        return 'Yield Multiplier';
      case 'luck_boost':
        return 'Lucky Charm';
      case 'bonus_spin':
        return 'Bonus Spin Token';
      case 'jackpot_access':
        return 'Jackpot Enhancer';
      default:
        return 'Unknown Booster';
    }
  };
  
  const getBoosterDescription = (type: string, powerLevel: number): string => {
    switch (type) {
      case 'yield_multiplier':
        return `Increases yield rewards by ${powerLevel === 1 ? '1.25x' : powerLevel === 2 ? '1.5x' : '2x'} for your next ${powerLevel * 2} spins`;
      case 'luck_boost':
        return `Increases your chance of winning yield by ${powerLevel * 10}% for ${powerLevel * 12} hours`;
      case 'bonus_spin':
        return `Grants ${powerLevel} extra free spin${powerLevel > 1 ? 's' : ''} without consuming your daily spin`;
      case 'jackpot_access':
        return `${powerLevel === 1 ? 'Doubles' : powerLevel === 2 ? 'Triples' : 'Quadruples'} your chance of hitting the jackpot on your next ${powerLevel * 2} spins`;
      default:
        return 'Unknown booster effect';
    }
  };
  
  const getRarityClass = (powerLevel: number): string => {
    switch (powerLevel) {
      case 1:
        return 'bg-green-400/20 text-green-400'; // Uncommon
      case 2:
        return 'bg-blue-400/20 text-blue-400'; // Rare
      case 3:
        return 'bg-purple-400/20 text-purple-400'; // Epic
      case 4:
        return 'bg-yellow-400/20 text-yellow-400'; // Legendary
      default:
        return 'bg-gray-400/20 text-gray-400'; // Common
    }
  };
  
  const getRarityText = (powerLevel: number): string => {
    switch (powerLevel) {
      case 1:
        return 'Uncommon';
      case 2:
        return 'Rare';
      case 3:
        return 'Epic';
      case 4:
        return 'Legendary';
      default:
        return 'Common';
    }
  };
  
  const getBoosterIcon = (type: string): string => {
    switch (type) {
      case 'yield_multiplier':
        return '×';
      case 'luck_boost':
        return '🍀';
      case 'bonus_spin':
        return '🎡';
      case 'jackpot_access':
        return '🎯';
      default:
        return '?';
    }
  };

  return (
    <div className="chad-card overflow-hidden">
      <div className="h-40 bg-gradient-to-br from-chad-primary/20 to-chad-accent/20 flex items-center justify-center">
        <div className={`text-4xl ${getRarityClass(booster.powerLevel)}`}>
          {getBoosterIcon(booster.boosterType)}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg">{getBoosterName(booster.boosterType)}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${getRarityClass(booster.powerLevel)}`}>
            {getRarityText(booster.powerLevel)}
          </span>
        </div>
        
        <p className="text-gray-300 mb-4">{getBoosterDescription(booster.boosterType, booster.powerLevel)}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">
            {booster.usedAt ? (
              `Used on ${new Date(booster.usedAt).toLocaleDateString()}`
            ) : (
              'Ready to use'
            )}
          </span>
          
          {isOwned && (
            <button 
              onClick={handleUseBooster}
              disabled={!!booster.usedAt || isActivating}
              className={`${
                booster.usedAt 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-chad-primary hover:bg-chad-primary/90'
              } text-white font-bold py-2 px-4 rounded-lg transition-colors`}
            >
              {isActivating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Activating...
                </span>
              ) : booster.usedAt ? (
                'Used'
              ) : (
                'Activate'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
