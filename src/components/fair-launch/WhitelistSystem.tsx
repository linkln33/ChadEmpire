'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ChadWalletButton } from '../wallet/ChadWalletButton';
import SectionTitle from '../common/SectionTitle';
import { DeferredRender } from '../../utils/performance';

// Tier definitions based on SOL holdings
const TIERS = [
  { id: 0, name: 'Super Chad', minSol: 100, maxAllocation: 100, color: 'from-purple-500 to-pink-500', icon: '👑', description: 'Super Affiliate status with 50+ SOL in referrals' },
  { id: 1, name: 'Tier 1', minSol: 100, maxAllocation: 50, color: 'from-chad-gold to-amber-500', icon: '⭐⭐⭐⭐⭐', description: '100+ SOL or 10+ referrals' },
  { id: 2, name: 'Tier 2', minSol: 50, maxAllocation: 30, color: 'from-gray-300 to-gray-400', icon: '⭐⭐⭐⭐', description: '50+ SOL or complete all social tasks' },
  { id: 3, name: 'Tier 3', minSol: 20, maxAllocation: 20, color: 'from-amber-700 to-amber-800', icon: '⭐⭐⭐', description: '20+ SOL in wallet' },
  { id: 4, name: 'Tier 4', minSol: 5, maxAllocation: 10, color: 'from-chad-neon to-cyan-600', icon: '⭐⭐', description: '5+ SOL in wallet' },
  { id: 5, name: 'Tier 5', minSol: 0.25, maxAllocation: 5, color: 'from-chad-pink to-purple-600', icon: '⭐', description: 'Minimum 0.25 SOL required' },
];

// Social tasks for farming points
const SOCIAL_TASKS = [
  { id: 'twitter_follow', name: 'Follow on Twitter', points: 1, completed: false, icon: '🐦', color: 'from-blue-400 to-blue-600' },
  { id: 'twitter_like', name: 'Like & Share pinned post', points: 2, completed: false, icon: '❤️', color: 'from-red-400 to-red-600' },
  { id: 'telegram_join', name: 'Join Telegram', points: 1, completed: false, icon: '✈️', color: 'from-blue-500 to-cyan-400' },
  { id: 'wallet_connect', name: 'Connect Wallet', points: 1, completed: false, icon: '👛', color: 'from-purple-500 to-purple-700' },
  { id: 'refer_friends', name: 'Refer 3+ friends', points: 3, completed: false, icon: '👥', color: 'from-green-400 to-green-600' },
];

// Define task interface for type safety
interface SocialTask {
  id: string;
  name: string;
  points: number;
  completed: boolean;
  icon: string;
  color: string;
}

interface WhitelistSystemProps {
  onWhitelistStatusChange?: (status: { isWhitelisted: boolean; tier: number; maxAllocation: number }) => void;
}

