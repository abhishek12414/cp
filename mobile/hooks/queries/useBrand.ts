import { useQuery } from "@tanstack/react-query";

import apiClient from "@/apis/apiClient";
import { apiRoutes } from "@/apis/apiRoutes";
import { getQueryString } from "@/helpers/queryParams";
import { ApiResponse, BrandInterface } from "@/interface";

const populate = ["logo"];

export const useBrand = () => {
  return useQuery<BrandInterface[]>({
    queryKey: ["brands"],
    queryFn: async () => {
      const config = getQueryString({ populate });
      const url = `${apiRoutes.BRANDS}${config}`;

      const response = await apiClient.get<ApiResponse<BrandInterface[]>>(url);
      return response.data.data;
    },
    initialData: [],
    staleTime: 0,
  });
};
