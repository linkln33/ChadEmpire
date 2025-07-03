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

// Get user's boosters and fragments
export async function GET(request: NextRequest) {
  const auth = verifyAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  
  try {
    // In a real app, fetch from database
    // For now, we'll return mock data
    
    // Mock boosters
    const mockBoosters = [
      {
        id: 'booster-1',
        mintAddress: `${Math.random().toString(36).substring(2, 15)}`,
        boosterType: 'yield_multiplier',
        powerLevel: 2,
        usedAt: null
      },
      {
        id: 'booster-2',
        mintAddress: `${Math.random().toString(36).substring(2, 15)}`,
        boosterType: 'luck_boost',
        powerLevel: 1,
        usedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        id: 'booster-3',
        mintAddress: `${Math.random().toString(36).substring(2, 15)}`,
        boosterType: 'bonus_spin',
        powerLevel: 1,
        usedAt: null
      }
    ];
    
    // Mock fragments
    const mockFragments = [
      {
        id: 'fragment-1',
        fragmentType: 'yield_multiplier',
        quantity: 3
      },
      {
        id: 'fragment-2',
        fragmentType: 'jackpot_access',
        quantity: 5
      }
    ];
    
    // Mock marketplace boosters
    const marketplaceBoosters = [
      {
        id: 'market-1',
        name: 'Yield Multiplier',
        description: 'Increases yield rewards by 1.5x for your next 5 spins',
        image: '/images/boosters/yield-multiplier.png',
        price: 250,
        rarity: 'rare',
        boosterType: 'yield_multiplier',
        powerLevel: 2,
      },
      {
        id: 'market-2',
        name: 'Lucky Charm',
        description: 'Increases your chance of winning yield by 15% for 24 hours',
        image: '/images/boosters/lucky-charm.png',
        price: 175,
        rarity: 'uncommon',
        boosterType: 'luck_boost',
        powerLevel: 1,
      },
      {
        id: 'market-3',
        name: 'Bonus Spin Token',
        description: 'Grants an extra free spin without consuming your daily spin',
        image: '/images/boosters/bonus-spin.png',
        price: 100,
        rarity: 'common',
        boosterType: 'bonus_spin',
        powerLevel: 1,
      },
      {
        id: 'market-4',
        name: 'Jackpot Enhancer',
        description: 'Doubles your chance of hitting the jackpot on your next 3 spins',
        image: '/images/boosters/jackpot-enhancer.png',
        price: 350,
        rarity: 'epic',
        boosterType: 'jackpot_access',
        powerLevel: 3,
      },
    ];
    
    return NextResponse.json({
      boosters: mockBoosters,
      fragments: mockFragments,
      marketplace: marketplaceBoosters
    });
  } catch (error) {
    console.error('Error fetching boosters:', error);
    return NextResponse.json({ error: 'Failed to fetch boosters' }, { status: 500 });
  }
}

// Use a booster
export async function POST(request: NextRequest) {
  const auth = verifyAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { boosterId, action } = body;
    
    if (!boosterId) {
      return NextResponse.json({ error: 'Booster ID is required' }, { status: 400 });
    }
    
    if (action !== 'use' && action !== 'purchase' && action !== 'mint') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    if (action === 'use') {
      // In a real app, verify the booster exists, belongs to the user, and hasn't been used
      
      // Mock response for using a booster
      return NextResponse.json({
        success: true,
        booster: {
          id: boosterId,
          usedAt: new Date(),
          effect: {
            type: 'yield_multiplier',
            multiplier: 1.5,
            duration: '5 spins'
          }
        },
        message: 'Booster activated successfully!'
      });
    } else if (action === 'purchase') {
      const { boosterType, price } = body;
      
      if (!boosterType || !price) {
        return NextResponse.json({ error: 'Booster type and price are required' }, { status: 400 });
      }
      
      // In a real app, verify the user has enough tokens and process the purchase
      
      // Generate a new booster
      const newBooster = {
        id: `booster-${uuidv4()}`,
        mintAddress: `${Math.random().toString(36).substring(2, 15)}`,
        boosterType,
        powerLevel: Math.min(Math.ceil(price / 100), 4), // Higher price = higher power level, max 4
        usedAt: null
      };
      
      return NextResponse.json({
        success: true,
        booster: newBooster,
        message: 'Booster purchased successfully!'
      });
    } else if (action === 'mint') {
      const { fragmentType, quantity } = body;
      
      if (!fragmentType || !quantity || quantity < 5) {
        return NextResponse.json({ 
          error: 'Fragment type and quantity (minimum 5) are required' 
        }, { status: 400 });
      }
      
      // In a real app, verify the user has enough fragments and process the minting
      
      // Generate a new booster based on fragment type
      const boosterTypes = ['yield_multiplier', 'luck_boost', 'bonus_spin', 'jackpot_access'];
      const randomType = fragmentType.includes('yield') 
        ? 'yield_multiplier' 
        : fragmentType.includes('luck') 
          ? 'luck_boost' 
          : fragmentType.includes('spin') 
            ? 'bonus_spin' 
            : fragmentType.includes('jackpot') 
              ? 'jackpot_access' 
              : boosterTypes[Math.floor(Math.random() * boosterTypes.length)];
      
      // Determine power level (more common fragments = lower power)
      const powerLevel = Math.min(Math.max(1, Math.ceil(Math.random() * 3)), 3);
      
      // Create new booster
      const newBooster = {
        id: `booster-${uuidv4()}`,
        mintAddress: `${Math.random().toString(36).substring(2, 15)}`,
        boosterType: randomType,
        powerLevel,
        usedAt: null
      };
      
      return NextResponse.json({
        success: true,
        booster: newBooster,
        fragmentsUsed: 5,
        remainingFragments: quantity - 5,
        message: 'Booster minted successfully!'
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing booster action:', error);
    return NextResponse.json({ error: 'Failed to process booster action' }, { status: 500 });
  }
}