const WhitelistSystem: React.FC<WhitelistSystemProps> = ({ onWhitelistStatusChange }) => {
  const { connected, publicKey } = useWallet();
  const [solBalance, setSolBalance] = useState<number>(0);
  const [userTier, setUserTier] = useState<number | null>(null);
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);
  const [socialTasks, setSocialTasks] = useState<SocialTask[]>(SOCIAL_TASKS);
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralCount, setReferralCount] = useState<number>(0);
  const [referralSol, setReferralSol] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mock function to simulate fetching user's SOL balance - memoized to avoid unnecessary recalculations
  const fetchSolBalance = useCallback(async (address: string): Promise<number> => {
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
      }, 300); // Reduced delay for better performance
    });
  }, []);

  // Check if user is whitelisted - memoized for performance
  const checkWhitelistStatus = useCallback(async (address: string): Promise<boolean> => {
    // Special case for our whitelisted user
    if (address === 'HUHv2JKDXvKzr2GMepCUcw6E9B6Hg4LGcMLT4SEY6dCs') {
      return true; // Always whitelist this specific address
    }
    
    // In production, this would check against a Merkle tree or database
    // For demo, simulate a check with 70% chance of being whitelisted
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.3);
      }, 200); // Reduced delay for better performance
    });
  }, []);

  // Determine user tier based on SOL balance - memoized for performance
  const determineUserTier = useCallback((balance: number): number | null => {
    for (const tier of TIERS) {
      if (balance >= tier.minSol) {
        return tier.id;
      }
    }
    return null;
  }, []);

  // Calculate social points - memoized for performance
  const calculateSocialPoints = useCallback((): number => {
    return socialTasks.reduce((total, task) => {
      return total + (task.completed ? task.points : 0);
    }, 0);
  }, [socialTasks]);

  // Toggle task completion - memoized for performance
  const toggleTaskCompletion = useCallback((taskId: string) => {
    setSocialTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  // Generate referral code - memoized for performance
  const generateReferralCode = useCallback((address: string): string => {
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
  }, []);

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
        // Run these in parallel for better performance
        const [balance, whitelistStatus] = await Promise.all([
          fetchSolBalance(walletAddress),
          checkWhitelistStatus(walletAddress)
        ]);
        
        if (signal.aborted) return;
        
        setSolBalance(balance);
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
  }, [connected, publicKey, fetchSolBalance, checkWhitelistStatus, determineUserTier, generateReferralCode, onWhitelistStatusChange]);

  // Get referral tier boost based on referral count
  const getReferralTierBoost = useCallback((): number => {
    return referralCount >= 10 ? 1 : 0;
  }, [referralCount]);

  // Check if user is a super affiliate
  const isSuperAffiliate = useCallback((): boolean => {
    return referralSol >= 50;
  }, [referralSol]);
  
  // Get super affiliate tier if eligible
  const getSuperAffiliateTier = useCallback((): number | null => {
    return isSuperAffiliate() ? 0 : null;
  }, [isSuperAffiliate]);

  // Get user's effective tier (base tier + boosts)
  const getEffectiveTier = useCallback((): number => {
    // Check for super affiliate status first
    const superAffiliateTier = getSuperAffiliateTier();
    if (superAffiliateTier !== null) return superAffiliateTier;
    
    if (!userTier) return 0;
    
    // Calculate tier boosts
    const socialBoost = calculateSocialPoints() >= 5 ? 1 : 0;
    const referralBoost = getReferralTierBoost();
    
    // Apply boosts (lower tier number is better)
    const boostedTier = Math.max(1, userTier - socialBoost - referralBoost);
    
    return boostedTier;
  }, [userTier, calculateSocialPoints, getReferralTierBoost, getSuperAffiliateTier]);

  // Get max allocation based on effective tier
  const getMaxAllocation = useCallback((): number => {
    const effectiveTier = getEffectiveTier();
    const tierData = TIERS.find(t => t.id === effectiveTier);
    return tierData?.maxAllocation || 0;
  }, [getEffectiveTier]);

  // Memoize the tier information to prevent unnecessary re-renders
  const tierInfo = useMemo(() => {
    if (!userTier) return null;
    return TIERS.find(t => t.id === userTier);
  }, [userTier]);

  // Memoize the effective tier info
  const effectiveTierInfo = useMemo(() => {
    const effectiveTier = getEffectiveTier();
    return TIERS.find(t => t.id === effectiveTier);
  }, [getEffectiveTier]);

  // Memoize the social tasks component for better performance
  const SocialTasksSection = useMemo(() => {
    return (
      <div className="bg-black/50 rounded-lg p-6 border border-chad-border">
        <h3 className="text-xl font-semibold text-white mb-3">Social Tasks</h3>
        <p className="text-gray-400 text-sm mb-4">Complete tasks to earn points and boost your tier</p>
        <div className="space-y-3">
          {socialTasks.map(task => (
            <div key={task.id} className="flex items-center justify-between bg-black/30 p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center">
                <div className="mr-3 text-xl">{task.icon}</div>
                <div>
                  <label htmlFor={task.id} className="text-gray-300 font-medium">{task.name}</label>
                  <div className="text-xs text-chad-neon">+{task.points} points</div>
                </div>
              </div>
              <button 
                onClick={() => toggleTaskCompletion(task.id)}
                className={`
                  px-4 py-1.5 rounded-lg text-sm font-bold transition-all
                  ${task.completed ? 
                    'bg-gradient-to-r from-chad-neon to-green-500 text-black' : 
                    `bg-gradient-to-r ${task.color} text-white opacity-80 hover:opacity-100`}
                `}
              >
                {task.completed ? 'Completed' : 'Complete'}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-700 flex justify-between items-center">
          <p className="text-gray-300">Total Points: <span className="text-chad-neon font-bold text-xl">{calculateSocialPoints()}</span></p>
          {calculateSocialPoints() >= 5 && (
            <div className="bg-gradient-to-r from-chad-neon to-green-500 text-black font-bold px-3 py-1 rounded-full text-xs">
              +1 Tier Boost
            </div>
          )}
        </div>
      </div>
    );
  }, [socialTasks, toggleTaskCompletion, calculateSocialPoints]);

  return (
    <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 border border-chad-border">
      <SectionTitle className="text-white">Whitelist System</SectionTitle>
      
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">SOL Balance: <span className="text-white font-semibold">{solBalance} SOL</span></p>
                <p className="text-gray-300">Whitelist Status: 
                  {isWhitelisted ? (
                    <span className="text-lime-400 font-bold">Whitelisted</span>
                  ) : (
                    <span className="text-red-500 font-bold">Not Whitelisted</span>
                  )}
                </p>
                {userTier && (
                  <p className="text-gray-300">Tier: 
                    <span className={`font-semibold bg-gradient-to-r ${effectiveTierInfo?.color} bg-clip-text text-transparent flex items-center`}>
                      {effectiveTierInfo?.icon} {effectiveTierInfo?.name}
                      {isSuperAffiliate() && (
                        <span className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-black text-xs px-2 py-0.5 rounded-full">SUPER</span>
                      )}
                    </span>
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-gray-300">Max Allocation: 
                  <span className="text-white font-semibold">
                    {getMaxAllocation()} SOL
                  </span>
                </p>
                <p className="text-gray-300">Referral Code: 
                  <span className="text-chad-gold font-mono font-semibold">{referralCode}</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Social Tasks - Deferred rendering for better performance */}
          <DeferredRender>
            {SocialTasksSection}
          </DeferredRender>
          
          {/* Referrals - Deferred rendering */}
          <DeferredRender>
            <div className="bg-black/50 rounded-lg p-6 border border-chad-border">
              <h3 className="text-xl font-semibold text-white mb-3">Referrals</h3>
              <div className="bg-black/30 p-4 rounded-lg border border-gray-800 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Your Referral Code</p>
                    <div className="bg-gradient-to-r from-chad-gold to-yellow-500 bg-clip-text text-transparent font-mono font-bold text-xl">
                      {referralCode}
                    </div>
                  </div>
                  <button className="bg-black/50 border border-gray-700 hover:border-gray-500 px-3 py-1 rounded-lg text-gray-300 text-sm transition-colors">
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                  <p className="text-gray-400 text-sm mb-1">Total Referrals</p>
                  <div className="text-2xl font-bold text-white flex items-center">
                    <span className="text-chad-gold mr-2">👥</span>
                    {referralCount}
                  </div>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                  <p className="text-gray-400 text-sm mb-1">SOL Contributed</p>
                  <div className="text-2xl font-bold text-white flex items-center">
                    <span className="text-chad-gold mr-2">💰</span>
                    {referralSol} SOL
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-gray-300">Referral Status:</p>
                  {referralCount >= 10 && (
                    <div className="bg-gradient-to-r from-chad-gold to-yellow-500 text-black font-bold px-4 py-1.5 rounded-full text-sm">
                      +1 Tier Boost (10+ Referrals)
                    </div>
                  )}
                </div>
                {isSuperAffiliate() && (
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg text-center">
                    <p className="text-black font-bold">🏆 SUPER AFFILIATE STATUS ACHIEVED 🏆</p>
                    <p className="text-black text-sm">Enjoy maximum allocation and exclusive benefits!</p>
                  </div>
                )}
              </div>
            </div>
          </DeferredRender>
          
          {/* Tier Requirements - Deferred rendering */}
          <DeferredRender>
            <div className="bg-black/50 rounded-lg p-6 border border-chad-border">
              <h3 className="text-xl font-semibold text-white mb-3">Tier Requirements</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30">
                  <h4 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">Super Affiliate</h4>
                  <p className="text-gray-300 text-sm mb-2">Bring 50+ SOL in referrals to unlock:</p>
                  <ul className="list-disc list-inside text-sm space-y-1 text-gray-300">
                    <li>Maximum allocation (100 SOL)</li>
                    <li>Priority token distribution</li>
                    <li>Exclusive NFT rewards</li>
                    <li>VIP community access</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-chad-gold/20 to-amber-500/20 p-4 rounded-lg border border-chad-gold/30">
                  <h4 className="text-lg font-bold bg-gradient-to-r from-chad-gold to-amber-500 bg-clip-text text-transparent mb-2">Tier Boosters</h4>
                  <p className="text-gray-300 text-sm mb-2">Boost your tier with:</p>
                  <ul className="list-disc list-inside text-sm space-y-1 text-gray-300">
                    <li><span className="text-chad-gold">+1 Tier</span> for 10+ referrals</li>
                    <li><span className="text-chad-neon">+1 Tier</span> for 5+ social points</li>
                    <li><span className="text-white">Lower tier number = better allocation</span></li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-2">
                {TIERS.map(tier => (
                  <div 
                    key={tier.id}
                    className={`p-3 rounded-lg border ${getEffectiveTier() === tier.id ? 'border-lime-400 bg-black/50' : 'border-gray-800 bg-black/30'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="mr-2">{tier.icon}</span>
                          <p className={`font-semibold ${getEffectiveTier() === tier.id ? 'text-white' : 'text-gray-300'}`}>
                            {tier.name}
                          </p>
                          {getEffectiveTier() === tier.id && (
                            <span className="ml-2 bg-lime-400 text-black text-xs px-2 py-0.5 rounded-full">CURRENT</span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">
                          {tier.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getEffectiveTier() === tier.id ? 'text-white' : 'text-gray-300'}`}>
                          {tier.maxAllocation} SOL
                        </p>
                        <p className="text-gray-400 text-sm">
                          Max Allocation
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DeferredRender>
        </div>
      )}
    </div>
  );
};

export default WhitelistSystem;
