import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

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

// Get current user data
export async function GET(request: NextRequest) {
  const auth = verifyAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  
  try {
    // In a real app, fetch user from database
    // For now, we'll return mock data
    const mockUser = {
      id: 'user-1',
      walletAddress: auth.walletAddress,
      username: 'ChadLegend',
      avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=1',
      chadScore: 1250,
      totalSpins: 42,
      totalWins: 25,
      totalYieldEarned: 350,
      referralCode: 'CHAD' + auth.walletAddress.substring(0, 8),
      referredBy: null,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    };
    
    return NextResponse.json({ user: mockUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  const auth = verifyAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { username, avatarUrl } = body;
    
    // Validate input
    if (username && (username.length < 3 || username.length > 20)) {
      return NextResponse.json({ 
        error: 'Username must be between 3 and 20 characters' 
      }, { status: 400 });
    }
    
    if (avatarUrl && !isValidUrl(avatarUrl)) {
      return NextResponse.json({ 
        error: 'Invalid avatar URL' 
      }, { status: 400 });
    }
    
    // In a real app, update user in database
    // For now, we'll return mock data
    const updatedUser = {
      id: 'user-1',
      walletAddress: auth.walletAddress,
      username: username || 'ChadLegend',
      avatarUrl: avatarUrl || 'https://api.dicebear.com/7.x/personas/svg?seed=1',
      chadScore: 1250,
      totalSpins: 42,
      totalWins: 25,
      totalYieldEarned: 350,
      referralCode: 'CHAD' + auth.walletAddress.substring(0, 8),
      referredBy: null,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    };
    
    return NextResponse.json({ 
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}

// Helper function to validate URL
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
