import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type TableName = keyof Database['public']['Tables'];
type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeSubscriptionOptions<T> {
  table: TableName;
  event?: RealtimeEvent;
  filter?: string;
  initialData?: T[];
  onInsert?: (payload: { new: T }) => void;
  onUpdate?: (payload: { new: T; old: T }) => void;
  onDelete?: (payload: { old: T }) => void;
}

/**
 * Hook for subscribing to Supabase realtime updates
 */
export function useRealtimeSubscription<T = any>({
  table,
  event = '*',
  filter,
  initialData = [],
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeSubscriptionOptions<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    let channel: RealtimeChannel;
    
    const setupSubscription = async () => {
      try {
        setLoading(true);
        
        // Fetch initial data if not provided
        if (initialData.length === 0) {
          const { data: initialFetchData, error: fetchError } = await supabase
            .from(table)
            .select('*');
            
          if (fetchError) {
            throw new Error(fetchError.message);
          }
          
          setData(initialFetchData as T[]);
        }
        
        // Set up realtime subscription
        channel = supabase
          .channel(`public:${table}`)
          .on(
            'postgres_changes',
            { 
              event, 
              schema: 'public', 
              table,
              ...(filter ? { filter } : {})
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setData((currentData) => [...currentData, payload.new as T]);
                onInsert?.({ new: payload.new as T });
              } else if (payload.eventType === 'UPDATE') {
                setData((currentData) =>
                  currentData.map((item) =>
                    // @ts-ignore - we don't know the shape of T
                    item.id === payload.new.id ? (payload.new as T) : item
                  )
                );
                onUpdate?.({ new: payload.new as T, old: payload.old as T });
              } else if (payload.eventType === 'DELETE') {
                setData((currentData) =>
                  currentData.filter(
                    // @ts-ignore - we don't know the shape of T
                    (item) => item.id !== payload.old.id
                  )
                );
                onDelete?.({ old: payload.old as T });
              }
            }
          )
          .subscribe();
          
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    };

    setupSubscription();

    return () => {
      // Clean up subscription on unmount
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, event, filter, initialData, onInsert, onUpdate, onDelete]);

  return { data, loading, error };
}

/**
 * Hook for subscribing to leaderboard updates
 */
export function useRealtimeLeaderboard(limit: number = 10) {
  return useRealtimeSubscription<{
    id: string;
    wallet_address: string;
    username: string | null;
    chad_score: number;
  }>({
    table: 'users',
    event: 'UPDATE',
    initialData: [],
  });
}

/**
 * Hook for subscribing to spin updates for a specific user
 */
export function useRealtimeSpins(walletAddress: string | null) {
  return useRealtimeSubscription<{
    id: string;
    user_id: string;
    result: string;
    amount: number;
    created_at: string;
  }>({
    table: 'spins',
    event: 'INSERT',
    filter: walletAddress ? `user_id=eq.${walletAddress}` : undefined,
    initialData: [],
  });
}

/**
 * Hook for subscribing to lottery updates
 */
export function useRealtimeLottery() {
  return useRealtimeSubscription<{
    id: string;
    prize_pool: number;
    start_time: string;
    end_time: string;
    winner_id: string | null;
  }>({
    table: 'lotteries',
    event: '*',
    initialData: [],
  });
}
