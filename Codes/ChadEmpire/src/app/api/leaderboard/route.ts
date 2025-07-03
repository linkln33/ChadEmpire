import { NextRequest, NextResponse } from 'next/server';

// Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    const sortBy = request.nextUrl.searchParams.get('sortBy') || 'chad_score';
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10);
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);
    
    // In a real app, fetch leaderboard data from database
    // For now, we'll generate mock data
    const mockLeaderboard = Array.from({ length: 50 }, (_, i) => ({
      walletAddress: `${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
      username: i < 10 ? `ChadLegend${i + 1}` : undefined,
      avatarUrl: i < 5 ? `https://api.dicebear.com/7.x/personas/svg?seed=${i}` : undefined,
      chadScore: Math.floor(10000 / (i + 1)) + Math.floor(Math.random() * 100),
      totalSpins: Math.floor(500 / (i + 1)) + Math.floor(Math.random() * 20),
      totalWins: Math.floor(300 / (i + 1)) + Math.floor(Math.random() * 10),
      totalYieldEarned: Math.floor(5000 / (i + 1)) + Math.floor(Math.random() * 100),
    }));
    
    // Sort based on requested sort field
    let sortedLeaderboard = [...mockLeaderboard];
    if (sortBy === 'yield') {
      sortedLeaderboard.sort((a, b) => b.totalYieldEarned - a.totalYieldEarned);
    } else if (sortBy === 'spins') {
      sortedLeaderboard.sort((a, b) => b.totalSpins - a.totalSpins);
    } else {
      sortedLeaderboard.sort((a, b) => b.chadScore - a.chadScore);
    }
    
    // Add rank after sorting
    sortedLeaderboard = sortedLeaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
    
    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLeaderboard = sortedLeaderboard.slice(startIndex, endIndex);
    
    // Get system stats for context
    const systemStats = {
      totalUsers: 1247,
      totalStaked: 2500000,
      totalSpins: 18645,
      totalYieldPaid: 42680,
      lotteryPool: 5750,
      nextLotteryDraw: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    };
    
    return NextResponse.json({
      leaderboard: paginatedLeaderboard,
      pagination: {
        total: sortedLeaderboard.length,
        page,
        limit,
        pages: Math.ceil(sortedLeaderboard.length / limit)
      },
      systemStats
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
  }
}
