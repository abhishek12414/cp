import apiClient from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import { AddressInterface, AddressInput, ApiResponseInterface } from "@/interface";

export const addressApi = {
  // GET /api/addresses - Get all addresses for current user
  getAddresses: () => {
    return apiClient.get<ApiResponseInterface<AddressInterface[]>>(apiRoutes.ADDRESSES);
  },

  // GET /api/addresses/:id - Get single address
  getAddress: (id: number | string) => {
    return apiClient.get<ApiResponseInterface<AddressInterface>>(apiRoutes.ADDRESS(id.toString()));
  },

  // POST /api/addresses - Create new address
  createAddress: (data: AddressInput) => {
    return apiClient.post<ApiResponseInterface<AddressInterface>>(apiRoutes.ADDRESSES, {
      data,
    });
  },

  // PUT /api/addresses/:id - Update address
  updateAddress: (id: number | string, data: Partial<AddressInput>) => {
    return apiClient.put<ApiResponseInterface<AddressInterface>>(apiRoutes.ADDRESS(id.toString()), {
      data,
    });
  },

  // DELETE /api/addresses/:id - Delete address
  deleteAddress: (id: number | string) => {
    return apiClient.delete(apiRoutes.ADDRESS(id.toString()));
  },

  // POST /api/addresses/:id/set-primary - Set address as primary
  setPrimary: (id: number | string) => {
    return apiClient.post<ApiResponseInterface<AddressInterface>>(apiRoutes.ADDRESS_SET_PRIMARY(id.toString()));
  },
};

export default addressApi;
