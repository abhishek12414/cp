import { useQuery } from "@tanstack/react-query";

import apiClient from "@/apis/apiClient";
import { apiRoutes } from "@/apis/apiRoutes";
import { getQueryString } from "@/helpers/queryParams";
import { ApiResponseInterface, CategoryInterface } from "@/interface";
import categoryApi from "@/apis/category.api";

const populate = ["image"];

export const useCategories = () => {
  return useQuery<CategoryInterface[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const config = getQueryString({ populate });
      const url = `${apiRoutes.CATEGORIES}${config}`;
      const response = await apiClient.get<ApiResponseInterface<CategoryInterface[]>>(
        url
      );
      return response.data.data;
    },
    initialData: [],
    staleTime: 0,
  });
};

export const useCategoriesForProducts = () => {
  return useQuery<CategoryInterface[]>({
    queryKey: ["categories", "withAttributes"],
    queryFn: async () => {
      const config = getQueryString({ populate: ["attributes"] });
      const url = `${apiRoutes.CATEGORIES}${config}`;
      const response = await apiClient.get<ApiResponseInterface<CategoryInterface[]>>(
        url
      );
      return response.data.data;
    },
    initialData: [],
    staleTime: 0,
  });
};

export const useCategoryByDocumentId = (
  documentId: CategoryInterface["documentId"]
) => {
  return useQuery<CategoryInterface>({
    queryKey: ["category", documentId],
    queryFn: async () => {
      const response = await categoryApi.getCategory(documentId);
      return response.data.data;
    },
    enabled: !!documentId,
  });
};

export const useCategoryWithAttributes = (
  documentId: CategoryInterface["documentId"]
) => {
  return useQuery<CategoryInterface>({
    queryKey: ["category", documentId, "withAttributes"],
    queryFn: async () => {
      const response = await categoryApi.getCategoryWithAttributes(documentId);
      return response.data.data;
    },
    enabled: !!documentId,
  });
};

// Hook to search categories by name
export const useSearchCategories = (query: string, enabled: boolean = true) => {
  return useQuery<CategoryInterface[]>({
    queryKey: ["searchCategories", query],
    queryFn: async () => {
      const config = getQueryString({
        populate: ["image"],
        filters: {
          name: { $containsi: query },
        },
        pagination: { pageSize: 10 },
      });
      const url = `${apiRoutes.CATEGORIES}${config}`;

      const response = await apiClient.get<ApiResponseInterface<CategoryInterface[]>>(url);
      return response.data.data;
    },
    enabled: enabled && query.length >= 2,
    staleTime: 0,
  });
};
