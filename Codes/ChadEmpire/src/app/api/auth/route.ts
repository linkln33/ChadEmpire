import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import * as bs58 from 'bs58';
import { sign } from 'tweetnacl';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// In a real app, this would be stored in a database
const nonceStore: Record<string, { nonce: string; expiry: number }> = {};

// Generate a nonce for the user to sign
export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get('wallet');
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }
    
    // Validate wallet address
    try {
      new PublicKey(walletAddress);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }
    
    // Generate a nonce with 5 minute expiry
    const nonce = uuidv4();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    // Store the nonce
    nonceStore[walletAddress] = { nonce, expiry };
    
    return NextResponse.json({ 
      nonce,
      message: `Sign this message to verify your wallet ownership: ${nonce}`
    });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return NextResponse.json({ error: 'Failed to generate nonce' }, { status: 500 });
  }
}

// Verify the signature and authenticate the user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, signature } = body;
    
    if (!walletAddress || !signature) {
      return NextResponse.json({ error: 'Wallet address and signature are required' }, { status: 400 });
    }
    
    // Check if we have a nonce for this wallet
    const nonceData = nonceStore[walletAddress];
    if (!nonceData) {
      return NextResponse.json({ error: 'No authentication request found for this wallet' }, { status: 400 });
    }
    
    // Check if the nonce has expired
    if (nonceData.expiry < Date.now()) {
      delete nonceStore[walletAddress];
      return NextResponse.json({ error: 'Authentication request expired, please try again' }, { status: 400 });
    }
    
    // Verify the signature
    try {
      const publicKey = new PublicKey(walletAddress);
      const message = new TextEncoder().encode(`Sign this message to verify your wallet ownership: ${nonceData.nonce}`);
      const signatureBytes = bs58.decode(signature);
      
      const verified = sign.detached.verify(
        message,
        signatureBytes,
        publicKey.toBytes()
      );
      
      if (!verified) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      
      // Clean up the nonce
      delete nonceStore[walletAddress];
      
      // In a real app, you would create or update the user in the database here
      
      // Set a JWT token in cookies (in a real app, use a proper JWT library)
      const token = `mock_jwt_${walletAddress}_${Date.now()}`;
      cookies().set('chadempire_auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 1 week
        path: '/',
      });
      
      return NextResponse.json({
        success: true,
        user: {
          walletAddress,
          username: null, // In a real app, fetch from database
          chadScore: 0,
          totalSpins: 0,
          totalWins: 0,
          totalYieldEarned: 0,
        }
      });
    } catch (error) {
      console.error('Error verifying signature:', error);
      return NextResponse.json({ error: 'Failed to verify signature' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
