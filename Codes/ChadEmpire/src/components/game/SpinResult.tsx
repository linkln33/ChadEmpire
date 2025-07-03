import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import { motion, AnimatePresence } from 'framer-motion';

interface SpinResultProps {
  onClose?: () => void;
}

const SpinResult: React.FC<SpinResultProps> = ({ onClose }) => {
  const [visible, setVisible] = useState(false);
  const { lastSpinResult, resetSpinResult } = useGameStore();
  const { addYield, addLotteryTicket, addChadScore, addFragment, addBonusSpin } = useUserStore();
  
  useEffect(() => {
    if (lastSpinResult) {
      setVisible(true);
      
      // Process the spin result and update user state
      if (lastSpinResult.type === 'yield' && lastSpinResult.value) {
        addYield(Number(lastSpinResult.value));
      } else if (lastSpinResult.type === 'lottery_ticket') {
        addLotteryTicket(lastSpinResult.value || 1);
      } else if (lastSpinResult.type === 'chad_score') {
        addChadScore(lastSpinResult.value || 10);
      } else if (lastSpinResult.type === 'booster_fragment') {
        // Randomly select a fragment type
        const fragmentTypes = ['yield_multiplier', 'luck_boost', 'bonus_spin', 'jackpot_access'];
        const randomType = fragmentTypes[Math.floor(Math.random() * fragmentTypes.length)];
        addFragment(randomType, lastSpinResult.value || 1);
      } else if (lastSpinResult.type === 'bonus_spin') {
        addBonusSpin(lastSpinResult.value || 1);
      }
    }
  }, [lastSpinResult, addYield, addLotteryTicket, addChadScore, addFragment, addBonusSpin]);
  
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      resetSpinResult();
      if (onClose) onClose();
    }, 300);
  };
  
  if (!lastSpinResult) return null;
  
  // Determine the result type and styling
  const getResultContent = () => {
    switch (lastSpinResult.type) {
      case 'yield':
        return {
          icon: '💰',
          title: 'Yield Earned!',
          description: `You earned ${lastSpinResult.value}% yield on your staked $CHAD!`,
          color: 'from-green-500 to-green-700'
        };
      case 'lottery_ticket':
        return {
          icon: '🎟️',
          title: 'Lottery Ticket!',
          description: 'You received a ticket for the next lottery draw!',
          color: 'from-blue-500 to-blue-700'
        };
      case 'chad_score':
        return {
          icon: '🏆',
          title: 'Chad Score Boost!',
          description: `Your Chad Score increased by ${lastSpinResult.value} points!`,
          color: 'from-orange-500 to-orange-700'
        };
      case 'booster_fragment':
        return {
          icon: '🧩',
          title: 'Booster Fragment!',
          description: 'You collected a fragment! Collect 5 to mint a Booster NFT.',
          color: 'from-purple-500 to-purple-700'
        };
      case 'bonus_spin':
        return {
          icon: '🎡',
          title: 'Bonus Spin!',
          description: 'You earned an extra spin token! Use it anytime.',
          color: 'from-red-500 to-red-700'
        };
      default:
        return {
          icon: '❓',
          title: 'Unknown Result',
          description: lastSpinResult.message || 'Something happened!',
          color: 'from-gray-500 to-gray-700'
        };
    }
  };
  
  const resultContent = getResultContent();
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 p-4"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className={`bg-gradient-to-br ${resultContent.color} rounded-xl shadow-2xl p-8 max-w-md w-full text-white text-center`}
          >
            <div className="text-6xl mb-4">{resultContent.icon}</div>
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-4"
            >
              {resultContent.title}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl mb-6"
            >
              {resultContent.description}
            </motion.p>
            
            {lastSpinResult.type === 'yield' && lastSpinResult.value && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white bg-opacity-20 rounded-lg p-4 mb-6"
              >
                <p className="text-2xl font-bold">
                  +{(Number(lastSpinResult.value) * 0.01 * 1000).toFixed(2)} $CHAD
                </p>
                <p className="text-sm opacity-80">Based on your current stake</p>
              </motion.div>
            )}
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={handleClose}
              className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Awesome!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpinResult;
