import { NextRequest } from 'next/server';
import { GET as getUserHandler } from '@/app/api/user/route';
import { PATCH as updateUserHandler } from '@/app/api/user/route';
import * as supabaseModule from '@/lib/supabase';
import { cookies } from 'next/headers';

// Mock the getSupabase function and cookies
jest.mock('@/lib/supabase', () => ({
  getSupabase: jest.fn(),
  getSupabaseAdmin: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('User API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/user', () => {
    it('should return user data for authenticated user', async () => {
      // Mock auth user
      const mockUser = {
        id: 'user-123',
        walletAddress: 'testWalletAddress',
        chadScore: 100,
        username: 'ChadTester',
      };

      // Mock Supabase auth
      const mockGetUser = jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock Supabase query
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const mockEq = jest.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
      });

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabaseModule.getSupabase as jest.Mock).mockReturnValue({
        auth: {
          getUser: mockGetUser,
        },
        from: mockFrom,
      });

      // Mock cookies
      (cookies as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'valid-token' }),
      });

      // Create mock request
      const req = new NextRequest('http://localhost:3000/api/user');

      // Call the API route handler
      const response = await getUserHandler(req);
      const responseData = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        id: 'user-123',
        walletAddress: 'testWalletAddress',
        chadScore: 100,
        username: 'ChadTester',
      });
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('wallet_address', 'testWalletAddress');
    });

    it('should return 401 for unauthenticated user', async () => {
      // Mock auth error
      (supabaseModule.getSupabase as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      });

      // Mock cookies
      (cookies as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      // Create mock request
      const req = new NextRequest('http://localhost:3000/api/user');

      // Call the API route handler
      const response = await getUserHandler(req);

      // Assertions
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/user', () => {
    it('should update user data for authenticated user', async () => {
      // Mock auth user
      const mockGetUser = jest.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock Supabase update
      const mockUpdate = jest.fn().mockResolvedValue({
        data: { username: 'NewChadName' },
        error: null,
      });

      const mockEq = jest.fn().mockReturnValue({
        update: mockUpdate,
      });

      const mockFrom = jest.fn().mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
      });

      (supabaseModule.getSupabase as jest.Mock).mockReturnValue({
        auth: {
          getUser: mockGetUser,
        },
        from: mockFrom,
      });

      // Mock cookies
      (cookies as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue({ value: 'valid-token' }),
      });

      // Create mock request
      const req = new NextRequest('http://localhost:3000/api/user', {
        method: 'PATCH',
        body: JSON.stringify({
          username: 'NewChadName',
        }),
      });

      // Call the API route handler
      const response = await updateUserHandler(req);
      const responseData = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(responseData).toEqual({ username: 'NewChadName' });
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockEq).toHaveBeenCalledWith('wallet_address', expect.any(String));
      expect(mockUpdate).toHaveBeenCalledWith({ username: 'NewChadName' });
    });

    it('should return 401 for unauthenticated user', async () => {
      // Mock auth error
      (supabaseModule.getSupabase as jest.Mock).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      });

      // Mock cookies
      (cookies as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      // Create mock request
      const req = new NextRequest('http://localhost:3000/api/user', {
        method: 'PATCH',
        body: JSON.stringify({
          username: 'NewChadName',
        }),
      });

      // Call the API route handler
      const response = await updateUserHandler(req);

      // Assertions
      expect(response.status).toBe(401);
    });
  });
});
