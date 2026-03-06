import { useQuery } from "@tanstack/react-query";

import apiClient from "@/apis/apiClient";
import { apiRoutes } from "@/apis/apiRoutes";
import { getQueryString } from "@/helpers/queryParams";
import { ApiResponse, CategoryInterface } from "@/interface";
import categoryApi from "@/apis/category.api";

const populate = ["image"];

export const useCategories = () => {
  return useQuery<CategoryInterface[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const config = getQueryString({ populate });
      const url = `${apiRoutes.CATEGORIES}${config}`;
      const response = await apiClient.get<ApiResponse<CategoryInterface[]>>(
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
