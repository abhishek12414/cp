import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import userActivityApi, { TrackActivityInput } from "@/apis/userActivity.api";
import { ProductInterface } from "@/interface";
import { QUERY_CONFIG } from "@/config/queryConfig";

/**
 * Hook to track user activity
 * This is a mutation, no stale time needed
 */
export const useTrackActivity = () => {
  return useMutation({
    mutationFn: (data: TrackActivityInput) => userActivityApi.trackActivity(data),
  });
};

/**
 * Hook to fetch recent searches
 * Uses semiStatic config - searches change occasionally
 */
export const useRecentSearches = () => {
  return useQuery<string[]>({
    queryKey: ["recentSearches"],
    queryFn: async () => {
      const response = await userActivityApi.getRecentSearches();
      return response.data.data;
    },
    ...QUERY_CONFIG.semiStatic,
  });
};

/**
 * Hook to fetch product recommendations
 * Uses semiStatic config - recommendations are computed, not real-time
 */
export const useRecommendations = () => {
  return useQuery<ProductInterface[]>({
    queryKey: ["recommendations"],
    queryFn: async () => {
      const response = await userActivityApi.getRecommendations();
      return response.data.data;
    },
    ...QUERY_CONFIG.semiStatic,
  });
};
