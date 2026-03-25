import apiClient from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import { UploadOrderInterface, UploadOrderInput, ApiResponseInterface } from "@/interface";

export const uploadOrderApi = {
  // Get user's upload orders
  getUploadOrders: () => {
    return apiClient.get<ApiResponseInterface<UploadOrderInterface[]>>(apiRoutes.UPLOAD_ORDERS);
  },

  // Get single upload order
  getUploadOrder: (id: string) => {
    return apiClient.get<ApiResponseInterface<UploadOrderInterface>>(apiRoutes.UPLOAD_ORDER(id));
  },

  // Create new upload order
  createUploadOrder: (data: UploadOrderInput) => {
    return apiClient.post<ApiResponseInterface<UploadOrderInterface>>(apiRoutes.UPLOAD_ORDERS, {
      data,
    });
  },

  // Admin: Get all upload orders
  getAllUploadOrders: () => {
    return apiClient.get<ApiResponseInterface<UploadOrderInterface[]>>(apiRoutes.UPLOAD_ORDERS_ADMIN);
  },

  // Admin: Update upload order
  updateUploadOrder: (id: string, data: Partial<UploadOrderInterface>) => {
    return apiClient.put<ApiResponseInterface<UploadOrderInterface>>(
      apiRoutes.UPLOAD_ORDER_ADMIN(id),
      { data }
    );
  },
};

export default uploadOrderApi;
