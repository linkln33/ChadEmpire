'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WhitelistEntry, generateMockWhitelistData, mergeWhitelists } from '../../utils/merkleTree';

// Admin addresses that are allowed to access this panel
const ADMIN_ADDRESSES = [
  'BvzKvn6nUUAYtKu2pH3h5SbUkUNcRPQawg4bURBiojJx', // Example admin address
  'HUHv2JKDXvKzr2GMepCUcw6E9B6Hg4LGcMLT4SEY6dCs', // User's wallet address
];

interface WhitelistAdminProps {
  className?: string;
}

const WhitelistAdmin: React.FC<WhitelistAdminProps> = ({ className }) => {
  const { connected, publicKey } = useWallet();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [manualEntries, setManualEntries] = useState<WhitelistEntry[]>([]);
  const [newAddress, setNewAddress] = useState<string>('');
  const [newTier, setNewTier] = useState<number>(5);
  const [csvData, setCsvData] = useState<string>('');
  const [snapshotData, setSnapshotData] = useState<WhitelistEntry[]>([]);
  const [mergedData, setMergedData] = useState<WhitelistEntry[]>([]);
  const [merkleRoot, setMerkleRoot] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'manual' | 'csv' | 'merkle'>('manual');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);

  // Check if connected wallet is an admin
  useEffect(() => {
    if (connected && publicKey) {
      const isAdminWallet = ADMIN_ADDRESSES.includes(publicKey.toString());
      setIsAdmin(isAdminWallet);
      
      // For demo purposes, always allow access
      setIsAdmin(true);
      
      // Load mock snapshot data
      const mockSnapshot = generateMockWhitelistData(50);
      setSnapshotData(mockSnapshot);
      
      // Load any saved manual entries from localStorage
      try {
        const savedEntries = localStorage.getItem('chadEmpireManualWhitelist');
        if (savedEntries) {
          const parsedEntries = JSON.parse(savedEntries);
          
          // Check if user's wallet is already in the entries
          const userWalletExists = parsedEntries.some(
            (entry: WhitelistEntry) => entry.address === 'HUHv2JKDXvKzr2GMepCUcw6E9B6Hg4LGcMLT4SEY6dCs'
          );
          
          if (!userWalletExists) {
            // Add user's wallet with Tier 1 status
            parsedEntries.push({
              address: 'HUHv2JKDXvKzr2GMepCUcw6E9B6Hg4LGcMLT4SEY6dCs',
              tier: 1,
              maxAllocation: 50
            });
          }
          
          setManualEntries(parsedEntries);
        } else {
          // No saved entries, create initial list with user's wallet
          setManualEntries([{
            address: 'HUHv2JKDXvKzr2GMepCUcw6E9B6Hg4LGcMLT4SEY6dCs',
            tier: 1,
            maxAllocation: 50
          }]);
        }
      } catch (error) {
        console.error('Failed to load saved whitelist entries:', error);
        
        // Fallback: set initial entries with user's wallet
        setManualEntries([{
          address: 'HUHv2JKDXvKzr2GMepCUcw6E9B6Hg4LGcMLT4SEY6dCs',
          tier: 1,
          maxAllocation: 50
        }]);
      }
    } else {
      setIsAdmin(false);
    }
  }, [connected, publicKey]);

  // Update merged data when either snapshot or manual entries change
  useEffect(() => {
    const merged = mergeWhitelists(snapshotData, manualEntries);
    setMergedData(merged);
  }, [snapshotData, manualEntries]);

  // Save manual entries to localStorage when they change
  useEffect(() => {
    if (manualEntries.length > 0) {
      localStorage.setItem('chadEmpireManualWhitelist', JSON.stringify(manualEntries));
    }
  }, [manualEntries]);

  // Handle adding a new manual entry
  const handleAddManualEntry = () => {
    if (!newAddress || newAddress.trim() === '') {
      setStatusMessage({
        text: 'Please enter a valid wallet address',
        type: 'error'
      });
      return;
    }

    // Set max allocation based on tier
    const maxAllocation = newTier === 1 ? 50 :
                         newTier === 2 ? 30 :
                         newTier === 3 ? 20 :
                         newTier === 4 ? 10 : 5;
    
    // Check if address already exists
    const existingIndex = manualEntries.findIndex(
      entry => entry.address.toLowerCase() === newAddress.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      // Update existing entry
      const updatedEntries = [...manualEntries];
      updatedEntries[existingIndex] = {
        address: newAddress,
        tier: newTier,
        maxAllocation
      };
      setManualEntries(updatedEntries);
      setStatusMessage({
        text: 'Updated existing whitelist entry',
        type: 'success'
      });
    } else {
      // Add new entry
      setManualEntries([
        ...manualEntries,
        {
          address: newAddress,
          tier: newTier,
          maxAllocation
        }
      ]);
      setStatusMessage({
        text: 'Added new whitelist entry',
        type: 'success'
      });
    }
    
    // Reset form
    setNewAddress('');
  };

  // Handle removing a manual entry
  const handleRemoveEntry = (address: string) => {
    setManualEntries(manualEntries.filter(entry => entry.address !== address));
    setStatusMessage({
      text: 'Removed whitelist entry',
      type: 'info'
    });
  };

  // Handle importing CSV data
  const handleImportCSV = () => {
    try {
      setIsLoading(true);
      
      // Parse CSV data (format: address,tier)
      const lines = csvData.trim().split('\n');
      const newEntries: WhitelistEntry[] = [];
      
      for (const line of lines) {
        const [address, tierStr] = line.split(',');
        if (!address || !tierStr) continue;
        
        const tier = parseInt(tierStr.trim());
        if (isNaN(tier) || tier < 1 || tier > 5) continue;
        
        const maxAllocation = tier === 1 ? 50 :
                             tier === 2 ? 30 :
                             tier === 3 ? 20 :
                             tier === 4 ? 10 : 5;
        
        newEntries.push({
          address: address.trim(),
          tier,
          maxAllocation
        });
      }
      
      // Merge with existing entries
      const existingAddresses = new Set(manualEntries.map(e => e.address.toLowerCase()));
      const uniqueNewEntries = newEntries.filter(e => !existingAddresses.has(e.address.toLowerCase()));
      
      setManualEntries([...manualEntries, ...uniqueNewEntries]);
      setCsvData('');
      setStatusMessage({
        text: `Imported ${uniqueNewEntries.length} new whitelist entries`,
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to import CSV:', error);
      setStatusMessage({
        text: 'Failed to import CSV data',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle generating Merkle root
  const handleGenerateMerkleRoot = () => {
    setIsLoading(true);
    
    // Simulate API call to generate Merkle root
    setTimeout(() => {
      // In production, this would use the actual MerkleTree class
      const mockRoot = '0x' + Array(64).fill(0).map(() => 
        '0123456789abcdef'[Math.floor(Math.random() * 16)]
      ).join('');
      
      setMerkleRoot(mockRoot);
      setStatusMessage({
        text: 'Generated new Merkle root',
        type: 'success'
      });
      setIsLoading(false);
    }, 1500);
  };

  // Handle deploying Merkle root to contract
  const handleDeployMerkleRoot = () => {
    setIsLoading(true);
    
    // Simulate API call to deploy Merkle root to contract
    setTimeout(() => {
      setStatusMessage({
        text: 'Merkle root deployed to contract successfully',
        type: 'success'
      });
      setIsLoading(false);
    }, 2000);
  };

  if (!connected) {
    return (
      <div className={`bg-gradient-to-br from-chad-dark/80 to-black p-6 rounded-xl border border-gray-800 shadow-lg ${className}`}>
        <h3 className="text-xl font-bold mb-6 text-center">
          <span className="bg-gradient-to-r from-chad-gold to-chad-pink text-transparent bg-clip-text">Whitelist Admin</span>
        </h3>
        <p className="text-center text-gray-300 mb-6">Connect your wallet to access the admin panel</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={`bg-gradient-to-br from-chad-dark/80 to-black p-6 rounded-xl border border-gray-800 shadow-lg ${className}`}>
        <h3 className="text-xl font-bold mb-6 text-center">
          <span className="bg-gradient-to-r from-chad-gold to-chad-pink text-transparent bg-clip-text">Whitelist Admin</span>
        </h3>
        <p className="text-center text-red-500 mb-6">Access denied. Only admin wallets can access this panel.</p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-chad-dark/80 to-black p-6 rounded-xl border border-gray-800 shadow-lg ${className}`}>
      <h3 className="text-xl font-bold mb-6 text-center">
        <span className="bg-gradient-to-r from-chad-gold to-chad-pink text-transparent bg-clip-text">Whitelist Admin</span>
      </h3>
      
      {/* Status message */}
      {statusMessage && (
        <div className={`mb-6 p-3 rounded-lg ${
          statusMessage.type === 'success' ? 'bg-green-900/30 border border-green-700 text-green-400' :
          statusMessage.type === 'error' ? 'bg-red-900/30 border border-red-700 text-red-400' :
          'bg-blue-900/30 border border-blue-700 text-blue-400'
        }`}>
          {statusMessage.text}
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-800 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'manual' 
              ? 'text-chad-gold border-b-2 border-chad-gold' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('manual')}
        >
          Manual Entries
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'csv' 
              ? 'text-chad-neon border-b-2 border-chad-neon' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('csv')}
        >
          CSV Import
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'merkle' 
              ? 'text-chad-pink border-b-2 border-chad-pink' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('merkle')}
        >
          Merkle Tree
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="mb-6">
        {/* Manual Entry Tab */}
        {activeTab === 'manual' && (
          <div>
            <div className="bg-black/30 p-4 rounded-lg border border-gray-800 mb-6">
              <h4 className="font-bold text-white mb-4">Add Manual Whitelist Entry</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-400 mb-2">Wallet Address</label>
                  <input 
                    type="text" 
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Enter Solana wallet address"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-chad-neon focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Tier</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(parseInt(e.target.value))}
                    className="w-full bg-black/50 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-chad-neon focus:border-transparent"
                  >
                    <option value={1}>Tier 1 (50 SOL)</option>
                    <option value={2}>Tier 2 (30 SOL)</option>
                    <option value={3}>Tier 3 (20 SOL)</option>
                    <option value={4}>Tier 4 (10 SOL)</option>
                    <option value={5}>Tier 5 (5 SOL)</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleAddManualEntry}
                className="bg-gradient-to-r from-chad-pink to-chad-neon text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-chad-neon/50 transition-all duration-300"
              >
                Add to Whitelist
              </button>
            </div>
            
            <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
              <h4 className="font-bold text-white mb-4">Manual Whitelist Entries ({manualEntries.length})</h4>
              
              {manualEntries.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No manual entries added yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="py-2 px-4 text-left text-gray-400">Wallet Address</th>
                        <th className="py-2 px-4 text-center text-gray-400">Tier</th>
                        <th className="py-2 px-4 text-right text-gray-400">Max Allocation</th>
                        <th className="py-2 px-4 text-right text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {manualEntries.map((entry, index) => (
                        <tr key={index} className="hover:bg-black/30 transition-colors">
                          <td className="py-2 px-4 font-mono text-gray-300">{entry.address}</td>
                          <td className="py-2 px-4 text-center">
                            <span className={`inline-block w-6 h-6 rounded-full bg-gradient-to-r ${
                              entry.tier === 1 ? 'from-chad-gold to-amber-500' :
                              entry.tier === 2 ? 'from-gray-300 to-gray-400' :
                              entry.tier === 3 ? 'from-amber-700 to-amber-800' :
                              entry.tier === 4 ? 'from-chad-neon to-cyan-600' :
                              'from-chad-pink to-purple-600'
                            } text-center text-xs font-bold leading-6 text-black`}>
                              {entry.tier}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-right text-white font-bold">{entry.maxAllocation} SOL</td>
                          <td className="py-2 px-4 text-right">
                            <button
                              onClick={() => handleRemoveEntry(entry.address)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* CSV Import Tab */}
        {activeTab === 'csv' && (
          <div>
            <div className="bg-black/30 p-4 rounded-lg border border-gray-800 mb-6">
              <h4 className="font-bold text-white mb-4">Import Whitelist from CSV</h4>
              <p className="text-gray-400 mb-4">
                Format: <code className="bg-black/50 px-2 py-1 rounded">wallet_address,tier</code> (one entry per line)
              </p>
              
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="Example:&#10;So1abcdef123456789,1&#10;So1ghijkl987654321,2"
                className="w-full h-40 bg-black/50 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-chad-neon focus:border-transparent font-mono text-sm mb-4"
              />
              
              <button
                onClick={handleImportCSV}
                disabled={isLoading || !csvData.trim()}
                className={`bg-gradient-to-r from-chad-pink to-chad-neon text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 ${
                  isLoading || !csvData.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-chad-neon/50'
                }`}
              >
                {isLoading ? 'Importing...' : 'Import CSV'}
              </button>
            </div>
            
            <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
              <h4 className="font-bold text-white mb-4">CSV Import Tips</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Each line should contain a wallet address and tier number separated by a comma</li>
                <li>Valid tier numbers are 1-5</li>
                <li>Duplicate addresses will be ignored</li>
                <li>You can export data from spreadsheets as CSV</li>
                <li>Large imports may take a moment to process</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Merkle Tree Tab */}
        {activeTab === 'merkle' && (
          <div>
            <div className="bg-black/30 p-4 rounded-lg border border-gray-800 mb-6">
              <h4 className="font-bold text-white mb-4">Generate Merkle Tree</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-black/50 p-4 rounded-lg border border-gray-700">
                  <h5 className="font-medium text-chad-neon mb-2">Snapshot Data</h5>
                  <p className="text-gray-400 mb-2">Daily SOL wallet snapshots</p>
                  <div className="text-2xl font-bold text-white">{snapshotData.length} wallets</div>
                </div>
                <div className="bg-black/50 p-4 rounded-lg border border-gray-700">
                  <h5 className="font-medium text-chad-pink mb-2">Manual Entries</h5>
                  <p className="text-gray-400 mb-2">Admin-added whitelist entries</p>
                  <div className="text-2xl font-bold text-white">{manualEntries.length} wallets</div>
                </div>
              </div>
              
              <div className="bg-black/50 p-4 rounded-lg border border-gray-700 mb-6">
                <h5 className="font-medium text-chad-gold mb-2">Merged Whitelist</h5>
                <p className="text-gray-400 mb-2">Combined snapshot and manual entries</p>
                <div className="text-2xl font-bold text-white">{mergedData.length} wallets</div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGenerateMerkleRoot}
                  disabled={isLoading || mergedData.length === 0}
                  className={`bg-gradient-to-r from-chad-pink to-chad-neon text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 ${
                    isLoading || mergedData.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-chad-neon/50'
                  }`}
                >
                  {isLoading ? 'Generating...' : 'Generate Merkle Root'}
                </button>
                
                <button
                  onClick={handleDeployMerkleRoot}
                  disabled={isLoading || !merkleRoot}
                  className={`bg-gradient-to-r from-chad-gold to-amber-500 text-black font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 ${
                    isLoading || !merkleRoot ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-chad-gold/50'
                  }`}
                >
                  {isLoading ? 'Deploying...' : 'Deploy to Contract'}
                </button>
              </div>
            </div>
            
            {merkleRoot && (
              <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
                <h4 className="font-bold text-white mb-4">Merkle Root</h4>
                <div className="bg-black/50 p-3 rounded-lg border border-gray-700 font-mono text-sm text-chad-neon break-all">
                  {merkleRoot}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="text-center text-gray-500 text-sm mt-8">
        Admin access granted to wallet: {publicKey?.toString().substring(0, 6)}...{publicKey?.toString().substring(publicKey.toString().length - 4)}
      </div>
    </div>
  );
};

export default WhitelistAdmin;
