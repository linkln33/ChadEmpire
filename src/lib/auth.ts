import { PublicKey } from '@solana/web3.js';
import * as bs58 from 'bs58';
import { sign } from 'tweetnacl';
import { User } from '@/stores/userStore';

// Interface for authentication response
interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Interface for nonce response
interface NonceResponse {
  nonce: string;
  message: string;
  error?: string;
}

// Request a nonce for wallet authentication
export const requestNonce = async (walletAddress: string): Promise<NonceResponse> => {
  try {
    const response = await fetch(`/api/auth?wallet=${walletAddress}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get authentication nonce');
    }
    
    return data;
  } catch (error) {
    console.error('Error requesting nonce:', error);
    return {
      nonce: '',
      message: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Verify wallet ownership by signing the nonce
export const verifyWallet = async (
  walletAddress: string,
  signature: string
): Promise<AuthResponse> => {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        signature,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Authentication failed');
    }
    
    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    console.error('Error verifying wallet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Sign a message with the wallet
export const signMessage = async (
  message: string,
  signTransaction: (message: Uint8Array) => Promise<Uint8Array>
): Promise<string> => {
  try {
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await signTransaction(encodedMessage);
    return bs58.encode(signedMessage);
  } catch (error) {
    console.error('Error signing message:', error);
    throw error;
  }
};

// Verify a signed message
export const verifySignature = (
  message: string,
  signature: Uint8Array,
  publicKey: PublicKey
): boolean => {
  try {
    const encodedMessage = new TextEncoder().encode(message);
    return sign.detached.verify(
      encodedMessage,
      signature,
      publicKey.toBytes()
    );
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

// Logout the current user
export const logout = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
};

// Get the current authenticated user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch('/api/user');
    
    if (!response.ok) {
      if (response.status === 401) {
        // Not authenticated
        return null;
      }
      throw new Error('Failed to fetch user data');
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (
  username?: string,
  avatarUrl?: string
): Promise<User | null> => {
  try {
    const response = await fetch('/api/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        avatarUrl,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};
