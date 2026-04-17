import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import uploadOrderApi from "@/apis/uploadOrder.api";
import { UploadOrderInterface, UploadOrderInput } from "@/interface";
import { QUERY_CONFIG } from "@/config/queryConfig";

/**
 * Hook to fetch the current user's upload orders
 * Uses dynamic config - orders change frequently (status updates)
 */
export const useUploadOrders = () => {
  return useQuery<UploadOrderInterface[]>({
    queryKey: ["uploadOrders"],
    queryFn: async () => {
      const response = await uploadOrderApi.getUploadOrders();
      return response.data.data;
    },
    ...QUERY_CONFIG.dynamic,
  });
};

/**
 * Hook to fetch a single upload order by ID
 * Uses detail config - single item view
 */
export const useUploadOrder = (id: string) => {
  return useQuery<UploadOrderInterface | null>({
    queryKey: ["uploadOrder", id],
    queryFn: async () => {
      const response = await uploadOrderApi.getUploadOrder(id);
      return response.data.data;
    },
    enabled: !!id,
    ...QUERY_CONFIG.detail,
  });
};

/**
 * Hook to create a new upload order
 */
export const useCreateUploadOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadOrderInput) => uploadOrderApi.createUploadOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadOrders"] });
    },
  });
};

/**
 * Hook to fetch all upload orders (admin)
 * Uses dynamic config - admin needs fresh data
 */
export const useAllUploadOrders = () => {
  return useQuery<UploadOrderInterface[]>({
    queryKey: ["uploadOrdersAdmin"],
    queryFn: async () => {
      const response = await uploadOrderApi.getAllUploadOrders();
      return response.data.data;
    },
    ...QUERY_CONFIG.dynamic,
  });
};

/**
 * Hook to update an upload order (admin)
 */
export const useUpdateUploadOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UploadOrderInterface> }) =>
      uploadOrderApi.updateUploadOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadOrders"] });
      queryClient.invalidateQueries({ queryKey: ["uploadOrdersAdmin"] });
    },
  });
};
