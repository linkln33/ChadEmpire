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

// Get user's spin history
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
    
    // Get spin history for this user
    const { data: spins, error: spinsError } = await supabase
      .from('spins')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(20) as { data: any[], error: any };
      
    if (spinsError) {
      throw spinsError;
    }
    
    // Transform snake_case to camelCase for frontend consumption
    const formattedSpins = spins.map(spin => ({
      id: spin.id,
      spinType: (spin.spin_type as string)?.toLowerCase() || 'daily',
      result: (spin.result as string)?.toLowerCase() || 'unknown',
      yieldPercentage: spin.yield_percentage,
      yieldAmount: spin.yield_amount,
      consolationType: (spin.consolation_type as string)?.toLowerCase(),
      consolationAmount: spin.consolation_amount,
      boosterUsed: spin.booster_used,
      transactionHash: spin.transaction_hash,
      createdAt: spin.created_at
    }));
    
    return NextResponse.json({ spins: formattedSpins });
  } catch (error) {
    console.error('Error fetching spin history:', error);
    return NextResponse.json({ error: 'Failed to fetch spin history' }, { status: 500 });
  }
}

// Execute a spin
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
    
    const body = await request.json();
    const { spinType = 'DAILY', boosterUsed, transactionHash } = body;
    
    // Get user data and stakes
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, chad_score, total_spins')
      .eq('wallet_address', auth.walletAddress as string)
      .single() as { data: any, error: any };
      
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if user has already spun today (for daily spins)
    if (spinType === 'DAILY') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todaySpins, error: spinsError } = await supabase
        .from('spins')
        .select('id')
        .eq('user_id', userData.id)
        .eq('spin_type', 'DAILY')
        .gte('created_at', today.toISOString())
        .limit(1) as { data: any[], error: any };
        
      if (spinsError) {
        throw spinsError;
      }
      
      if (todaySpins && todaySpins.length > 0) {
        return NextResponse.json({ 
          error: 'You have already used your daily spin today',
          nextSpinTime: new Date(new Date().setHours(24, 0, 0, 0))
        }, { status: 400 });
      }
    }
    
    // Get total stake amount
    const { data: stakes, error: stakesError } = await supabase
      .from('stakes')
      .select('amount')
      .eq('user_id', userData.id)
      .eq('status', 'ACTIVE') as { data: any[], error: any };
      
    if (stakesError) {
      throw stakesError;
    }
    
    const stakeAmount = stakes.reduce((total, stake) => total + Number(stake.amount), 0);
    
    if (stakeAmount < 100) {
      return NextResponse.json({ 
        error: 'Minimum stake of 100 $CHAD required to spin'
      }, { status: 400 });
    }
    
    // Apply any booster effects
    let boosterEffect = null;
    if (boosterUsed) {
      // Check if user has the booster
      const { data: booster, error: boosterError } = await supabase
        .from('boosters')
        .select('id, booster_type, power_level')
        .eq('id', boosterUsed)
        .eq('user_id', userData.id)
        .is('used_at', null)
        .single() as { data: any, error: any };
        
      if (!boosterError && booster) {
        // Apply booster effect based on type and power level
        if (booster.booster_type === 'YIELD_MULTIPLIER') {
          boosterEffect = {
            type: 'yield_multiplier',
            multiplier: 1 + (Number(booster.power_level) * 0.5) // Power level 1 = 1.5x, 2 = 2x, etc.
          };
        } else if (booster.booster_type === 'LUCK_BOOST') {
          // Increase win probability
          boosterEffect = {
            type: 'luck_boost',
            multiplier: 1 + (Number(booster.power_level) * 0.1) // Power level 1 = 1.1x, 2 = 1.2x, etc.
          };
        }
        
        // Mark booster as used
        await supabase
          .from('boosters')
          .update({ used_at: new Date().toISOString() })
          .eq('id', boosterUsed);
      }
    }
    
    // Generate spin result based on probabilities in whitepaper
    let winProbability = 0.6; // 60% chance to win yield
    
    // Apply luck boost if applicable
    if (boosterEffect && boosterEffect.type === 'luck_boost') {
      winProbability *= boosterEffect.multiplier;
      // Cap at 95% to always leave some chance of consolation
      winProbability = Math.min(winProbability, 0.95);
    }
    
    const isWin = Math.random() < winProbability;
    let spinData: any = {
      user_id: userData.id,
      spin_type: spinType,
      transaction_hash: transactionHash || null,
      booster_used: boosterUsed || null
    };
    
    let resultMessage = '';
    
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
      
      spinData.result = 'WIN';
      spinData.yield_percentage = yieldPercentage;
      spinData.yield_amount = yieldAmount;
      
      resultMessage = isJackpot 
        ? 'JACKPOT! Massive yield earned!' 
        : 'Congratulations! You won yield!';
        
      // Update user's total yield earned
      await supabase
        .from('users')
        .update({ 
          total_yield_earned: supabase.rpc('increment', { value: yieldAmount }) as any,
          total_wins: supabase.rpc('increment', { value: 1 }) as any,
          total_spins: supabase.rpc('increment', { value: 1 }) as any
        })
        .eq('id', userData.id);
        
      // Update system stats
      await supabase.rpc('increment_total_yield_paid', { amount_to_add: yieldAmount });
    } else {
      // Consolation prizes
      const consolationTypes = ['LOTTERY_TICKET', 'CHAD_SCORE', 'BOOSTER_FRAGMENT', 'BONUS_SPIN'];
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
      
      spinData.result = 'CONSOLATION';
      spinData.consolation_type = consolationType;
      
      switch (consolationType) {
        case 'LOTTERY_TICKET':
          spinData.consolation_amount = 1;
          resultMessage = 'You earned a lottery ticket for the weekly draw!';
          
          // Create a lottery ticket for the user
          const nextDrawQuery = await supabase
            .from('lottery_draws')
            .select('id')
            .eq('status', 'PENDING')
            .order('draw_time', { ascending: true })
            .limit(1) as { data: any[], error: any };
            
          if (nextDrawQuery.data && nextDrawQuery.data.length > 0) {
            const ticketNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            
            await supabase
              .from('lottery_tickets')
              .insert({
                user_id: userData.id,
                lottery_draw_id: nextDrawQuery.data[0].id,
                ticket_number: ticketNumber
              });
          }
          break;
          
        case 'CHAD_SCORE':
          consolationAmount = Math.floor(Math.random() * 50) + 10; // 10-60 points
          spinData.consolation_amount = consolationAmount;
          resultMessage = `Your Chad Score increased by ${consolationAmount} points!`;
          
          // Update user's chad score
          await supabase
            .from('users')
            .update({ 
              chad_score: supabase.rpc('increment', { value: consolationAmount }) as any,
              total_spins: supabase.rpc('increment', { value: 1 }) as any
            })
            .eq('id', userData.id);
          break;
          
        case 'BOOSTER_FRAGMENT':
          spinData.consolation_amount = 1;
          resultMessage = 'You collected a Booster Fragment! Collect 5 to mint a Booster NFT.';
          
          // Add fragment to user's collection
          const fragmentType = ['YIELD', 'LUCK', 'JACKPOT', 'BONUS'][Math.floor(Math.random() * 4)];
          
          const { data: existingFragment } = await supabase
            .from('fragments')
            .select('id, quantity')
            .eq('user_id', userData.id)
            .eq('fragment_type', fragmentType)
            .single() as { data: any };
            
          if (existingFragment) {
            await supabase
              .from('fragments')
              .update({ quantity: Number(existingFragment.quantity) + 1 })
              .eq('id', existingFragment.id);
          } else {
            await supabase
              .from('fragments')
              .insert({
                user_id: userData.id,
                fragment_type: fragmentType,
                quantity: 1
              });
          }
          
          // Check if user now has 5 fragments to mint a booster
          const { data: updatedFragment } = await supabase
            .from('fragments')
            .select('quantity')
            .eq('user_id', userData.id)
            .eq('fragment_type', fragmentType)
            .single() as { data: any };
            
          if (updatedFragment && Number(updatedFragment.quantity) >= 5) {
            // Create a new booster
            const boosterType = fragmentType === 'YIELD' ? 'YIELD_MULTIPLIER' :
                             fragmentType === 'LUCK' ? 'LUCK_BOOST' :
                             fragmentType === 'JACKPOT' ? 'JACKPOT_ACCESS' : 'BONUS_SPIN';
                             
            await supabase
              .from('boosters')
              .insert({
                user_id: userData.id,
                mint_address: `booster-${uuidv4()}`,
                booster_type: boosterType,
                power_level: 1
              });
              
            // Reset fragment count
            await supabase
              .from('fragments')
              .update({ quantity: Number(updatedFragment.quantity) - 5 })
              .eq('user_id', userData.id)
              .eq('fragment_type', fragmentType);
              
            resultMessage += ' You collected enough fragments to mint a new Booster NFT!';
          }
          break;
          
        case 'BONUS_SPIN':
          spinData.consolation_amount = 1;
          resultMessage = 'RARE REWARD! You earned a Bonus Spin token!';
          
          // Create a bonus spin token for the user
          await supabase
            .from('boosters')
            .insert({
              user_id: userData.id,
              mint_address: `bonus-spin-${uuidv4()}`,
              booster_type: 'BONUS_SPIN',
              power_level: 1
            });
          break;
      }
      
      // Update user's total spins
      if (consolationType !== 'CHAD_SCORE') { // Already updated for CHAD_SCORE
        await supabase
          .from('users')
          .update({ total_spins: supabase.rpc('increment', { value: 1 }) as any })
          .eq('id', userData.id);
      }
    }
    
    // Insert the spin record
    const { data: newSpin, error: spinError } = await supabase
      .from('spins')
      .insert(spinData)
      .select()
      .single() as { data: any, error: any };
      
    if (spinError) {
      throw spinError;
    }
    
    // Update system stats
    await supabase.rpc('increment_total_spins', { spins_to_add: 1 });
    
    // Format the response
    const formattedSpin = {
      id: newSpin.id,
      spinType: (newSpin.spin_type as string)?.toLowerCase() || 'daily',
      result: (newSpin.result as string)?.toLowerCase() || 'unknown',
      yieldPercentage: newSpin.yield_percentage,
      yieldAmount: newSpin.yield_amount,
      consolationType: (newSpin.consolation_type as string)?.toLowerCase(),
      consolationAmount: newSpin.consolation_amount,
      boosterUsed: newSpin.booster_used,
      transactionHash: newSpin.transaction_hash,
      createdAt: newSpin.created_at,
      message: resultMessage
    };
    
    return NextResponse.json({
      success: true,
      spin: formattedSpin,
      nextSpinTime: spinType === 'DAILY' 
        ? new Date(new Date().setHours(24, 0, 0, 0))
        : null
    });
  } catch (error) {
    console.error('Error processing spin:', error);
    return NextResponse.json({ error: 'Failed to process spin' }, { status: 500 });
  }
}
