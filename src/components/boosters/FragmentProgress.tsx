'use client';

import { useState } from 'react';
import { useUserStore, BoosterFragment } from '@/stores/userStore';

interface FragmentProgressProps {
  fragment: BoosterFragment;
}

export function FragmentProgress({ fragment }: FragmentProgressProps) {
  const { addBooster, updateFragmentQuantity } = useUserStore();
  const [isMinting, setIsMinting] = useState(false);
  
  
  const handleMintBooster = async () => {
    if (fragment.quantity < 5 || isMinting) return;
    
    setIsMinting(true);
    
    try {
      // In a real app, this would call your Solana program
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a random booster based on fragment type
      const boosterTypes = ['yield_multiplier', 'luck_boost', 'bonus_spin', 'jackpot_access'];
      const randomType = fragment.fragmentType.includes('yield') 
        ? 'yield_multiplier' 
        : fragment.fragmentType.includes('luck') 
          ? 'luck_boost' 
          : fragment.fragmentType.includes('spin') 
            ? 'bonus_spin' 
            : fragment.fragmentType.includes('jackpot') 
              ? 'jackpot_access' 
              : boosterTypes[Math.floor(Math.random() * boosterTypes.length)];
      
      // Determine power level based on rarity (more common fragments = lower power)
      const powerLevel = Math.min(Math.max(1, Math.ceil(Math.random() * 3)), 3);
      
      // Create new booster
      const newBooster = {
        id: `booster-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        mintAddress: `${Math.random().toString(36).substring(2, 15)}`,
        boosterType: randomType as 'yield_multiplier' | 'luck_boost' | 'bonus_spin' | 'jackpot_access',
        powerLevel,
        usedAt: undefined
      };
      
      // Update state
      addBooster(newBooster);
      updateFragmentQuantity(fragment.id, fragment.quantity - 5);
      
      // Show success notification
      alert(`Booster minted successfully! Check your boosters collection.`);
    } catch (error) {
      console.error('Error minting booster:', error);
    } finally {
      setIsMinting(false);
    }
  };
  
  const getFragmentName = (type: string): string => {
    if (type.includes('yield')) return 'Yield Multiplier Fragment';
    if (type.includes('luck')) return 'Lucky Charm Fragment';
    if (type.includes('spin')) return 'Bonus Spin Fragment';
    if (type.includes('jackpot')) return 'Jackpot Enhancer Fragment';
    return 'Mystery Fragment';
  };
  
  const getFragmentColor = (type: string): string => {
    if (type.includes('yield')) return 'from-blue-500/20 to-blue-700/20';
    if (type.includes('luck')) return 'from-green-500/20 to-green-700/20';
    if (type.includes('spin')) return 'from-purple-500/20 to-purple-700/20';
    if (type.includes('jackpot')) return 'from-yellow-500/20 to-yellow-700/20';
    return 'from-gray-500/20 to-gray-700/20';
  };
  
  const getFragmentTextColor = (type: string): string => {
    if (type.includes('yield')) return 'text-blue-400';
    if (type.includes('luck')) return 'text-green-400';
    if (type.includes('spin')) return 'text-purple-400';
    if (type.includes('jackpot')) return 'text-yellow-400';
    return 'text-gray-400';
  };
  
  const getFragmentIcon = (type: string): string => {
    if (type.includes('yield')) return '×';
    if (type.includes('luck')) return '🍀';
    if (type.includes('spin')) return '🎡';
    if (type.includes('jackpot')) return '🎯';
    return '?';
  };

  return (
    <div className={`chad-card overflow-hidden bg-gradient-to-br ${getFragmentColor(fragment.fragmentType)}`}>
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className={`w-10 h-10 rounded-full bg-black/30 flex items-center justify-center mr-3 ${getFragmentTextColor(fragment.fragmentType)}`}>
            <span className="text-xl">{getFragmentIcon(fragment.fragmentType)}</span>
          </div>
          <div>
            <h3 className="font-bold">{getFragmentName(fragment.fragmentType)}</h3>
            <p className="text-sm text-gray-400">Collect 5 to mint a booster</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{fragment.quantity}/5</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getFragmentTextColor(fragment.fragmentType).replace('text', 'bg')}`}
              style={{ width: `${Math.min(fragment.quantity / 5 * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm">
            {fragment.quantity >= 5 ? (
              <span className={getFragmentTextColor(fragment.fragmentType)}>Ready to mint!</span>
            ) : (
              <span>Need {5 - fragment.quantity} more</span>
            )}
          </div>
          
          <button 
            onClick={handleMintBooster}
            disabled={fragment.quantity < 5 || isMinting}
            className={`${
              fragment.quantity < 5 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-chad-primary hover:bg-chad-primary/90'
            } text-white font-bold py-2 px-4 rounded-lg transition-colors`}
          >
            {isMinting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Minting...
              </span>
            ) : (
              'Mint Booster'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
