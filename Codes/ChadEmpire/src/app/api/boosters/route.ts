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

// Get user's boosters and fragments
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
    
    // Get user ID from wallet address
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', auth.walletAddress as string)
      .single() as { data: any, error: any };
      
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Fetch user's boosters
    const { data: boosters, error: boostersError } = await supabase
      .from('boosters')
      .select('*')
      .eq('user_id', userData.id) as { data: any[], error: any };
      
    if (boostersError) {
      throw boostersError;
    }
    
    // Fetch user's fragments
    const { data: fragments, error: fragmentsError } = await supabase
      .from('fragments')
      .select('*')
      .eq('user_id', userData.id) as { data: any[], error: any };
      
    if (fragmentsError) {
      throw fragmentsError;
    }
    
    // Define marketplace boosters (these are static and not stored in the database)
    const marketplaceBoosters = [
      {
        id: 'market-1',
        name: 'Yield Multiplier',
        description: 'Increases yield rewards by 1.5x for your next 5 spins',
        image: '/images/boosters/yield-multiplier.png',
        price: 250,
        rarity: 'rare',
        boosterType: 'YIELD_MULTIPLIER',
        powerLevel: 2,
      },
      {
        id: 'market-2',
        name: 'Lucky Charm',
        description: 'Increases your chance of winning yield by 15% for 24 hours',
        image: '/images/boosters/lucky-charm.png',
        price: 175,
        rarity: 'uncommon',
        boosterType: 'LUCK_BOOST',
        powerLevel: 1,
      },
      {
        id: 'market-3',
        name: 'Bonus Spin Token',
        description: 'Grants an extra free spin without consuming your daily spin',
        image: '/images/boosters/bonus-spin.png',
        price: 100,
        rarity: 'common',
        boosterType: 'BONUS_SPIN',
        powerLevel: 1,
      },
      {
        id: 'market-4',
        name: 'Jackpot Enhancer',
        description: 'Doubles your chance of hitting the jackpot on your next 3 spins',
        image: '/images/boosters/jackpot-enhancer.png',
        price: 350,
        rarity: 'epic',
        boosterType: 'JACKPOT_ACCESS',
        powerLevel: 3,
      },
    ];
    
    // Transform snake_case to camelCase for frontend consumption
    const formattedBoosters = boosters.map(booster => ({
      id: booster.id,
      mintAddress: booster.mint_address,
      boosterType: (booster.booster_type as string)?.toLowerCase(),
      powerLevel: booster.power_level,
      usedAt: booster.used_at
    }));
    
    const formattedFragments = fragments.map(fragment => ({
      id: fragment.id,
      fragmentType: (fragment.fragment_type as string)?.toLowerCase(),
      quantity: fragment.quantity
    }));
    
    return NextResponse.json({
      boosters: formattedBoosters,
      fragments: formattedFragments,
      marketplace: marketplaceBoosters
    });
  } catch (error) {
    console.error('Error fetching boosters:', error);
    return NextResponse.json({ error: 'Failed to fetch boosters' }, { status: 500 });
  }
}

