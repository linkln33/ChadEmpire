import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { getSupabase } from '@/lib/supabase';

// Middleware to verify authentication
const verifyAuth = async (request: NextRequest) => {
  const cookieStore = await cookies();
  const token = cookieStore.get('chadempire_auth')?.value;
  
  if (!token) {
    return { authenticated: false, error: 'Authentication required' };
  }
  
  // In a real app, verify the JWT token and extract the wallet address
  // For now, we'll mock this
  const walletAddress = token.split('_')[2];
  
  if (!walletAddress) {
    return { authenticated: false, error: 'Invalid authentication token' };
  }
  
  return { authenticated: true, walletAddress };
};

// Get user's stake information
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
      .select('id')
      .eq('wallet_address', auth.walletAddress as string)
      .single() as { data: any, error: any };
      
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get all stakes for this user
    const { data: stakes, error: stakesError } = await supabase
      .from('stakes')
      .select('*')
      .eq('user_id', userData.id) as { data: any[], error: any };
      
    if (stakesError) {
      throw stakesError;
    }
    
    // Transform snake_case to camelCase for frontend consumption
    const formattedStakes = stakes.map(stake => ({
      id: stake.id,
      amount: stake.amount,
      stakedAt: stake.staked_at,
      unstakeRequestedAt: stake.unstake_requested_at,
      unstakedAt: stake.unstaked_at,
      penaltyAmount: stake.penalty_amount,
      status: typeof stake.status === 'string' ? stake.status.toLowerCase() : 'unknown',
      transactionHash: stake.transaction_hash,
      createdAt: stake.created_at,
      updatedAt: stake.updated_at
    }));
    
    return NextResponse.json({ stakes: formattedStakes });
  } catch (error) {
    console.error('Error fetching stakes:', error);
    return NextResponse.json({ error: 'Failed to fetch stake information' }, { status: 500 });
  }
}

// Create a new stake
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { amount, transactionHash } = body;
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid stake amount is required' }, { status: 400 });
    }
    
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Failed to initialize Supabase client');
    }
    
    // First get the user ID from the wallet address
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', auth.walletAddress as string)
      .single() as { data: any, error: any };
      
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Create the new stake in the database
    const { data: newStake, error: stakeError } = await supabase
      .from('stakes')
      .insert({
        user_id: userData.id,
        amount: Number(amount),
        staked_at: new Date().toISOString(),
        status: 'ACTIVE',
        penalty_amount: 0,
        transaction_hash: transactionHash || null
      })
      .select()
      .single() as { data: any, error: any };
      
    if (stakeError) {
      throw stakeError;
    }
    
    // Update system stats
    await supabase.rpc('increment_total_staked', { amount_to_add: Number(amount) });
    
    // Transform snake_case to camelCase for frontend consumption
    const formattedStake = {
      id: newStake.id,
      amount: newStake.amount,
      stakedAt: newStake.staked_at,
      penaltyAmount: newStake.penalty_amount,
      status: typeof newStake.status === 'string' ? newStake.status.toLowerCase() : 'active',
      transactionHash: newStake.transaction_hash
    };
    
    return NextResponse.json({ 
      success: true,
      stake: formattedStake
    });
  } catch (error) {
    console.error('Error creating stake:', error);
    return NextResponse.json({ error: 'Failed to create stake' }, { status: 500 });
  }
}

// Update an existing stake (for unstaking)
export async function PUT(request: NextRequest) {
  const auth = await verifyAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { stakeId, action, amount, transactionHash } = body;
    
    if (!stakeId) {
      return NextResponse.json({ error: 'Stake ID is required' }, { status: 400 });
    }
    
    if (action !== 'unstake') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid unstake amount is required' }, { status: 400 });
    }
    
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Failed to initialize Supabase client');
    }
    
    // First get the user ID from the wallet address
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', auth.walletAddress as string)
      .single() as { data: any, error: any };
      
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get the stake to verify ownership and calculate penalty
    const { data: stakeData, error: stakeError } = await supabase
      .from('stakes')
      .select('*')
      .eq('id', stakeId)
      .eq('user_id', userData.id)
      .single() as { data: any, error: any };
      
    if (stakeError || !stakeData) {
      return NextResponse.json({ error: 'Stake not found or does not belong to user' }, { status: 404 });
    }
    
    if (stakeData.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Stake is not active and cannot be unstaked' }, { status: 400 });
    }
    
    if (Number(amount) > Number(stakeData.amount)) {
      return NextResponse.json({ error: 'Unstake amount exceeds staked amount' }, { status: 400 });
    }
    
    // Calculate penalty based on staking duration
    const stakingDuration = Date.now() - new Date(stakeData.staked_at as string).getTime();
    const stakingDurationDays = stakingDuration / (1000 * 60 * 60 * 24);
    
    // Penalty decreases over time
    let penaltyPercentage = 0;
    if (stakingDurationDays < 7) {
      penaltyPercentage = 25; // 25% penalty if unstaked within 7 days
    } else if (stakingDurationDays < 30) {
      penaltyPercentage = 10; // 10% penalty if unstaked within 30 days
    } else if (stakingDurationDays < 90) {
      penaltyPercentage = 5; // 5% penalty if unstaked within 90 days
    }
    
    const penaltyAmount = Number(amount) * (penaltyPercentage / 100);
    const receiveAmount = Number(amount) - penaltyAmount;
    
    // Update the stake in the database
    const now = new Date().toISOString();
    const { data: updatedStake, error: updateError } = await supabase
      .from('stakes')
      .update({
        amount: Number(stakeData.amount) - Number(amount),
        unstake_requested_at: now,
        unstaked_at: now,
        penalty_amount: penaltyAmount,
        status: Number(stakeData.amount) - Number(amount) > 0 ? 'ACTIVE' : 'UNSTAKED',
        transaction_hash: transactionHash || stakeData.transaction_hash,
        updated_at: now
      })
      .eq('id', stakeId)
      .select()
      .single() as { data: any, error: any };
      
    if (updateError) {
      throw updateError;
    }
    
    // Update system stats
    await supabase.rpc('decrement_total_staked', { amount_to_subtract: Number(amount) });
    
    return NextResponse.json({
      success: true,
      unstake: {
        stakeId,
        amount: Number(amount),
        penaltyPercentage,
        penaltyAmount,
        receiveAmount,
        processedAt: now,
        transactionHash
      }
    });
  } catch (error) {
    console.error('Error processing unstake:', error);
    return NextResponse.json({ error: 'Failed to process unstake' }, { status: 500 });
  }
}
