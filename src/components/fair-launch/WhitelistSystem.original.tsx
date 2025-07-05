'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ChadWalletButton } from '../wallet/ChadWalletButton';
import { DeferredRender, memoize } from '../../utils/performance';
import OptimizedImage from '../common/OptimizedImage';

// Tier definitions based on SOL holdings
const TIERS = [
  { id: 1, name: 'Tier 1', minSol: 100, maxAllocation: 50, color: 'from-chad-gold to-amber-500' },
  { id: 2, name: 'Tier 2', minSol: 50, maxAllocation: 30, color: 'from-gray-300 to-gray-400' },
  { id: 3, name: 'Tier 3', minSol: 20, maxAllocation: 20, color: 'from-amber-700 to-amber-800' },
  { id: 4, name: 'Tier 4', minSol: 5, maxAllocation: 10, color: 'from-chad-neon to-cyan-600' },
  { id: 5, name: 'Tier 5', minSol: 0.25, maxAllocation: 5, color: 'from-chad-pink to-purple-600' },
];

// Social tasks for farming points
const SOCIAL_TASKS = [
  { id: 'twitter_follow', name: 'Follow on Twitter', points: 1, completed: false },
  { id: 'twitter_like', name: 'Like & Share pinned post', points: 2, completed: false },
  { id: 'telegram_join', name: 'Join Telegram', points: 1, completed: false },
  { id: 'wallet_connect', name: 'Connect Wallet', points: 1, completed: false },
  { id: 'refer_friends', name: 'Refer 3+ friends', points: 3, completed: false },
];

interface WhitelistSystemProps {
  onWhitelistStatusChange?: (status: { isWhitelisted: boolean; tier: number; maxAllocation: number }) => void;
}

