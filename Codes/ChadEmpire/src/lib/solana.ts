import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

// Default RPC endpoint (will be overridden by environment variable)
const DEFAULT_RPC_ENDPOINT = 'https://api.devnet.solana.com';

// Get the Solana RPC endpoint from environment or use default
export const getRpcEndpoint = (): string => {
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || DEFAULT_RPC_ENDPOINT;
};

// Create a Solana connection
export const createConnection = (): Connection => {
  return new Connection(getRpcEndpoint(), 'confirmed');
};

// Get the program ID for the ChadEmpire smart contract
export const getProgramId = (): PublicKey => {
  const programIdString = process.env.NEXT_PUBLIC_PROGRAM_ID;
  if (!programIdString) {
    throw new Error('PROGRAM_ID environment variable is not set');
  }
  return new PublicKey(programIdString);
};

// Convert SOL to lamports
export const solToLamports = (sol: number): number => {
  return sol * LAMPORTS_PER_SOL;
};

// Convert lamports to SOL
export const lamportsToSol = (lamports: number): number => {
  return lamports / LAMPORTS_PER_SOL;
};

// Format a wallet address for display
export const formatWalletAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// Check if a wallet has enough SOL balance
export const checkWalletBalance = async (
  connection: Connection,
  walletAddress: PublicKey,
  requiredSol: number
): Promise<boolean> => {
  try {
    const balance = await connection.getBalance(walletAddress);
    return balance >= solToLamports(requiredSol);
  } catch (error) {
    console.error('Error checking wallet balance:', error);
    return false;
  }
};

// Generate a random seed using blockhash for RNG
export const getRandomSeed = async (connection: Connection): Promise<Uint8Array> => {
  try {
    // Get a recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    
    // Convert blockhash to Uint8Array
    const encoder = new TextEncoder();
    const blockhashBytes = encoder.encode(blockhash);
    
    // Add some additional entropy
    const timestamp = new Uint8Array(new Float64Array([Date.now()]).buffer);
    
    // Combine blockhash and timestamp for better randomness
    const combinedArray = new Uint8Array(blockhashBytes.length + timestamp.length);
    combinedArray.set(blockhashBytes);
    combinedArray.set(timestamp, blockhashBytes.length);
    
    return combinedArray;
  } catch (error) {
    console.error('Error generating random seed:', error);
    throw error;
  }
};

// Custom hook for Solana interactions in React components
export function useSolana() {
  const wallet = useWallet();
  const connection = createConnection();
  
  // Stake $CHAD tokens
  const stakeTokens = async (amount: number): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }
    
    // In a real implementation, this would create a transaction to call the stake instruction
    // on your Solana program. For now, we'll just simulate it.
    
    // Mock transaction hash
    return `mock_tx_${Date.now()}`;
  };
  
  // Unstake $CHAD tokens
  const unstakeTokens = async (stakeId: string, amount: number): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }
    
    // In a real implementation, this would create a transaction to call the unstake instruction
    // on your Solana program. For now, we'll just simulate it.
    
    // Mock transaction hash
    return `mock_tx_${Date.now()}`;
  };
  
  // Execute a spin
  const executeSpin = async (spinType: string, boosterUsed?: string): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }
    
    // In a real implementation, this would create a transaction to call the spin instruction
    // on your Solana program. For now, we'll just simulate it.
    
    // Mock transaction hash
    return `mock_tx_${Date.now()}`;
  };
  
  // Use a booster
  const useBooster = async (boosterId: string): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }
    
    // In a real implementation, this would create a transaction to call the useBooster instruction
    // on your Solana program. For now, we'll just simulate it.
    
    // Mock transaction hash
    return `mock_tx_${Date.now()}`;
  };
  
  // Mint a booster from fragments
  const mintBoosterFromFragments = async (fragmentType: string): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }
    
    // In a real implementation, this would create a transaction to call the mintBooster instruction
    // on your Solana program. For now, we'll just simulate it.
    
    // Mock transaction hash
    return `mock_tx_${Date.now()}`;
  };
  
  // Purchase lottery tickets
  const purchaseTickets = async (quantity: number): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }
    
    // In a real implementation, this would create a transaction to call the purchaseTickets instruction
    // on your Solana program. For now, we'll just simulate it.
    
    // Mock transaction hash
    return `mock_tx_${Date.now()}`;
  };
  
  return {
    connection,
    stakeTokens,
    unstakeTokens,
    executeSpin,
    useBooster,
    mintBoosterFromFragments,
    purchaseTickets
  };
}
