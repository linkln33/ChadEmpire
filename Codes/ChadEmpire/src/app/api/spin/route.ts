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

// Get user's spin history
export async function GET(request: NextRequest) {
  const auth = verifyAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  
  try {
    // In a real app, fetch spin history from database
    // For now, we'll return mock data
    const mockSpins = [
      {
        id: 'spin-1',
        spinType: 'daily',
        result: 'win',
        yieldPercentage: 0.25,
        yieldAmount: 2.5,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        id: 'spin-2',
        spinType: 'daily',
        result: 'consolation',
        consolationType: 'lottery_ticket',
        consolationAmount: 1,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];
    
    return NextResponse.json({ spins: mockSpins });
  } catch (error) {
    console.error('Error fetching spin history:', error);
    return NextResponse.json({ error: 'Failed to fetch spin history' }, { status: 500 });
  }
}

// Execute a spin
export async function POST(request: NextRequest) {
  const auth = verifyAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { spinType = 'daily', boosterUsed } = body;
    
    // In a real app, verify the user has enough stake and hasn't already spun today
    // Also verify any boosters being used
    
    // Check if user has already spun today (for daily spins)
    if (spinType === 'daily') {
      // In a real app, check the database for the last spin
      const hasSpunToday = false; // Mock check
      
      if (hasSpunToday) {
        return NextResponse.json({ 
          error: 'You have already used your daily spin today',
          nextSpinTime: new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000)
        }, { status: 400 });
      }
    }
    
    // Verify stake amount (in a real app)
    const stakeAmount = 1000; // Mock stake amount
    
    if (stakeAmount < 100) {
      return NextResponse.json({ 
        error: 'Minimum stake of 100 $CHAD required to spin'
      }, { status: 400 });
    }
    
    // Apply any booster effects
    let boosterEffect = null;
    if (boosterUsed) {
      // In a real app, verify the booster exists and belongs to the user
      boosterEffect = {
        type: 'yield_multiplier',
        multiplier: 1.5
      };
    }
    
    // Generate spin result based on probabilities in whitepaper
    const isWin = Math.random() < 0.6; // 60% chance to win yield
    let result;
    
    if (isWin) {
      // 10% chance for jackpot (1-3% yield)
      const isJackpot = Math.random() < 0.1;
      
      let yieldPercentage = isJackpot 
        ? (Math.random() * 2 + 1) // 1-3%
        : (Math.random() * 0.4 + 0.1); // 0.1-0.5%
      
      // Apply booster effect if applicable
      if (boosterEffect && boosterEffect.type === 'yield_multiplier') {
        yieldPercentage *= boosterEffect.multiplier;
      }
      
      // Calculate yield amount based on stake
      const yieldAmount = stakeAmount * (yieldPercentage / 100);
      
      result = {
        type: 'win',
        yieldPercentage: yieldPercentage.toFixed(2),
        yieldAmount: yieldAmount.toFixed(2),
        message: isJackpot 
          ? 'JACKPOT! Massive yield earned!' 
          : 'Congratulations! You won yield!'
      };
    } else {
      // Consolation prizes
      const consolationTypes = ['lottery_ticket', 'chad_score', 'booster_fragment', 'bonus_spin'];
      const weights = [50, 30, 15, 5]; // Probabilities as per whitepaper
      
      // Weighted random selection
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let random = Math.random() * totalWeight;
      let selectedIndex = 0;
      
      for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          selectedIndex = i;
          break;
        }
      }
      
      const consolationType = consolationTypes[selectedIndex];
      let consolationAmount = 1;
      let message = '';
      
      switch (consolationType) {
        case 'lottery_ticket':
          message = 'You earned a lottery ticket for the weekly draw!';
          break;
        case 'chad_score':
          consolationAmount = Math.floor(Math.random() * 50) + 10; // 10-60 points
          message = `Your Chad Score increased by ${consolationAmount} points!`;
          break;
        case 'booster_fragment':
          message = 'You collected a Booster Fragment! Collect 5 to mint a Booster NFT.';
          break;
        case 'bonus_spin':
          message = 'RARE REWARD! You earned a Bonus Spin token!';
          break;
      }
      
      result = {
        type: 'consolation',
        consolationType,
        consolationAmount,
        message
      };
    }
    
    // In a real app, save the spin result to the database and update user stats
    
    // Create a record of the spin
    const spinRecord = {
      id: `spin-${uuidv4()}`,
      walletAddress: auth.walletAddress,
      spinType,
      boosterUsed,
      ...result,
      createdAt: new Date()
    };
    
    return NextResponse.json({
      success: true,
      spin: spinRecord,
      nextSpinTime: spinType === 'daily' 
        ? new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000)
        : null
    });
  } catch (error) {
    console.error('Error processing spin:', error);
    return NextResponse.json({ error: 'Failed to process spin' }, { status: 500 });
  }
}
