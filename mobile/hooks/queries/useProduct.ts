import { useQuery } from "@tanstack/react-query";

import apiClient from "@/apis/apiClient";
import { apiRoutes } from "@/apis/apiRoutes";
import { getQueryString } from "@/helpers/queryParams";
import { ApiResponseInterface, ProductInterface } from "@/interface";

const populate = "*";
export type ProductFilters = Record<string, any>;

export const useProducts = (filters: Record<string, any>) => {
  return useQuery<ProductInterface[]>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const config = getQueryString({ populate, ...filters });
      const url = `${apiRoutes.PRODUCTS}${config}`;

      const response = await apiClient.get<ApiResponseInterface<ProductInterface[]>>(
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
        populate: ["category", "brand", "images", "attributeValues", "attributeValues.attribute"],
        filters: { documentId: { $eq: documentId } },
      });
      const url = `${apiRoutes.PRODUCTS}${config}`;

      const response = await apiClient.get<ApiResponseInterface<ProductInterface[]>>(
        url
      );
      return response.data.data[0] || null;
    },
    enabled: !!documentId,
    staleTime: 0,
  });
};

// Hook to search products by name or description
export const useSearchProducts = (query: string, enabled: boolean = true) => {
  return useQuery<ProductInterface[]>({
    queryKey: ["searchProducts", query],
    queryFn: async () => {
      const config = getQueryString({
        populate: ["images", "category", "brand"],
        filters: {
          $or: [
            { name: { $containsi: query } },
            { description: { $containsi: query } },
          ],
        },
        pagination: { pageSize: 10 },
      });
      const url = `${apiRoutes.PRODUCTS}${config}`;

      const response = await apiClient.get<ApiResponseInterface<ProductInterface[]>>(url);
      return response.data.data;
    },
    enabled: enabled && query.length >= 2,
    staleTime: 0,
  });
};
