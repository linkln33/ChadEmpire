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

// Get lottery information and user's tickets
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    const includeUserTickets = request.nextUrl.searchParams.get('includeUserTickets') === 'true';
    
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Failed to initialize Supabase client');
    }
    
    // Get current lottery draw (the one with the latest draw_time that hasn't been drawn yet)
    const { data: currentLotteryData, error: currentLotteryError } = await supabase
      .from('lottery_draws')
      .select('*')
      .gt('draw_time', new Date().toISOString())
      .order('draw_time', { ascending: true })
      .limit(1)
      .single() as { data: any, error: any };
      
    if (currentLotteryError) {
      throw currentLotteryError;
    }
    
    // If no upcoming lottery was found, create one
    let currentLottery;
    if (!currentLotteryData) {
      // Set draw time to 7 days from now
      const drawTime = new Date();
      drawTime.setDate(drawTime.getDate() + 7);
      
      const { data: newLottery, error: createError } = await supabase
        .from('lottery_draws')
        .insert({
          jackpot: 1000, // Starting jackpot
          tickets_sold: 0,
          draw_time: drawTime.toISOString(),
          ticket_price: 10, // in $CHAD tokens
          is_drawn: false
        })
        .select()
        .single() as { data: any, error: any };
        
      if (createError) {
        throw createError;
      }
      
      currentLottery = {
        id: newLottery.id,
        jackpot: newLottery.jackpot,
        ticketsSold: newLottery.tickets_sold,
        drawTime: newLottery.draw_time,
        ticketPrice: newLottery.ticket_price
      };
    } else {
      currentLottery = {
        id: currentLotteryData.id,
        jackpot: currentLotteryData.jackpot,
        ticketsSold: currentLotteryData.tickets_sold,
        drawTime: currentLotteryData.draw_time,
        ticketPrice: currentLotteryData.ticket_price
      };
    }
    
    // Get past draws (already drawn)
    const { data: pastDrawsData, error: pastDrawsError } = await supabase
      .from('lottery_draws')
      .select('*')
      .eq('is_drawn', true)
      .order('draw_time', { ascending: false })
      .limit(10) as { data: any[], error: any };
      
    if (pastDrawsError) {
      throw pastDrawsError;
    }
    
    const pastDraws = pastDrawsData.map(draw => ({
      id: draw.id,
      date: new Date(draw.draw_time).toISOString().split('T')[0],
      jackpot: draw.jackpot,
      winningNumbers: draw.winning_numbers || 'Not drawn yet',
      winners: draw.winners || 0
    }));
    
    // Get user's tickets if authenticated and requested
    let userTickets: Array<{id: string, ticketNumber: string, lotteryDrawId: string, isWinner: boolean}> = [];
    if (auth.authenticated && includeUserTickets) {
      // Get user ID from wallet address
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', auth.walletAddress as string)
        .single() as { data: any, error: any };
        
      if (!userError && userData) {
        // Fetch user's tickets for the current lottery
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('lottery_tickets')
          .select('*')
          .eq('user_id', userData.id)
          .eq('lottery_draw_id', currentLottery.id) as { data: any[], error: any };
          
        if (!ticketsError && ticketsData) {
          userTickets = ticketsData.map(ticket => ({
            id: ticket.id,
            ticketNumber: ticket.ticket_number,
            lotteryDrawId: ticket.lottery_draw_id,
            isWinner: ticket.is_winner || false
          }));
        }
      }
    }
    
    return NextResponse.json({
      currentLottery,
      pastDraws,
      userTickets: auth.authenticated && includeUserTickets ? userTickets : [],
      prizeDistribution: {
        match6: '50% of pool',
        match5: '25% of pool',
        match4: '15% of pool',
        match3: '10% of pool'
      }
    });
  } catch (error) {
    console.error('Error fetching lottery information:', error);
    return NextResponse.json({ error: 'Failed to fetch lottery information' }, { status: 500 });
  }
}

// Purchase lottery tickets
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
      .select('id, chad_score')
      .eq('wallet_address', auth.walletAddress as string)
      .single() as { data: any, error: any };
      
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const body = await request.json();
    const { quantity } = body;
    
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      return NextResponse.json({ error: 'Valid ticket quantity is required' }, { status: 400 });
    }
    
    // Get current lottery
    const { data: currentLotteryData, error: currentLotteryError } = await supabase
      .from('lottery_draws')
      .select('*')
      .gt('draw_time', new Date().toISOString())
      .order('draw_time', { ascending: true })
      .limit(1)
      .single() as { data: any, error: any };
      
    if (currentLotteryError || !currentLotteryData) {
      return NextResponse.json({ error: 'No active lottery found' }, { status: 404 });
    }
    
    const ticketPrice = currentLotteryData.ticket_price || 10; // $CHAD per ticket
    const totalCost = Number(quantity) * ticketPrice;
    
    // Verify the user has enough CHAD score
    if (Number(userData.chad_score) < totalCost) {
      return NextResponse.json({ 
        error: `Insufficient CHAD score. You need ${totalCost} but have ${userData.chad_score}` 
      }, { status: 400 });
    }
    
    // Deduct the cost from user's CHAD score
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        chad_score: supabase.rpc('decrement', { value: totalCost }) as any 
      })
      .eq('id', userData.id);
      
    if (updateError) {
      throw updateError;
    }
    
    // Update lottery jackpot and tickets sold
    const { error: lotteryUpdateError } = await supabase
      .from('lottery_draws')
      .update({ 
        jackpot: supabase.rpc('increment', { value: totalCost * 0.8 }) as any, // 80% of ticket sales go to jackpot
        tickets_sold: supabase.rpc('increment', { value: Number(quantity) }) as any 
      })
      .eq('id', currentLotteryData.id);
      
    if (lotteryUpdateError) {
      throw lotteryUpdateError;
    }
    
    // Generate and insert ticket records
    const ticketsToInsert = [];
    const ticketsForResponse = [];
    
    for (let i = 0; i < Number(quantity); i++) {
      // Generate 6 unique random numbers between 1-60
      const numbers = new Set<number>();
      while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 60) + 1);
      }
      
      // Sort numbers and format as string
      const ticketNumber = Array.from(numbers).sort((a, b) => a - b).join('-');
      
      const ticketId = uuidv4();
      
      ticketsToInsert.push({
        id: ticketId,
        user_id: userData.id,
        lottery_draw_id: currentLotteryData.id,
        ticket_number: ticketNumber,
        is_winner: false
      });
      
      ticketsForResponse.push({
        id: ticketId,
        ticketNumber,
        lotteryDrawId: currentLotteryData.id,
        isWinner: false
      });
    }
    
    // Insert tickets into database
    const { error: insertError } = await supabase
      .from('lottery_tickets')
      .insert(ticketsToInsert);
      
    if (insertError) {
      throw insertError;
    }
    
    return NextResponse.json({
      success: true,
      tickets: ticketsForResponse,
      totalCost,
      message: `Successfully purchased ${quantity} lottery ticket${Number(quantity) > 1 ? 's' : ''}`
    });
  } catch (error) {
    console.error('Error purchasing tickets:', error);
    return NextResponse.json({ error: 'Failed to purchase tickets' }, { status: 500 });
  }
}
