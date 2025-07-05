'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface UnstakeFormProps {
  currentStake: number;
  penaltyPercentage: number;
  onClose: () => void;
}

export function UnstakeForm({ currentStake, penaltyPercentage, onClose }: UnstakeFormProps) {
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const penaltyAmount = Number(amount) * (penaltyPercentage / 100);
  const receiveAmount = Number(amount) - penaltyAmount;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey || !amount || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Simulate unstaking transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would call your Solana program here
      console.log(`Unstaking ${amount} $CHAD tokens with ${penaltyPercentage}% penalty`);
      
      // Close the form after successful unstake
      onClose();
    } catch (error) {
      console.error('Unstaking error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-4 bg-chad-dark/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Unstake $CHAD Tokens</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Amount to Unstake</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full bg-chad-dark border border-chad-primary/30 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-chad-primary/50"
              min="1"
              max={currentStake}
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-400">$CHAD</span>
            </div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>Staked: {currentStake} $CHAD</span>
            <button 
              type="button" 
              onClick={() => setAmount(currentStake.toString())}
              className="text-chad-primary hover:text-chad-primary/80"
            >
              Max
            </button>
          </div>
        </div>
        
        <div className="bg-black/30 rounded-lg p-3 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Unstake Amount</span>
            <span>{Number(amount) || 0} $CHAD</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Penalty ({penaltyPercentage}%)</span>
            <span className="text-chad-error">{penaltyAmount.toFixed(2)} $CHAD</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>You Receive</span>
            <span className="text-chad-accent">{receiveAmount.toFixed(2)} $CHAD</span>
          </div>
        </div>
        
        {penaltyPercentage > 0 && (
          <div className="bg-chad-error/10 border border-chad-error/30 rounded-lg p-3 mb-4 text-sm">
            <p className="text-chad-error">
              Warning: Unstaking now will incur a {penaltyPercentage}% penalty. Wait {penaltyPercentage === 50 ? '24+ hours' : penaltyPercentage === 25 ? '48+ hours' : '96+ hours'} to avoid penalties.
            </p>
          </div>
        )}
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-transparent hover:bg-chad-dark/70 text-white font-semibold py-2 rounded-lg border border-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!amount || isLoading || Number(amount) <= 0 || Number(amount) > currentStake}
            className={`flex-1 bg-chad-primary hover:bg-chad-primary/90 text-white font-semibold py-2 rounded-lg transition-colors ${
              (!amount || isLoading || Number(amount) <= 0 || Number(amount) > currentStake) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Unstaking...
              </span>
            ) : (
              'Unstake'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
