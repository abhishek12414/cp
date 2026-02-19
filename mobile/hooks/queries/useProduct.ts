import { useQuery } from "@tanstack/react-query";

import apiClient from "@/apis/apiClient";
import { apiRoutes } from "@/apis/apiRoutes";
import { getQueryString } from "@/helpers/queryParams";
import { ApiResponse, ProductInterface } from "@/interface";

const populate = "*";
export type ProductFilters = Record<string, any>;

export const useProducts = (filters: Record<string, any>) => {
  return useQuery<ProductInterface[]>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const config = getQueryString({ populate, ...filters });
      const url = `${apiRoutes.PRODUCTS}${config}`;

      const response = await apiClient.get<ApiResponse<ProductInterface[]>>(
        url
      );
      return response.data.data;
    },
    initialData: [],
    staleTime: 0,
  });
};

export const useProductByDocumentId = (documentId: string) => {
  return useQuery<ProductInterface | null>({
    queryKey: ["product", documentId],
    queryFn: async () => {
      const config = getQueryString({
        populate,
        filters: { documentId: { $eq: documentId } },
      });
      const url = `${apiRoutes.PRODUCTS}${config}`;

      const response = await apiClient.get<ApiResponse<ProductInterface[]>>(
        url
      );
      return response.data.data[0] || null;
    },
    enabled: !!documentId,
    staleTime: 0,
  });
};
