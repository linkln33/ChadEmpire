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

// Get yield information for the user
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
    
    // First get the user ID from the wallet address
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, total_yield_earned, chad_score')
      .eq('wallet_address', auth.walletAddress as string)
      .single() as { data: any, error: any };
      
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get all active stakes for this user
    const { data: stakes, error: stakesError } = await supabase
      .from('stakes')
      .select('id, amount, staked_at')
      .eq('user_id', userData.id)
      .eq('status', 'ACTIVE') as { data: any[], error: any };
      
    if (stakesError) {
      throw stakesError;
    }
    
    // Calculate yield for each stake
    const now = new Date();
    const yieldRate = 0.0001; // 0.01% per day
    const yieldInfo = stakes.map(stake => {
      const stakedAt = new Date(stake.staked_at);
      const daysSinceStake = Math.floor((now.getTime() - stakedAt.getTime()) / (1000 * 60 * 60 * 24));
      const accruedYield = stake.amount * yieldRate * daysSinceStake;
      
      return {
        stakeId: stake.id,
        stakedAmount: stake.amount,
        stakedAt: stake.staked_at,
        daysSinceStake,
        accruedYield: parseFloat(accruedYield.toFixed(4)),
      };
    });
    
    // Calculate total yield
    const totalAccruedYield = yieldInfo.reduce((sum, stake) => sum + stake.accruedYield, 0);
    const totalClaimedYield = userData.total_yield_earned || 0;
    
    return NextResponse.json({
      yield: {
        stakes: yieldInfo,
        totalAccruedYield,
        totalClaimedYield,
        availableToClaim: parseFloat(totalAccruedYield.toFixed(4)),
        yieldRate: `${(yieldRate * 100).toFixed(2)}% per day`,
      }
    });
  } catch (error) {
    console.error('Error fetching yield information:', error);
    return NextResponse.json({ error: 'Failed to fetch yield information' }, { status: 500 });
  }
}

// Claim yield
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  
  try {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Failed to initialize Supabase client');
    }
    
    // First get the user ID from the wallet address
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, total_yield_earned, chad_score')
      .eq('wallet_address', auth.walletAddress as string)
      .single() as { data: any, error: any };
      
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get all active stakes for this user
    const { data: stakes, error: stakesError } = await supabase
      .from('stakes')
      .select('id, amount, staked_at')
      .eq('user_id', userData.id)
      .eq('status', 'ACTIVE') as { data: any[], error: any };
      
    if (stakesError) {
      throw stakesError;
    }
    
    // Calculate yield for each stake
    const now = new Date();
    const yieldRate = 0.0001; // 0.01% per day
    let totalYieldToClaim = 0;
    
    stakes.forEach(stake => {
      const stakedAt = new Date(stake.staked_at);
      const daysSinceStake = Math.floor((now.getTime() - stakedAt.getTime()) / (1000 * 60 * 60 * 24));
      const accruedYield = stake.amount * yieldRate * daysSinceStake;
      totalYieldToClaim += accruedYield;
    });
    
    // Round to 4 decimal places
    totalYieldToClaim = parseFloat(totalYieldToClaim.toFixed(4));
    
    if (totalYieldToClaim <= 0) {
      return NextResponse.json({ error: 'No yield available to claim' }, { status: 400 });
    }
    
    // Update user's total yield earned and CHAD score
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        total_yield_earned: (userData.total_yield_earned || 0) + totalYieldToClaim,
        chad_score: (userData.chad_score || 0) + totalYieldToClaim,
        updated_at: now.toISOString()
      })
      .eq('id', userData.id)
      .select('total_yield_earned, chad_score')
      .single() as { data: any, error: any };
      
    if (updateError) {
      throw updateError;
    }
    
    // Update system stats
    await supabase.rpc('increment_total_yield_paid', { amount_to_add: totalYieldToClaim });
    
    // Create a yield claim record
    const { error: claimError } = await supabase
      .from('yield_claims')
      .insert({
        user_id: userData.id,
        amount: totalYieldToClaim,
        claimed_at: now.toISOString()
      });
      
    if (claimError) {
      throw claimError;
    }
    
    // Update stake last yield claim dates
    const stakeUpdates = stakes.map(stake => ({
      id: stake.id,
      last_yield_claim: now.toISOString()
    }));
    
    const { error: stakeUpdateError } = await supabase
      .from('stakes')
      .upsert(stakeUpdates);
      
    if (stakeUpdateError) {
      throw stakeUpdateError;
    }
    
    return NextResponse.json({
      success: true,
      claimed: {
        amount: totalYieldToClaim,
        timestamp: now.toISOString(),
        newTotalYield: updatedUser.total_yield_earned,
        newChadScore: updatedUser.chad_score
      }
    });
  } catch (error) {
    console.error('Error claiming yield:', error);
    return NextResponse.json({ error: 'Failed to claim yield' }, { status: 500 });
  }
}