const WhitelistSystem: React.FC<WhitelistSystemProps> = ({ onWhitelistStatusChange }) => {
  const { connected, publicKey } = useWallet();
  const [solBalance, setSolBalance] = useState<number>(0);
  const [userTier, setUserTier] = useState<number | null>(null);
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);
  const [socialTasks, setSocialTasks] = useState(SOCIAL_TASKS);
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralCount, setReferralCount] = useState<number>(0);
  const [referralSol, setReferralSol] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mock function to simulate fetching user's SOL balance
  const fetchSolBalance = async (address: string): Promise<number> => {
    // Special case for our whitelisted user
    if (address === 'HUHv2JKDXvKzr2GMepCUcw6E9B6Hg4LGcMLT4SEY6dCs') {
      return 150; // Assign 150 SOL to ensure Tier 1 status
    }
    
    // In production, this would call the Solana RPC to get actual balance
    // For demo, return a random balance between 0.1 and 150 SOL
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockBalance = Math.random() * 150;
        resolve(parseFloat(mockBalance.toFixed(2)));
      }, 500);
    });
  };

  // Check if user is whitelisted
  const checkWhitelistStatus = async (address: string): Promise<boolean> => {
    // Special case for our whitelisted user
    if (address === 'HUHv2JKDXvKzr2GMepCUcw6E9B6Hg4LGcMLT4SEY6dCs') {
      return true; // Always whitelist this specific address
    }
    
    // In production, this would check against a Merkle tree or database
    // For demo, simulate a check with 70% chance of being whitelisted
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.3);
      }, 500);
    });
  };

  // Determine user tier based on SOL balance
  const determineUserTier = (balance: number): number | null => {
    for (const tier of TIERS) {
      if (balance >= tier.minSol) {
        return tier.id;
      }
    }
    return null;
  };

  // Calculate social points
  const calculateSocialPoints = (): number => {
    return socialTasks.reduce((total, task) => {
      return total + (task.completed ? task.points : 0);
    }, 0);
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setSocialTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Generate referral code
  const generateReferralCode = (address: string): string => {
    // Special case for our whitelisted user
    if (address === 'HUHv2JKDXvKzr2GMepCUcw6E9B6Hg4LGcMLT4SEY6dCs') {
      return 'CHADKING';
    }
    
    // In production, this would generate a unique code based on the wallet address
    // For demo, take first 4 and last 4 characters of the address
    if (!address) return '';
    const start = address.substring(0, 4);
    const end = address.substring(address.length - 4);
    return `${start}${end}`.toUpperCase();
  };

  // Update user data when wallet is connected
  useEffect(() => {
    if (!connected || !publicKey) return;
    
    const abortController = new AbortController();
    const signal = abortController.signal;
    
    const updateUserData = async () => {
      try {
        setIsLoading(true);
        
        const walletAddress = publicKey.toString();
        
        // Special case for our whitelisted user
        if (walletAddress === 'HUHv2JKDXvKzr2GMepCUcw6E9B6Hg4LGcMLT4SEY6dCs') {
          // Auto-complete social tasks for our user
          setSocialTasks(prevTasks => 
            prevTasks.map(task => ({ ...task, completed: true }))
          );
          
          // Set mock referral data for our user
          setReferralCount(15);
          setReferralSol(75);
          
          // Set tier 1 status
          setSolBalance(150);
          setUserTier(1);
          setIsWhitelisted(true);
          setReferralCode('CHADKING');
          
          // Notify parent component
          if (onWhitelistStatusChange) {
            onWhitelistStatusChange({
              isWhitelisted: true,
              tier: 1,
              maxAllocation: 50
            });
          }
          
          setIsLoading(false);
          return;
        }
        
        // For other users, fetch data normally
        const balance = await fetchSolBalance(walletAddress);
        if (signal.aborted) return;
        
        setSolBalance(balance);
        
        const whitelistStatus = await checkWhitelistStatus(walletAddress);
        if (signal.aborted) return;
        
        setIsWhitelisted(whitelistStatus);
        
        const tier = determineUserTier(balance);
        setUserTier(tier);
        
        // Generate referral code
        const code = generateReferralCode(walletAddress);
        setReferralCode(code);
        
        // Mock referral data
        setReferralCount(Math.floor(Math.random() * 20));
        setReferralSol(parseFloat((Math.random() * 100).toFixed(2)));
        
        // Notify parent component
        if (onWhitelistStatusChange && tier) {
          const tierData = TIERS.find(t => t.id === tier);
          onWhitelistStatusChange({
            isWhitelisted: whitelistStatus,
            tier: tier,
            maxAllocation: tierData?.maxAllocation || 0
          });
        }
      } catch (error) {
        console.error('Error updating user data:', error);
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    
    updateUserData();
    
    // Cleanup function to abort any pending operations when component unmounts
    return () => {
      abortController.abort();
    };
  }, [connected, publicKey, onWhitelistStatusChange]);

  // Get referral tier boost based on referral count
  const getReferralTierBoost = (): number => {
    return referralCount >= 10 ? 1 : 0;
  };

  // Get user's effective tier (base tier + boosts)
  const getEffectiveTier = (): number => {
    if (!userTier) return 0;
    
    // Calculate tier boosts
    const socialBoost = calculateSocialPoints() >= 5 ? 1 : 0;
    const referralBoost = getReferralTierBoost();
    
    // Apply boosts (lower tier number is better)
    const boostedTier = Math.max(1, userTier - socialBoost - referralBoost);
    
    return boostedTier;
  };

  // Get max allocation based on effective tier
  const getMaxAllocation = (): number => {
    const effectiveTier = getEffectiveTier();
    const tierData = TIERS.find(t => t.id === effectiveTier);
    return tierData?.maxAllocation || 0;
  };

  // Check if user is a super affiliate
  const isSuperAffiliate = (): boolean => {
    return referralSol >= 50;
  };

  // Memoize the tier information to prevent unnecessary re-renders
  const tierInfo = useMemo(() => {
    if (!userTier) return null;
    return TIERS.find(t => t.id === userTier);
  }, [userTier]);

  return (
    <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 border border-chad-border">
      <h2 className="text-2xl font-bold text-white mb-4">Whitelist System</h2>
      
      {!connected ? (
        <div className="text-center py-8">
          <p className="text-gray-300 mb-4">Connect your wallet to check whitelist status</p>
          <ChadWalletButton />
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-chad-neon"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Whitelist Status */}
          <div className="bg-black/50 rounded-lg p-4 border border-chad-border">
            <h3 className="text-xl font-semibold text-white mb-2">Your Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-400 mb-1">SOL Balance</p>
              <p className="text-2xl font-bold text-chad-gold">{solBalance} SOL</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Whitelist Tier</p>
              {userTier ? (
                <div className="flex items-center">
                  <div className={`h-6 w-6 rounded-full bg-gradient-to-r ${TIERS.find(t => t.id === getEffectiveTier())?.color} mr-2 flex items-center justify-center text-xs font-bold text-black`}>
                    {getEffectiveTier()}
                  </div>
                  <span className="text-2xl font-bold text-white">
                    Tier {getEffectiveTier()}
                    {getEffectiveTier() < userTier && (
                      <span className="text-sm text-chad-neon ml-2">
                        (Boosted from Tier {userTier})
                      </span>
                    )}
                  </span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-red-500">Not Eligible</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 mb-1">Max Allocation</p>
              <p className="text-2xl font-bold text-chad-neon">{getMaxAllocation()} SOL</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Status</p>
              {isWhitelisted ? (
                <p className="text-2xl font-bold text-green-500">Whitelisted ✓</p>
              ) : (
                <p className="text-2xl font-bold text-red-500">Not Whitelisted</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Social Farming */}
        <DeferredRender>
          <div className="bg-black/30 p-6 rounded-lg border border-gray-800">
            <h4 className="text-lg font-bold text-white mb-4">Social Farming</h4>
            <p className="text-gray-300 mb-4">Complete tasks to earn points and boost your tier</p>
            
            <div className="space-y-3">
              {socialTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={task.id}
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                      className="mr-2 h-4 w-4 rounded border-gray-600 text-chad-neon focus:ring-chad-neon"
                    />
                    <label htmlFor={task.id} className="text-gray-300">{task.name}</label>
                  </div>
                  <span className="text-chad-neon font-semibold">+{task.points} pts</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
              <div>
                <p className="text-gray-300">Total Points: <span className="text-chad-neon font-semibold">{calculateSocialPoints()}</span></p>
                {calculateSocialPoints() >= 5 && (
                  <p className="text-sm text-chad-gold mt-1">+1 Tier Boost Applied!</p>
                )}
              </div>
              {calculateSocialPoints() >= 5 ? (
                <div className="bg-gradient-to-r from-chad-gold to-yellow-500 text-black font-bold px-3 py-1 rounded-full text-xs">
                  +1 Tier Boost
                </div>
              ) : (
                <p className="text-sm text-gray-400">5 points needed for tier boost</p>
              )}
            </div>
          </div>
        </DeferredRender>
        
        {/* Referral System */}
        <DeferredRender>
          <div className="bg-black/30 p-6 rounded-lg border border-gray-800">
            <h4 className="text-lg font-bold text-white mb-4">Referral System</h4>
            
            <div className="mb-6">
              <p className="text-gray-400 mb-2">Your Referral Code</p>
              <div className="bg-black/50 p-3 rounded-lg border border-gray-700 font-mono text-lg text-chad-gold flex justify-between items-center">
                <span>{referralCode}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(referralCode)}
                  className="text-sm bg-black/30 hover:bg-black/50 text-gray-300 px-2 py-1 rounded transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-gray-400 mb-2">Referrals</p>
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-white">{referralCount}</span>
                  <span className="text-gray-400 ml-2 mb-1">users</span>
                </div>
                {referralCount >= 10 && (
                  <p className="text-sm text-chad-gold mt-1">+1 Tier Boost Applied!</p>
                )}
              </div>
              <div>
                <p className="text-gray-400 mb-2">SOL Volume</p>
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-white">{referralSol}</span>
                  <span className="text-gray-400 ml-2 mb-1">SOL</span>
                </div>
                {isSuperAffiliate() && (
                  <p className="text-sm text-chad-gold mt-1">Super Affiliate Status!</p>
                )}
              </div>
            </div>
            
            <div className="bg-black/50 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-300 mb-2">Refer friends to earn rewards:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-1">
                <li>10+ referrals: <span className="text-chad-gold">+1 Tier Boost</span></li>
                <li>50+ SOL volume: <span className="text-chad-gold">Super Affiliate Status</span></li>
                <li>Earn 5% of referred SOL contributions</li>
              </ul>
            </div>
          </div>
        </DeferredRender>
        
        {/* Tier Requirements */}
        <DeferredRender>
          <div className="bg-black/30 p-6 rounded-lg border border-gray-800">
            <h4 className="text-lg font-bold text-white mb-4">Whitelist Tiers</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-gray-400">Tier</th>
                    <th className="text-left py-2 text-gray-400">Min. SOL</th>
                    <th className="text-left py-2 text-gray-400">Max Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  {TIERS.map(tier => (
                    <tr key={tier.id} className="border-b border-gray-800">
                      <td className="py-3">
                        <div className="flex items-center">
                          <div className={`h-4 w-4 rounded-full bg-gradient-to-r ${tier.color} mr-2`}></div>
                          <span className={`font-semibold ${userTier === tier.id ? 'text-white' : 'text-gray-400'}`}>
                            {tier.name}
                          </span>
                        </div>
                      </td>
                      <td className={`py-3 ${userTier === tier.id ? 'text-white' : 'text-gray-400'}`}>
                        {tier.minSol}+ SOL
                      </td>
                      <td className={`py-3 ${userTier === tier.id ? 'text-chad-neon font-semibold' : 'text-gray-400'}`}>
                        {tier.maxAllocation} SOL
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DeferredRender>
        </div>
      )}
    </div>
  );
};

export default WhitelistSystem;
