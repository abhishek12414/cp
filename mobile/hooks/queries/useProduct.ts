import { useQuery } from "@tanstack/react-query";

import apiClient from "@/apis/apiClient";
import { apiRoutes } from "@/apis/apiRoutes";
import { getQueryString } from "@/helpers/queryParams";
import { ApiResponseInterface, ProductInterface } from "@/interface";
import { QUERY_CONFIG } from "@/config/queryConfig";

const populate = "*";
export type ProductFilters = Record<string, unknown>;

/**
 * Hook to fetch products list with filters
 * Uses semiStatic config - products change occasionally
 */
export const useProducts = (filters: Record<string, unknown>) => {
  return useQuery<ProductInterface[]>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const config = getQueryString({ populate, ...filters });
      const url = `${apiRoutes.PRODUCTS}${config}`;

      const response = await apiClient.get<ApiResponseInterface<ProductInterface[]>>(url);
      return response.data.data;
    },
    ...QUERY_CONFIG.semiStatic,
  });
};

/**
 * Hook to fetch a single product by documentId
 * Uses detail config - single item view
 */
export const useProductByDocumentId = (documentId: string) => {
  return useQuery<ProductInterface | null>({
    queryKey: ["product", documentId],
    queryFn: async () => {
      const config = getQueryString({
        populate: ["category", "brand", "images", "attributeValues", "attributeValues.attribute"],
        filters: { documentId: { $eq: documentId } },
      });
      const url = `${apiRoutes.PRODUCTS}${config}`;

      const response = await apiClient.get<ApiResponseInterface<ProductInterface[]>>(url);
      return response.data.data[0] || null;
    },
    enabled: !!documentId,
    ...QUERY_CONFIG.detail,
  });
};

/**
 * Hook to search products by name or description
 * Uses search config - short-lived, user expects fresh results
 */
export const useSearchProducts = (query: string, enabled: boolean = true) => {
  return useQuery<ProductInterface[]>({
    queryKey: ["searchProducts", query],
    queryFn: async () => {
      const config = getQueryString({
        populate: ["images", "category", "brand"],
        filters: {
          $or: [{ name: { $containsi: query } }, { description: { $containsi: query } }],
        },
        pagination: { pageSize: 10 },
      });
      const url = `${apiRoutes.PRODUCTS}${config}`;

      const response = await apiClient.get<ApiResponseInterface<ProductInterface[]>>(url);
      return response.data.data;
    },
    enabled: enabled && query.length >= 2,
    ...QUERY_CONFIG.search,
  });
};
