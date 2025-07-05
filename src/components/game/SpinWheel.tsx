import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import { useSolana } from '@/lib/solana';

interface SpinWheelProps {
  onSpinComplete?: (result: any) => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ onSpinComplete }) => {
  const { connected } = useWallet();
  const { executeSpin } = useSolana();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedBooster, setSelectedBooster] = useState<string | null>(null);
  
  // Game store state
  const { 
    isSpinning, 
    lastSpinResult, 
    startSpin, 
    completeSpin,
    spinResult
  } = useGameStore();
  
  // User store state
  const { 
    stakes, 
    spins, 
    boosters, 
    addSpin, 
    canSpinDaily,
    hasBonusSpin
  } = useUserStore();
  
  // Wheel segments configuration
  const segments = [
    { text: '0.1% Yield', color: '#4CAF50', type: 'yield', value: 0.1 },
    { text: 'Lottery Ticket', color: '#2196F3', type: 'lottery_ticket', value: 1 },
    { text: '0.2% Yield', color: '#4CAF50', type: 'yield', value: 0.2 },
    { text: 'Chad Score', color: '#FF9800', type: 'chad_score', value: 25 },
    { text: '0.3% Yield', color: '#4CAF50', type: 'yield', value: 0.3 },
    { text: 'Booster Fragment', color: '#9C27B0', type: 'booster_fragment', value: 1 },
    { text: '0.5% Yield', color: '#4CAF50', type: 'yield', value: 0.5 },
    { text: 'Bonus Spin', color: '#F44336', type: 'bonus_spin', value: 1 },
    { text: '1% Yield', color: '#4CAF50', type: 'yield', value: 1.0 },
    { text: 'Lottery Ticket', color: '#2196F3', type: 'lottery_ticket', value: 1 },
    { text: '2% Yield', color: '#4CAF50', type: 'yield', value: 2.0 },
    { text: 'Chad Score', color: '#FF9800', type: 'chad_score', value: 50 },
  ];
  
  // Draw the wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw wheel segments
    const segmentAngle = (2 * Math.PI) / segments.length;
    segments.forEach((segment, i) => {
      const startAngle = i * segmentAngle + rotation;
      const endAngle = (i + 1) * segmentAngle + rotation;
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(segment.text, radius - 20, 5);
      ctx.restore();
    });
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
    
    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 10);
    ctx.lineTo(centerX - 15, centerY - radius + 10);
    ctx.lineTo(centerX + 15, centerY - radius + 10);
    ctx.closePath();
    ctx.fillStyle = '#e91e63';
    ctx.fill();
    
  }, [rotation, segments]);
  
  // Animate the wheel spin
  const animateSpin = (targetRotation: number, duration: number = 5000) => {
    setIsAnimating(true);
    
    const startRotation = rotation;
    const startTime = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      
      if (elapsed < duration) {
        // Easing function for smooth deceleration
        const progress = elapsed / duration;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentRotation = startRotation + (targetRotation - startRotation) * easeOut;
        setRotation(currentRotation);
        
        requestAnimationFrame(animate);
      } else {
        setRotation(targetRotation);
        setIsAnimating(false);
        
        // Determine the winning segment
        const normalizedRotation = targetRotation % (2 * Math.PI);
        const segmentAngle = (2 * Math.PI) / segments.length;
        const winningIndex = Math.floor(segments.length - (normalizedRotation / segmentAngle) % segments.length);
        const winningSegment = segments[winningIndex % segments.length];
        
        // Complete the spin in the game store
        completeSpin({
          type: winningSegment.type,
          value: winningSegment.value,
          message: `You won ${winningSegment.text}!`
        });
        
        if (onSpinComplete) {
          onSpinComplete(winningSegment);
        }
      }
    };
    
    requestAnimationFrame(animate);
  };
  
  // Handle spin button click
  const handleSpin = async () => {
    if (isAnimating || isSpinning || !connected) return;
    
    try {
      // Check if user can spin
      if (!canSpinDaily && !hasBonusSpin) {
        alert('You have used your daily spin. Come back tomorrow or use a Bonus Spin token!');
        return;
      }
      
      // Check if user has stakes
      if (!stakes.length) {
        alert('You need to stake $CHAD tokens before spinning!');
        return;
      }
      
      // Start the spin in the game store
      startSpin(selectedBooster || undefined);
      
      // In a real implementation, this would call the blockchain
      // For now, we'll just simulate it
      const spinType = hasBonusSpin && !canSpinDaily ? 'bonus' : 'daily';
      
      try {
        // Execute the spin transaction
        const txHash = await executeSpin(spinType, selectedBooster || undefined);
        
        // Calculate a random target rotation (multiple full rotations + random segment)
        const fullRotations = 5 + Math.random() * 3; // 5-8 full rotations
        const targetRotation = rotation + fullRotations * 2 * Math.PI;
        
        // Animate the wheel
        animateSpin(targetRotation);
        
        // Reset selected booster
        setSelectedBooster(null);
      } catch (error) {
        console.error('Error executing spin:', error);
        completeSpin(null);
        alert('Failed to execute spin. Please try again.');
      }
    } catch (error) {
      console.error('Error handling spin:', error);
      alert('An error occurred. Please try again.');
    }
  };
  
  // Handle booster selection
  const handleBoosterSelect = (boosterId: string | null) => {
    setSelectedBooster(boosterId);
  };
  
  // Get available boosters that can be used for spinning
  const availableBoosters = boosters.filter(booster => 
    !booster.usedAt && 
    (booster.boosterType === 'yield_multiplier' || 
     booster.boosterType === 'luck_boost' || 
     booster.boosterType === 'jackpot_access')
  );
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-80 h-80 mb-6">
        <canvas 
          ref={canvasRef} 
          width={320} 
          height={320} 
          className="w-full h-full"
        />
      </div>
      
      {lastSpinResult && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg text-center">
          <h3 className="text-xl font-bold mb-2">Last Spin Result</h3>
          <p className="text-lg">{lastSpinResult.message}</p>
        </div>
      )}
      
      <div className="flex flex-col items-center gap-4">
        {availableBoosters.length > 0 && (
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-2">Use a Booster</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {availableBoosters.map(booster => (
                <button
                  key={booster.id}
                  onClick={() => handleBoosterSelect(selectedBooster === booster.id ? null : booster.id)}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedBooster === booster.id 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  {booster.boosterType === 'yield_multiplier' && `${booster.powerLevel}x Yield`}
                  {booster.boosterType === 'luck_boost' && `Luck +${booster.powerLevel * 10}%`}
                  {booster.boosterType === 'jackpot_access' && `Jackpot Boost`}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <button
          onClick={handleSpin}
          disabled={isAnimating || isSpinning || !connected || (!canSpinDaily && !hasBonusSpin)}
          className={`px-6 py-3 rounded-lg text-xl font-bold ${
            isAnimating || isSpinning || !connected || (!canSpinDaily && !hasBonusSpin)
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
          }`}
        >
          {isAnimating || isSpinning 
            ? 'Spinning...' 
            : !connected 
              ? 'Connect Wallet' 
              : !canSpinDaily && !hasBonusSpin
                ? 'No Spins Available'
                : hasBonusSpin && !canSpinDaily
                  ? 'Use Bonus Spin'
                  : 'Spin to Win!'}
        </button>
        
        {!canSpinDaily && !hasBonusSpin && (
          <p className="text-sm text-gray-400">
            You've used your daily spin. Come back tomorrow or earn a bonus spin!
          </p>
        )}
      </div>
    </div>
  );
};

export default SpinWheel;
