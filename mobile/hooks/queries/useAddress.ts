import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import addressApi from "@/apis/address.api";
import { AddressInterface, AddressInput } from "@/interface";

export const useAddresses = () => {
  return useQuery<AddressInterface[]>({
    queryKey: ["addresses"],
    queryFn: async () => {
      const response = await addressApi.getAddresses();
      return response.data.data;
    },
    initialData: [],
    staleTime: 0,
  });
};

export const useAddress = (id: number | string) => {
  return useQuery<AddressInterface | null>({
    queryKey: ["address", id],
    queryFn: async () => {
      const response = await addressApi.getAddress(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 0,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddressInput) => addressApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

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

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => addressApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

export const useSetPrimaryAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => addressApi.setPrimary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};
