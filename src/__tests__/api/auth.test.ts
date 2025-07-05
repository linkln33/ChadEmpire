import { NextRequest } from 'next/server';
import { POST as handleNonce } from '@/app/api/auth/nonce/route';
import { POST as handleVerify } from '@/app/api/auth/verify/route';
import * as supabaseModule from '@/lib/supabase';

// Mock the getSupabase function
jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn(),
  getSupabaseAdmin: jest.fn(),
}));

describe('Auth API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/api/auth/nonce', () => {
    it('should generate a nonce for a valid wallet address', async () => {
      // Mock Supabase client
      const mockInsert = jest.fn().mockResolvedValue({ data: { nonce: '123456' }, error: null });
      const mockFrom = jest.fn().mockReturnValue({
        insert: mockInsert,
      });
      
      (supabaseModule.getSupabaseAdmin as jest.Mock).mockReturnValue({
        from: mockFrom,
      });

      // Create mock request
      const req = new NextRequest('http://localhost:3000/api/auth/nonce', {
        method: 'POST',
        body: JSON.stringify({ walletAddress: 'testWalletAddress' }),
      });

      // Call the API route handler
      const response = await handleNonce(req);
      const responseData = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(responseData).toHaveProperty('nonce');
      expect(mockFrom).toHaveBeenCalledWith('auth_nonces');
      expect(mockInsert).toHaveBeenCalledWith({
        wallet_address: 'testWalletAddress',
        nonce: expect.any(String),
        expires_at: expect.any(String),
      });
    });

    it('should return 400 for missing wallet address', async () => {
      // Create mock request with missing wallet address
      const req = new NextRequest('http://localhost:3000/api/auth/nonce', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      // Call the API route handler
      const response = await handleNonce(req);
      
      // Assertions
      expect(response.status).toBe(400);
    });
  });

  describe('/api/auth/verify', () => {
    it('should verify a valid signature and create a session', async () => {
      // Mock Supabase client for nonce retrieval
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { nonce: '123456', wallet_address: 'testWalletAddress' },
            error: null,
          }),
        }),
      });
      
      const mockDelete = jest.fn().mockResolvedValue({ error: null });
      const mockUpsert = jest.fn().mockResolvedValue({ error: null });
      
      const mockFrom = jest.fn().mockImplementation((table) => {
        if (table === 'auth_nonces') {
          return {
            select: mockSelect,
            delete: mockDelete,
          };
        }
        if (table === 'users') {
          return {
            upsert: mockUpsert,
          };
        }
        return {};
      });
      
      (supabaseModule.getSupabaseAdmin as jest.Mock).mockReturnValue({
        from: mockFrom,
      });

      // Mock signature verification (this would normally use tweetnacl)
      jest.mock('tweetnacl', () => ({
        sign: {
          detached: {
            verify: jest.fn().mockReturnValue(true),
          },
        },
      }));

      // Create mock request
      const req = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          walletAddress: 'testWalletAddress',
          signature: 'validSignature',
          nonce: '123456',
        }),
      });

      // Call the API route handler
      const response = await handleVerify(req);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(mockFrom).toHaveBeenCalledWith('auth_nonces');
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockDelete).toHaveBeenCalled();
      expect(mockUpsert).toHaveBeenCalledWith({
        wallet_address: 'testWalletAddress',
      }, { onConflict: 'wallet_address' });
    });

    it('should return 400 for missing parameters', async () => {
      // Create mock request with missing parameters
      const req = new NextRequest('http://localhost:3000/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      // Call the API route handler
      const response = await handleVerify(req);
      
      // Assertions
      expect(response.status).toBe(400);
    });
  });
});
