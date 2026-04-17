import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import addressApi from "@/apis/address.api";
import { AddressInterface, AddressInput } from "@/interface";
import { QUERY_CONFIG } from "@/config/queryConfig";

/**
 * Hook to fetch the current user's addresses
 * Uses semiStatic config - addresses change occasionally
 */
export const useAddresses = () => {
  return useQuery<AddressInterface[]>({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await addressApi.getAddresses();
      return response.data.data;
    },
    ...QUERY_CONFIG.semiStatic,
  });
};

/**
 * Hook to fetch a single address by ID
 * Uses detail config - single item view
 */
export const useAddress = (id: number | string) => {
  return useQuery<AddressInterface | null>({
    queryKey: ["address", id],
    queryFn: async () => {
      const response = await addressApi.getAddress(id);
      return response.data.data;
    },
    enabled: !!id,
    ...QUERY_CONFIG.detail,
  });
};

/**
 * Hook to create a new address
 */
export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddressInput) => addressApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

/**
 * Hook to update an existing address
 */
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<AddressInput> }) =>
      addressApi.updateAddress(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["address", variables.id] });
    },
  });
};

/**
 * Hook to delete an address
 */
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => addressApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

/**
 * Hook to set an address as primary
 */
export const useSetPrimaryAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => addressApi.setPrimary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};
