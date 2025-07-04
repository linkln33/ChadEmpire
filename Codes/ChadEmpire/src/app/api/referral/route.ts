import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabase } from '@/lib/supabase';

// Middleware to verify authentication
const verifyAuth = async (request: NextRequest) => {
  const cookieStore = await cookies();
  const token = cookieStore.get('chadempire_auth')?.value;
  
  if (!token) {
    return { authenticated: false, error: 'Authentication required' };
  }
  
  const walletAddress = token.split('_')[2];
  
  if (!walletAddress) {
    return { authenticated: false, error: 'Invalid authentication token' };
  }
  
  return { authenticated: true, walletAddress };
};

// Get referral information for the user
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  
  try {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Failed to initialize Supabase client');
    }
    
    // Get user data including referral code
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, referral_code, referred_by')
      .eq('wallet_address', auth.walletAddress as string)
      .single() as { data: any, error: any };
      
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get users referred by this user
    const { data: referrals, error: referralsError } = await supabase
      .from('users')
      .select('id, wallet_address, username, avatar_url, chad_score, total_spins, created_at')
      .eq('referred_by', userData.referral_code) as { data: any[], error: any };
      
    if (referralsError) {
      throw referralsError;
    }
    
    // Get referrer information if the user was referred
    let referrer = null;
    if (userData.referred_by) {
      const { data: referrerData, error: referrerError } = await supabase
        .from('users')
        .select('wallet_address, username, avatar_url')
        .eq('referral_code', userData.referred_by)
        .single() as { data: any, error: any };
        
      if (!referrerError && referrerData) {
        referrer = {
          walletAddress: referrerData.wallet_address,
          username: referrerData.username,
          avatarUrl: referrerData.avatar_url
        };
      }
    }
    
    // Format referrals for response
    const formattedReferrals = referrals.map(user => ({
      walletAddress: user.wallet_address,
      username: user.username,
      avatarUrl: user.avatar_url,
      chadScore: user.chad_score,
      totalSpins: user.total_spins,
      joinedAt: user.created_at
    }));
    
    // Calculate rewards
    const referralBonus = 50; // CHAD score per referral
    const totalReferralRewards = formattedReferrals.length * referralBonus;
    
    return NextResponse.json({
      referral: {
        code: userData.referral_code,
        referrer: referrer,
        referrals: formattedReferrals,
        totalReferrals: formattedReferrals.length,
        totalRewards: totalReferralRewards,
        rewardPerReferral: referralBonus,
        link: `https://chadempire.xyz/ref/${userData.referral_code}`
      }
    });
  } catch (error) {
    console.error('Error fetching referral information:', error);
    return NextResponse.json({ error: 'Failed to fetch referral information' }, { status: 500 });
  }
}

// Apply a referral code
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { referralCode } = body;
    
    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }
    
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Failed to initialize Supabase client');
    }
    
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, referred_by, referral_code, created_at')
      .eq('wallet_address', auth.walletAddress as string)
      .single() as { data: any, error: any };
      
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if user already has a referrer
    if (userData.referred_by) {
      return NextResponse.json({ error: 'You have already used a referral code' }, { status: 400 });
    }
    
    // Check if user is trying to use their own code
    if (userData.referral_code === referralCode) {
      return NextResponse.json({ error: 'You cannot use your own referral code' }, { status: 400 });
    }
    
    // Check if referral code exists
    const { data: referrer, error: referrerError } = await supabase
      .from('users')
      .select('id, chad_score')
      .eq('referral_code', referralCode)
      .single() as { data: any, error: any };
      
    if (referrerError || !referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
    }
    
    // Check if account is too old (e.g., more than 7 days)
    const createdAt = new Date(userData.created_at);
    const now = new Date();
    const daysSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation > 7) {
      return NextResponse.json({ 
        error: 'Referral codes can only be used within 7 days of account creation' 
      }, { status: 400 });
    }
    
    // Apply referral code - update user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        referred_by: referralCode,
        updated_at: now.toISOString()
      })
      .eq('id', userData.id);
      
    if (updateError) {
      throw updateError;
    }
    
    // Reward the referrer with CHAD score
    const referralBonus = 50;
    const { error: referrerUpdateError } = await supabase
      .from('users')
      .update({
        chad_score: referrer.chad_score + referralBonus,
        updated_at: now.toISOString()
      })
      .eq('id', referrer.id);
      
    if (referrerUpdateError) {
      throw referrerUpdateError;
    }
    
    // Create referral record
    const { error: recordError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_id: userData.id,
        bonus_amount: referralBonus,
        created_at: now.toISOString()
      });
      
    if (recordError) {
      throw recordError;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully',
      bonusAwarded: referralBonus
    });
  } catch (error) {
    console.error('Error applying referral code:', error);
    return NextResponse.json({ error: 'Failed to apply referral code' }, { status: 500 });
  }
}
