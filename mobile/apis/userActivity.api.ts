import { ApiResponseInterface, ProductInterface } from "@/interface";
import apiClient from "./apiClient";
import { apiRoutes } from "./apiRoutes";

export interface TrackActivityInput {
  type: "search" | "product_view" | "product_purchase" | "category_view" | "brand_view";
  searchQuery?: string;
  product?: number;
  category?: number;
  brand?: number;
  metadata?: Record<string, any>;
}

export const userActivityApi = {
  // Track user activity
  trackActivity: (data: TrackActivityInput) => {
    return apiClient.post<ApiResponseInterface<any>>(apiRoutes.TRACK_ACTIVITY, { data });
  },

  // Get recent searches
  getRecentSearches: () => {
    return apiClient.get<ApiResponseInterface<string[]>>(apiRoutes.RECENT_SEARCHES);
  },

  // Get personalized recommendations
  getRecommendations: () => {
    return apiClient.get<ApiResponseInterface<ProductInterface[]>>(apiRoutes.RECOMMENDATIONS);
  },
};

export default userActivityApi;
