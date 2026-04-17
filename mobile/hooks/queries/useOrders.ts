import apiClient from "@/apis/apiClient";
import { useQuery } from "@tanstack/react-query";
import { QUERY_CONFIG } from "@/config/queryConfig";

/**
 * Hook to fetch the current user's orders
 * Uses dynamic config - orders change frequently (status updates)
 */
export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => apiClient.get("/orders").then((res) => res.data),
    ...QUERY_CONFIG.dynamic,
  });
};

/**
 * Hook to fetch a single order by ID
 * Uses detail config - single item view
 */
export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => apiClient.get(`/orders/${orderId}`).then((res) => res.data),
    enabled: !!orderId,
    ...QUERY_CONFIG.detail,
  });
};
