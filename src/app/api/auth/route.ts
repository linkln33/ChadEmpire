import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import * as bs58 from 'bs58';
import { sign } from 'tweetnacl';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { getSupabase } from '@/lib/supabase';

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
    
    // Store the nonce in Supabase
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Failed to initialize Supabase client');
    }
    
    // Store auth nonce in a nonces table (we'll need to create this table in Supabase)
    const { error } = await supabase
      .from('auth_nonces')
      .upsert({
        wallet_address: walletAddress,
        nonce: nonce,
        expires_at: new Date(expiry).toISOString(),
      });
      
    if (error) {
      throw error;
    }
    
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
    
    // Get the nonce from Supabase
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Failed to initialize Supabase client');
    }
    
    // Get the nonce for this wallet
    const { data: nonceData, error: nonceError } = await supabase
      .from('auth_nonces')
      .select('nonce, expires_at')
      .eq('wallet_address', walletAddress)
      .single() as { data: any, error: any };
    
    if (nonceError || !nonceData) {
      return NextResponse.json({ error: 'No authentication request found for this wallet' }, { status: 400 });
    }
    
    // Check if the nonce has expired
    const expiryTime = new Date(nonceData.expires_at as string).getTime();
    if (expiryTime < Date.now()) {
      // Delete expired nonce
      await supabase
        .from('auth_nonces')
        .delete()
        .eq('wallet_address', walletAddress);
        
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
      await supabase
        .from('auth_nonces')
        .delete()
        .eq('wallet_address', walletAddress);
      
      // Create or get user from database
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single() as { data: any, error: any };
      
      let user;
      
      if (userError || !existingUser) {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            wallet_address: walletAddress,
            username: null,
            avatar_url: `https://api.dicebear.com/7.x/personas/svg?seed=${walletAddress}`,
            chad_score: 0,
            total_spins: 0,
            total_wins: 0,
            total_yield_earned: 0,
            referral_code: 'CHAD' + walletAddress.substring(0, 8),
          })
          .select()
          .single() as { data: any, error: any };
          
        if (createError) {
          throw createError;
        }
        
        user = newUser;
      } else {
        user = existingUser;
      }
      
      // Create a session using Supabase Auth
      // Note: In a real implementation, we'd use Supabase Auth's custom JWT
      // For now, we'll still use our cookie-based approach
      const token = `mock_jwt_${walletAddress}_${Date.now()}`;
      const cookieStore = await cookies();
      cookieStore.set('chadempire_auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 1 week
        path: '/',
      });
      
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          walletAddress: user.wallet_address,
          username: user.username,
          avatarUrl: user.avatar_url,
          chadScore: user.chad_score,
          totalSpins: user.total_spins,
          totalWins: user.total_wins,
          totalYieldEarned: user.total_yield_earned,
          referralCode: user.referral_code,
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
