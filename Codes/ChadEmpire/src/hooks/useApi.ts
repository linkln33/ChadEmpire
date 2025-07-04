import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { useCallback } from 'react';

// Define base fetcher with error handling
const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.message = await response.text();
    throw error;
  }
  
  return response.json();
};

// Generic API hook with SWR
export function useApi<Data = any, Error = any>(
  url: string | null,
  options?: SWRConfiguration
): SWRResponse<Data, Error> {
  return useSWR<Data, Error>(url, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    ...options,
  });
}

// User data hook
export function useUser(options?: SWRConfiguration) {
  return useApi('/api/user', options);
}

// Stake data hook
export function useStakes(options?: SWRConfiguration) {
  return useApi('/api/stake', options);
}

// Spin history hook
export function useSpinHistory(options?: SWRConfiguration) {
  return useApi('/api/spin/history', options);
}

// Boosters hook
export function useBoosters(options?: SWRConfiguration) {
  return useApi('/api/boosters', options);
}

// Leaderboard hook
export function useLeaderboard(options?: SWRConfiguration) {
  return useApi('/api/leaderboard', options);
}

// Yield data hook
export function useYield(options?: SWRConfiguration) {
  return useApi('/api/yield', options);
}

// Lottery hook
export function useLottery(options?: SWRConfiguration) {
  return useApi('/api/lottery', options);
}

// Mutation function for POST/PUT/PATCH/DELETE requests
export function useMutation<Data = any, Error = any>(url: string) {
  const execute = useCallback(
    async (
      data?: any,
      options?: {
        method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        headers?: Record<string, string>;
      }
    ): Promise<Data> => {
      const response = await fetch(url, {
        method: options?.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = new Error('An error occurred while making the request.');
        error.message = await response.text();
        throw error;
      }

      return response.json();
    },
    [url]
  );

  return { execute };
}

// Optimistic update helper
export function optimisticMutation<Data = any, Error = any>(
  url: string,
  updateFn: (oldData: Data | undefined) => Data
) {
  const { data, mutate } = useApi<Data, Error>(url);
  
  const execute = useCallback(
    async (requestData: any, options?: { method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE' }) => {
      // Optimistically update the local data
      await mutate(updateFn(data), false);
      
      try {
        // Make the actual request
        const response = await fetch(url, {
          method: options?.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error('Failed to update data');
        }

        const responseData = await response.json();
        
        // Update with the actual response data
        await mutate(responseData, false);
        
        return responseData;
      } catch (error) {
        // If there's an error, roll back to the original data
        await mutate(data, false);
        throw error;
      }
    },
    [url, data, mutate, updateFn]
  );

  return { data, execute };
}
