import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import userActivityApi, { TrackActivityInput } from "@/apis/userActivity.api";
import { ProductInterface } from "@/interface";

export const useTrackActivity = () => {
  return useMutation({
    mutationFn: (data: TrackActivityInput) => userActivityApi.trackActivity(data),
  });
};

export const useRecentSearches = () => {
  return useQuery<string[]>({
    queryKey: ["recentSearches"],
    queryFn: async () => {
      const response = await userActivityApi.getRecentSearches();
      return response.data.data;
    },
    initialData: [],
  });
};

export const useRecommendations = () => {
  return useQuery<ProductInterface[]>({
    queryKey: ["recommendations"],
    queryFn: async () => {
      const response = await userActivityApi.getRecommendations();
      return response.data.data;
    },
    initialData: [],
  });
};
