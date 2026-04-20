/**
 * React Query Configuration
 *
 * Configures stale times and cache settings for different data types:
 * - dynamic: Frequently changing data (cart, orders)
 * - semiStatic: Occasionally changing data (products, wishlist)
 * - static: Rarely changing data (categories, brands)
 */

export const QUERY_CONFIG = {
  // Data that changes frequently - user expects fresh data
  dynamic: {
    staleTime: 30 * 1000, // 30 seconds - data is fresh for 30s
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 min
    refetchOnWindowFocus: true, // Refetch when app gets focus
    refetchOnReconnect: true, // Refetch when network reconnects
  },

  // Data that changes occasionally - balance freshness with performance
  semiStatic: {
    staleTime: 2 * 60 * 1000, // 2 minutes - data is fresh for 2 min
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 min
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnReconnect: "always", // Refetch on reconnect if stale
  },

  // Data that rarely changes - optimize for performance
  static: {
    staleTime: 10 * 60 * 1000, // 10 minutes - data is fresh for 10 min
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 min
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Use cached data if available
    refetchOnReconnect: false, // Don't refetch on reconnect
  },

  // Search results - short-lived, user expects fresh results
  search: {
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  },

  // Single item detail views
  detail: {
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  },
} as const;

/**
 * Retry configuration for React Query
 * Uses exponential backoff with jitter
 */
export const RETRY_CONFIG = {
  maxRetries: 3,

  // Calculate delay with exponential backoff + jitter
  retryDelay: (failureCount: number): number => {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30 * 1000; // 30 seconds
    const jitter = Math.random() * 500; // Random 0-500ms

    // Exponential: 1s, 2s, 4s, 8s, 16s, 30s (capped)
    const delay = Math.min(baseDelay * Math.pow(2, failureCount) + jitter, maxDelay);

    return delay;
  },

  // Determine if retry should happen
  shouldRetry: (failureCount: number, error: unknown): boolean => {
    // Don't retry on client errors (4xx)
    if (error && typeof error === "object" && "response" in error) {
      const response = (error as any).response;
      const status = response?.status;
      if (status && status >= 400 && status < 500) {
        return false; // Client errors shouldn't be retried
      }
    }

    // Don't retry on specific errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("timeout") ||
        message.includes("abort") ||
        message.includes("cancel") ||
        message.includes("unauthorized")
      ) {
        return false;
      }
    }

    return failureCount < RETRY_CONFIG.maxRetries;
  },
};

export type QueryConfigType = typeof QUERY_CONFIG;