// Use a booster
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
    
    // Get user ID from wallet address
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', auth.walletAddress as string)
      .single() as { data: any, error: any };
      
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const body = await request.json();
    const { boosterId, action } = body;
    
    if (!boosterId && action !== 'purchase') {
      return NextResponse.json({ error: 'Booster ID is required' }, { status: 400 });
    }
    
    if (action !== 'use' && action !== 'purchase' && action !== 'mint') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    if (action === 'use') {
      // Verify the booster exists, belongs to the user, and hasn't been used
      const { data: booster, error: boosterError } = await supabase
        .from('boosters')
        .select('*')
        .eq('id', boosterId)
        .eq('user_id', userData.id)
        .is('used_at', null)
        .single() as { data: any, error: any };
        
      if (boosterError || !booster) {
        return NextResponse.json({ 
          error: 'Booster not found or already used' 
        }, { status: 404 });
      }
      
      // Mark the booster as used
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('boosters')
        .update({ used_at: now })
        .eq('id', boosterId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Determine effect based on booster type
      let effect = {};
      
      if (booster.booster_type === 'YIELD_MULTIPLIER') {
        effect = {
          type: 'yield_multiplier',
          multiplier: 1 + (Number(booster.power_level) * 0.5), // Power level 1 = 1.5x, 2 = 2x, etc.
          duration: '5 spins'
        };
      } else if (booster.booster_type === 'LUCK_BOOST') {
        effect = {
          type: 'luck_boost',
          multiplier: 1 + (Number(booster.power_level) * 0.1), // Power level 1 = 1.1x, 2 = 1.2x, etc.
          duration: '24 hours'
        };
      } else if (booster.booster_type === 'JACKPOT_ACCESS') {
        effect = {
          type: 'jackpot_access',
          multiplier: 1 + (Number(booster.power_level) * 1.0), // Power level 1 = 2x, 2 = 3x, etc.
          duration: '3 spins'
        };
      } else if (booster.booster_type === 'BONUS_SPIN') {
        effect = {
          type: 'bonus_spin',
          spins: 1,
          duration: 'immediate'
        };
      }
      
      return NextResponse.json({
        success: true,
        booster: {
          id: booster.id,
          mintAddress: booster.mint_address,
          boosterType: (booster.booster_type as string)?.toLowerCase(),
          powerLevel: booster.power_level,
          usedAt: now,
          effect
        },
        message: 'Booster activated successfully!'
      });
    } else if (action === 'purchase') {
      const { boosterType, price } = body;
      
      if (!boosterType || !price) {
        return NextResponse.json({ error: 'Booster type and price are required' }, { status: 400 });
      }
      
      // Verify the user has enough tokens
      const { data: userStats, error: statsError } = await supabase
        .from('users')
        .select('chad_score')
        .eq('id', userData.id)
        .single() as { data: any, error: any };
        
      if (statsError || !userStats) {
        return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
      }
      
      if (Number(userStats.chad_score) < price) {
        return NextResponse.json({ 
          error: 'Insufficient CHAD score to purchase this booster' 
        }, { status: 400 });
      }
      
      // Deduct the price from user's CHAD score
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          chad_score: supabase.rpc('decrement', { value: price }) as any 
        })
        .eq('id', userData.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Create a new booster
      const powerLevel = Math.min(Math.ceil(price / 100), 4); // Higher price = higher power level, max 4
      
      const { data: newBooster, error: insertError } = await supabase
        .from('boosters')
        .insert({
          user_id: userData.id,
          mint_address: `booster-${uuidv4()}`,
          booster_type: boosterType.toUpperCase(),
          power_level: powerLevel,
          used_at: null
        })
        .select()
        .single() as { data: any, error: any };
        
      if (insertError) {
        throw insertError;
      }
      
      return NextResponse.json({
        success: true,
        booster: {
          id: newBooster.id,
          mintAddress: newBooster.mint_address,
          boosterType: (newBooster.booster_type as string)?.toLowerCase(),
          powerLevel: newBooster.power_level,
          usedAt: null
        },
        message: 'Booster purchased successfully!'
      });
    } else if (action === 'mint') {
      const { fragmentType, quantity } = body;
      
      if (!fragmentType || !quantity || quantity < 5) {
        return NextResponse.json({ 
          error: 'Fragment type and quantity (minimum 5) are required' 
        }, { status: 400 });
      }
      
      // Verify the user has enough fragments
      const { data: fragment, error: fragmentError } = await supabase
        .from('fragments')
        .select('*')
        .eq('user_id', userData.id)
        .eq('fragment_type', fragmentType.toUpperCase())
        .single() as { data: any, error: any };
        
      if (fragmentError || !fragment) {
        return NextResponse.json({ 
          error: 'Fragment type not found in your collection' 
        }, { status: 404 });
      }
      
      if (Number(fragment.quantity) < 5) {
        return NextResponse.json({ 
          error: `You need 5 fragments to mint a booster, but you only have ${fragment.quantity}` 
        }, { status: 400 });
      }
      
      // Map fragment type to booster type
      const fragmentToBoosterMap: Record<string, string> = {
        'YIELD': 'YIELD_MULTIPLIER',
        'LUCK': 'LUCK_BOOST',
        'JACKPOT': 'JACKPOT_ACCESS',
        'BONUS': 'BONUS_SPIN'
      };
      
      const boosterType = fragmentToBoosterMap[fragmentType.toUpperCase()] || 'YIELD_MULTIPLIER';
      
      // Determine power level (rarer fragments = higher power)
      const rarityMap: Record<string, number> = {
        'YIELD': 2,
        'LUCK': 1,
        'JACKPOT': 3,
        'BONUS': 1
      };
      
      const powerLevel = rarityMap[fragmentType.toUpperCase()] || 1;
      
      // Begin transaction
      // 1. Reduce fragment count
      const { error: updateError } = await supabase
        .from('fragments')
        .update({ quantity: Number(fragment.quantity) - 5 })
        .eq('id', fragment.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // 2. Create new booster
      const { data: newBooster, error: insertError } = await supabase
        .from('boosters')
        .insert({
          user_id: userData.id,
          mint_address: `booster-${uuidv4()}`,
          booster_type: boosterType,
          power_level: powerLevel,
          used_at: null
        })
        .select()
        .single() as { data: any, error: any };
        
      if (insertError) {
        throw insertError;
      }
      
      return NextResponse.json({
        success: true,
        booster: {
          id: newBooster.id,
          mintAddress: newBooster.mint_address,
          boosterType: (newBooster.booster_type as string)?.toLowerCase(),
          powerLevel: newBooster.power_level,
          usedAt: null
        },
        fragmentsUsed: 5,
        remainingFragments: Number(fragment.quantity) - 5,
        message: 'Booster minted successfully!'
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing booster action:', error);
    return NextResponse.json({ error: 'Failed to process booster action' }, { status: 500 });
  }
}
