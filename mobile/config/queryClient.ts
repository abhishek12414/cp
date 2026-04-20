import { QueryClient, Query } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RETRY_CONFIG } from "./queryConfig";

/**
 * Create and configure the React Query client
 */
export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Use offline-first approach
        networkMode: "offlineFirst",

        // Global retry configuration
        retry: RETRY_CONFIG.shouldRetry,
        retryDelay: RETRY_CONFIG.retryDelay,

        // Default stale time (can be overridden per query)
        staleTime: 60 * 1000, // 1 minute default

        // Keep data in cache for 24 hours
        gcTime: 24 * 60 * 60 * 1000,

        // Refetch on window focus by default
        refetchOnWindowFocus: true,

        // Don't refetch on mount if data exists
        refetchOnMount: true,
      },
      mutations: {
        // Retry mutations only on network errors
        retry: (failureCount, error) => {
          // Check if it's a network error (no response)
          if (error && typeof error === "object" && "response" in error) {
            const response = (error as any).response;
            if (!response) {
              return failureCount < 2;
            }
          }
          return false;
        },
        retryDelay: RETRY_CONFIG.retryDelay,
        // Mutations need network - use offlineFirst but handle gracefully
        networkMode: "offlineFirst",
      },
    },
  });
};

// Storage key for persisted queries
const PERSISTENCE_KEY = "REACT_QUERY_OFFLINE_CACHE";

// Flag to track if persistence is available
let persistenceEnabled = false;

/**
 * Setup query persistence for offline support
 * Persists successful queries to AsyncStorage
 *
 * Note: This requires @tanstack/query-async-storage-persister and
 * @tanstack/react-query-persist-client packages to be installed.
 * If not installed, persistence will be gracefully skipped.
 */
export const setupQueryPersistence = async (queryClient: QueryClient): Promise<void> => {
  try {
    // Check if persistence packages are available
    const persisterPkg = require("@tanstack/query-async-storage-persister");
    const persistPkg = require("@tanstack/react-query-persist-client");

    if (!persisterPkg?.createAsyncStoragePersister || !persistPkg?.persistQueryClient) {
      console.warn(
        "[QueryClient] Persistence packages not fully available, skipping persistence setup"
      );
      return;
    }

    const asyncStoragePersister = persisterPkg.createAsyncStoragePersister({
      storage: AsyncStorage,
      key: PERSISTENCE_KEY,
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    });

    await persistPkg.persistQueryClient({
      queryClient,
      persister: asyncStoragePersister,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      dehydrateOptions: {
        shouldDehydrateQuery: (query: Query) => {
          if (query.state.status !== "success") {
            return false;
          }

          const queryKey = query.queryKey as string[];
          const hasSensitiveKey = queryKey.some(
            (key) =>
              typeof key === "string" &&
              (key.includes("auth") || key.includes("password") || key.includes("token"))
          );

          return !hasSensitiveKey;
        },
      },
    });

    persistenceEnabled = true;
    console.log("[QueryClient] Persistence setup complete");
  } catch (error: any) {
    // Gracefully handle missing packages - app will still work without persistence
    if (error?.code === "MODULE_NOT_FOUND") {
      console.warn(
        "[QueryClient] Persistence packages not installed. Install @tanstack/query-async-storage-persister and @tanstack/react-query-persist-client for offline support."
      );
    } else {
      console.warn("[QueryClient] Persistence setup failed:", error?.message || error);
    }
  }
};

/**
 * Check if persistence is enabled
 */
export const isPersistenceEnabled = (): boolean => persistenceEnabled;

/**
 * Clear persisted query cache
 */
export const clearPersistedCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PERSISTENCE_KEY);
    console.log("[QueryClient] Persisted cache cleared");
  } catch (error) {
    console.error("[QueryClient] Failed to clear persisted cache:", error);
  }
};

/**
 * Get cache size info
 */
export const getCacheInfo = async (): Promise<{ size: number; keys: number }> => {
  try {
    const cached = await AsyncStorage.getItem(PERSISTENCE_KEY);
    if (!cached) {
      return { size: 0, keys: 0 };
    }

    const parsed = JSON.parse(cached);
    const size = new Blob([cached]).size;
    const keys = parsed?.clientState?.queries?.length || 0;

    return { size, keys };
  } catch (error) {
    console.error("[QueryClient] Failed to get cache info:", error);
    return { size: 0, keys: 0 };
  }
};
