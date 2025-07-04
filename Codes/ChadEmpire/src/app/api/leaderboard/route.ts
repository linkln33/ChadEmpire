import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Failed to initialize Supabase client');
    }
    
    const sortBy = request.nextUrl.searchParams.get('sortBy') || 'chad_score';
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10);
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    
    // Map frontend sort parameters to database column names
    const sortColumnMap: Record<string, string> = {
      'chad_score': 'chad_score',
      'yield': 'total_yield_earned',
      'spins': 'total_spins',
      'wins': 'total_wins'
    };
    
    const sortColumn = sortColumnMap[sortBy] || 'chad_score';
    const offset = (page - 1) * limit;
    
    // Count total users for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true }) as { count: number, error: any };
      
    if (countError) {
      throw countError;
    }
    
    // Get leaderboard data with pagination
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from('users')
      .select('id, wallet_address, username, avatar_url, chad_score, total_spins, total_wins, total_yield_earned')
      .order(sortColumn, { ascending: false })
      .range(offset, offset + limit - 1) as { data: any[], error: any };
      
    if (leaderboardError) {
      throw leaderboardError;
    }
    
    // Transform data for frontend consumption (snake_case to camelCase)
    const leaderboard = leaderboardData.map((user, index) => ({
      rank: offset + index + 1,
      walletAddress: user.wallet_address,
      username: user.username,
      avatarUrl: user.avatar_url,
      chadScore: user.chad_score,
      totalSpins: user.total_spins,
      totalWins: user.total_wins,
      totalYieldEarned: user.total_yield_earned
    }));
    
    // Get system stats
    const { data: statsData, error: statsError } = await supabase
      .from('system_stats')
      .select('*')
      .single() as { data: any, error: any };
      
    if (statsError) {
      throw statsError;
    }
    
    // Get current lottery for next draw time
    const { data: lotteryData, error: lotteryError } = await supabase
      .from('lottery_draws')
      .select('draw_time, jackpot')
      .gt('draw_time', new Date().toISOString())
      .order('draw_time', { ascending: true })
      .limit(1)
      .single() as { data: any, error: any };
    
    // Format system stats
    const systemStats = {
      totalUsers: totalCount || 0,
      totalStaked: statsData?.total_staked || 0,
      totalSpins: statsData?.total_spins || 0,
      totalYieldPaid: statsData?.total_yield_paid || 0,
      lotteryPool: lotteryData?.jackpot || 0,
      nextLotteryDraw: lotteryData?.draw_time || null
    };
    
    return NextResponse.json({
      leaderboard,
      pagination: {
        total: totalCount || 0,
        page,
        limit,
        pages: Math.ceil((totalCount || 0) / limit)
      },
      systemStats
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
  }
}
