import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import uploadOrderApi from "@/apis/uploadOrder.api";
import { UploadOrderInterface, UploadOrderInput } from "@/interface";

export const useUploadOrders = () => {
  return useQuery<UploadOrderInterface[]>({
    queryKey: ["uploadOrders"],
    queryFn: async () => {
      const response = await uploadOrderApi.getUploadOrders();
      return response.data.data;
    },
    initialData: [],
  });
};

export const useUploadOrder = (id: string) => {
  return useQuery<UploadOrderInterface | null>({
    queryKey: ["uploadOrder", id],
    queryFn: async () => {
      const response = await uploadOrderApi.getUploadOrder(id);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateUploadOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UploadOrderInput) => uploadOrderApi.createUploadOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadOrders"] });
    },
  });
};

// Admin hooks
export const useAllUploadOrders = () => {
  return useQuery<UploadOrderInterface[]>({
    queryKey: ["uploadOrdersAdmin"],
    queryFn: async () => {
      const response = await uploadOrderApi.getAllUploadOrders();
      return response.data.data;
    },
    initialData: [],
  });
};

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
