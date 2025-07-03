import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Middleware to verify authentication
const verifyAuth = (request: NextRequest) => {
  const token = cookies().get('chadempire_auth')?.value;
  
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
  const auth = verifyAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  
  try {
    // In a real app, fetch stake data from database or blockchain
    // For now, we'll return mock data
    const mockStakes = [
      {
        id: 'stake-1',
        amount: 1000,
        stakedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        penaltyAmount: 0,
        status: 'active'
      }
    ];
    
    return NextResponse.json({ stakes: mockStakes });
  } catch (error) {
    console.error('Error fetching stakes:', error);
    return NextResponse.json({ error: 'Failed to fetch stake information' }, { status: 500 });
  }
}

// Create a new stake
export async function POST(request: NextRequest) {
  const auth = verifyAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { amount } = body;
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid stake amount is required' }, { status: 400 });
    }
    
    // In a real app, verify the user has enough tokens and create the stake on-chain
    // For now, we'll just return a mock response
    
    const newStake = {
      id: `stake-${uuidv4()}`,
      amount: Number(amount),
      stakedAt: new Date(),
      penaltyAmount: 0,
      status: 'active' as const
    };
    
    return NextResponse.json({ 
      success: true,
      stake: newStake
    });
  } catch (error) {
    console.error('Error creating stake:', error);
    return NextResponse.json({ error: 'Failed to create stake' }, { status: 500 });
  }
}

// Update an existing stake (for unstaking)
export async function PUT(request: NextRequest) {
  const auth = verifyAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { stakeId, action, amount } = body;
    
    if (!stakeId) {
      return NextResponse.json({ error: 'Stake ID is required' }, { status: 400 });
    }
    
    if (action !== 'unstake') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid unstake amount is required' }, { status: 400 });
    }
    
    // In a real app, verify the stake exists and belongs to the user
    // Then process the unstaking on-chain
    
    // Calculate penalty based on staking duration
    // For demo purposes, we'll use a fixed penalty
    const penaltyPercentage = 25; // 25%
    const penaltyAmount = Number(amount) * (penaltyPercentage / 100);
    const receiveAmount = Number(amount) - penaltyAmount;
    
    return NextResponse.json({
      success: true,
      unstake: {
        stakeId,
        amount: Number(amount),
        penaltyPercentage,
        penaltyAmount,
        receiveAmount,
        processedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error processing unstake:', error);
    return NextResponse.json({ error: 'Failed to process unstake' }, { status: 500 });
  }
}
