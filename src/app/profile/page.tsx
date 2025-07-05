'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUserStore } from '@/stores/userStore';
import { updateUserProfile } from '@/lib/auth';
import { formatWalletAddress } from '@/lib/solana';
import Link from 'next/link';

export default function ProfilePage() {
  const { connected, publicKey } = useWallet();
  const { user, stakes, spins, boosters, lotteryTickets, fetchUserData } = useUserStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fetch user data on component mount
  useEffect(() => {
    if (connected && publicKey) {
      fetchUserData(publicKey.toString());
    }
  }, [connected, publicKey, fetchUserData]);
  
  // Update form fields when user data changes
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);
  
  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !publicKey) return;
    
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      const updatedUser = await updateUserProfile(username, avatarUrl);
      
      if (updatedUser) {
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        fetchUserData(publicKey.toString());
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate a random avatar URL if none exists
  const generateRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(2, 10);
    setAvatarUrl(`https://api.dicebear.com/7.x/personas/svg?seed=${seed}`);
  };
  
  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-8 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="mb-6">Connect your Solana wallet to view your profile!</p>
          <p className="text-gray-400">Use the wallet button in the top right corner</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Your Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden bg-gray-700">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Avatar
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={generateRandomAvatar}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Generate Random Avatar
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter a username"
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                  maxLength={20}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Avatar URL
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              
              {successMessage && (
                <p className="text-green-400 text-center">{successMessage}</p>
              )}
            </form>
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden bg-gray-700">
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Avatar
                  </div>
                )}
              </div>
              
              <h2 className="text-2xl font-bold mb-1">
                {user?.username || 'Anonymous Chad'}
              </h2>
              
              <p className="text-gray-400 mb-6">
                {publicKey ? formatWalletAddress(publicKey.toString()) : ''}
              </p>
              
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Edit Profile
              </button>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Referral Program</h3>
            
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-400 mb-1">Your Referral Code</p>
              <p className="font-mono bg-gray-800 p-2 rounded text-center">
                {user?.referralCode || 'CHAD' + publicKey?.toString().substring(0, 8)}
              </p>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">
              Share your referral code with friends. You'll earn 5% of their yield rewards!
            </p>
            
            <button
              onClick={() => {
                const code = user?.referralCode || 'CHAD' + publicKey?.toString().substring(0, 8);
                navigator.clipboard.writeText(code);
                alert('Referral code copied to clipboard!');
              }}
              className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg"
            >
              Copy Referral Code
            </button>
          </div>
        </div>
        
        {/* Middle Column - Stats */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6">Your Stats</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">Chad Score</p>
                <p className="text-2xl font-bold text-orange-500">
                  {user?.chadScore?.toLocaleString() || '0'}
                </p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">Total Spins</p>
                <p className="text-2xl font-bold">
                  {spins.length}
                </p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">Total Wins</p>
                <p className="text-2xl font-bold text-green-500">
                  {spins.filter(spin => spin.result === 'win').length}
                </p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-blue-500">
                  {spins.length > 0 
                    ? `${Math.round((spins.filter(spin => spin.result === 'win').length / spins.length) * 100)}%` 
                    : '0%'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Assets Overview */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Your Assets</h2>
            
            <div className="space-y-6">
              {/* Stakes */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Stakes</h3>
                  <Link href="/game?tab=stake" className="text-sm text-blue-400 hover:text-blue-300">
                    Manage Stakes
                  </Link>
                </div>
                
                {stakes.length > 0 ? (
                  <div className="space-y-3">
                    {stakes.map((stake) => (
                      <div key={stake.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{stake.amount.toLocaleString()} $CHAD</p>
                          <p className="text-sm text-gray-400">
                            Staked on {new Date(stake.stakedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-500 font-semibold">Active</p>
                          <p className="text-sm text-gray-400">
                            {Math.floor((Date.now() - new Date(stake.stakedAt).getTime()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4 bg-gray-700 rounded-lg">
                    No active stakes. Stake $CHAD to start earning!
                  </p>
                )}
              </div>
              
              {/* Boosters */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Boosters</h3>
                  <Link href="/boosters" className="text-sm text-blue-400 hover:text-blue-300">
                    View All
                  </Link>
                </div>
                
                {boosters.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {boosters.slice(0, 4).map((booster) => (
                      <div key={booster.id} className="bg-gray-700 rounded-lg p-3 flex items-center">
                        <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${
                          booster.boosterType === 'yield_multiplier' ? 'bg-green-600' :
                          booster.boosterType === 'luck_boost' ? 'bg-blue-600' :
                          booster.boosterType === 'bonus_spin' ? 'bg-red-600' :
                          'bg-purple-600'
                        }`}>
                          {booster.boosterType === 'yield_multiplier' && '💰'}
                          {booster.boosterType === 'luck_boost' && '🍀'}
                          {booster.boosterType === 'bonus_spin' && '🎡'}
                          {booster.boosterType === 'jackpot_access' && '🎯'}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {booster.boosterType === 'yield_multiplier' && `${booster.powerLevel}x Yield`}
                            {booster.boosterType === 'luck_boost' && `Luck +${booster.powerLevel * 10}%`}
                            {booster.boosterType === 'bonus_spin' && 'Bonus Spin'}
                            {booster.boosterType === 'jackpot_access' && 'Jackpot Access'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {booster.usedAt ? 'Used' : 'Available'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4 bg-gray-700 rounded-lg">
                    No boosters yet. Collect fragments or buy from marketplace!
                  </p>
                )}
              </div>
              
              {/* Lottery Tickets */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Lottery Tickets</h3>
                  <Link href="/lottery" className="text-sm text-blue-400 hover:text-blue-300">
                    View Lottery
                  </Link>
                </div>
                
                {lotteryTickets.length > 0 ? (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="font-semibold">
                      {lotteryTickets.length} Active Ticket{lotteryTickets.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-400">
                      Next draw: {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4 bg-gray-700 rounded-lg">
                    No lottery tickets. Buy tickets or win them from spins!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
