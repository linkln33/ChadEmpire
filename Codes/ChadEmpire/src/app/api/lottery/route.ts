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

// Get lottery information and user's tickets
export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    const includeUserTickets = request.nextUrl.searchParams.get('includeUserTickets') === 'true';
    
    // Get current lottery information
    const currentLottery = {
      id: 'lottery-13',
      jackpot: 5750,
      ticketsSold: 1245,
      drawTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      ticketPrice: 10 // in $CHAD tokens
    };
    
    // Get past draws
    const pastDraws = [
      {
        id: 'lottery-12',
        date: '2025-06-26',
        jackpot: 4250,
        winningNumbers: '8-14-22-37-41-59',
        winners: 2,
      },
      {
        id: 'lottery-11',
        date: '2025-06-19',
        jackpot: 3750,
        winningNumbers: '3-7-19-24-33-58',
        winners: 1,
      },
      {
        id: 'lottery-10',
        date: '2025-06-12',
        jackpot: 5120,
        winningNumbers: '11-17-23-29-45-52',
        winners: 3,
      },
    ];
    
    // Get user's tickets if authenticated and requested
    let userTickets = [];
    if (auth.authenticated && includeUserTickets) {
      // In a real app, fetch from database
      userTickets = [
        {
          id: `ticket-${uuidv4()}`,
          ticketNumber: '12-24-31-42-53-60',
          lotteryDrawId: 'lottery-13',
          isWinner: false
        },
        {
          id: `ticket-${uuidv4()}`,
          ticketNumber: '7-15-22-36-48-59',
          lotteryDrawId: 'lottery-13',
          isWinner: false
        }
      ];
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
  const auth = verifyAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { quantity } = body;
    
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      return NextResponse.json({ error: 'Valid ticket quantity is required' }, { status: 400 });
    }
    
    const ticketPrice = 10; // $CHAD per ticket
    const totalCost = Number(quantity) * ticketPrice;
    
    // In a real app, verify the user has enough tokens and process the purchase
    
    // Generate ticket numbers
    const tickets = Array.from({ length: Number(quantity) }, () => {
      // Generate 6 unique random numbers between 1-60
      const numbers = new Set<number>();
      while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 60) + 1);
      }
      
      // Sort numbers and format as string
      const ticketNumber = Array.from(numbers).sort((a, b) => a - b).join('-');
      
      return {
        id: `ticket-${uuidv4()}`,
        ticketNumber,
        lotteryDrawId: 'lottery-13',
        isWinner: false
      };
    });
    
    return NextResponse.json({
      success: true,
      tickets,
      totalCost,
      message: `Successfully purchased ${quantity} lottery ticket${Number(quantity) > 1 ? 's' : ''}`
    });
  } catch (error) {
    console.error('Error purchasing tickets:', error);
    return NextResponse.json({ error: 'Failed to purchase tickets' }, { status: 500 });
  }
}
