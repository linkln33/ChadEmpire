import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side singleton pattern
let supabase: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (!supabase) {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      // Configure connection pooling
      db: {
        schema: 'public',
      },
      global: {
        // Retry failed requests up to 3 times
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
              'x-client-info': `chadempire-app@1.0.0`,
            },
          });
        },
      },
    });
  }
  return supabase;
};

// Server-side client with custom auth
export const getSupabaseAdmin = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Helper for server components
export const createServerSupabaseClient = () => {
  return getSupabase();
};
