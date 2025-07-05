import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

// Get current user data
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
    
    // Query user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', auth.walletAddress as string)
      .single() as { data: any, error: any };
    
    if (error) {
      throw error;
    }
    
    if (!user) {
      // Create new user if not found
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          wallet_address: auth.walletAddress as string,
          username: 'ChadLegend',
          avatar_url: `https://api.dicebear.com/7.x/personas/svg?seed=${auth.walletAddress as string}`,
          chad_score: 0,
          total_spins: 0,
          total_wins: 0,
          total_yield_earned: 0,
          referral_code: 'CHAD' + (auth.walletAddress as string).substring(0, 8),
        })
        .select()
        .single();
        
      if (createError) {
        throw createError;
      }
      
      return NextResponse.json({ 
        user: {
          id: newUser.id,
          walletAddress: newUser.wallet_address,
          username: newUser.username,
          avatarUrl: newUser.avatar_url,
          chadScore: newUser.chad_score,
          totalSpins: newUser.total_spins,
          totalWins: newUser.total_wins,
          totalYieldEarned: newUser.total_yield_earned,
          referralCode: newUser.referral_code,
          referredBy: newUser.referred_by,
          createdAt: newUser.created_at
        }
      });
    }
    
    // Transform to camelCase for client
    return NextResponse.json({ 
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        username: user.username,
        avatarUrl: user.avatar_url,
        chadScore: user.chad_score,
        totalSpins: user.total_spins,
        totalWins: user.total_wins,
        totalYieldEarned: user.total_yield_earned,
        referralCode: user.referral_code,
        referredBy: user.referred_by,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  const auth = await verifyAuth(request);
  
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
    
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Failed to initialize Supabase client');
    }
    
    // Update user in Supabase
    const updateData: Record<string, any> = {};
    if (username) updateData.username = username;
    if (avatarUrl) updateData.avatar_url = avatarUrl;
    
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('wallet_address', auth.walletAddress as string)
      .select()
      .single() as { data: any, error: any };
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: updatedUser.id,
        walletAddress: updatedUser.wallet_address,
        username: updatedUser.username,
        avatarUrl: updatedUser.avatar_url,
        chadScore: updatedUser.chad_score,
        totalSpins: updatedUser.total_spins,
        totalWins: updatedUser.total_wins,
        totalYieldEarned: updatedUser.total_yield_earned,
        referralCode: updatedUser.referral_code,
        referredBy: updatedUser.referred_by,
        createdAt: updatedUser.created_at
      }
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
